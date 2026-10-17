import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const sendMail = vi.hoisted(() => vi.fn().mockResolvedValue({ ok: false, error: 'Email disabled in integration tests' }));
vi.mock('../src/lib/mailer.js', () => ({ sendMail, verifyMailer: vi.fn() }));

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) throw new Error('TEST_DATABASE_URL is required; run integration tests only against a dedicated test database.');
const parsedTestUrl = new URL(testUrl);
if (!parsedTestUrl.pathname.toLowerCase().includes('test')) throw new Error('Refusing integration tests unless TEST_DATABASE_URL names a dedicated database containing "test".');
process.env.DATABASE_URL = testUrl;

const { prisma } = await import('../src/lib/prisma.js');
const { default: app } = await import('../src/app.js');
const prefix = `ci-${randomUUID()}`;
const customerEmail = `${prefix}@example.invalid`;
const adminEmail = `${prefix}-admin@example.invalid`;
let customer;
let admin;
let product;
let variant;
let firstRuleName;

const tokenFor = user => jwt.sign({ sub: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '5m' });
const orderBody = key => ({
  items: [{ productId: product.id, variantId: variant.id, quantity: 1 }],
  deliveryState: 'KA',
  shippingAddress: { name: 'Integration Buyer', phone: '9876543210', line1: '1 Test Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  idempotencyKey: key,
});

describe('PostgreSQL migrations and business constraints', () => {
  beforeAll(async () => {
    await prisma.$connect();
    customer = await prisma.user.create({ data: { email: customerEmail, passwordHash: 'not-a-real-password-hash', fullName: 'Integration Customer', role: 'CUSTOMER', isApproved: true } });
    admin = await prisma.user.create({ data: { email: adminEmail, passwordHash: 'not-a-real-password-hash', fullName: 'Integration Admin', role: 'ADMIN', isApproved: true } });
    product = await prisma.product.create({
      data: {
        name: `${prefix} test chemical`, slug: `${prefix}-chemical`, status: 'ACTIVE', sourceType: 'OUR_COMPANY', pricingMode: 'REQUEST_QUOTE', tags: [], specifications: {},
        variants: { create: { sku: `${prefix}-sku`, label: '1 kg test package', unit: 'kg', pricingMode: 'REQUEST_QUOTE', stockStatus: 'ON_REQUEST', attributes: {} } },
      }, include: { variants: true },
    });
    variant = product.variants[0];
  }, 30000);

  afterAll(async () => {
    if (customer?.id) {
      await prisma.notificationLog.deleteMany({ where: { userId: customer.id } });
      await prisma.orderRequest.deleteMany({ where: { userId: customer.id } });
    }
    await prisma.shippingRule.deleteMany({ where: { name: { startsWith: prefix } } });
    await prisma.product.deleteMany({ where: { slug: { startsWith: prefix } } });
    await prisma.user.deleteMany({ where: { email: { in: [customerEmail, adminEmail] } } });
    await prisma.$disconnect();
  }, 30000);

  it('has applied the complete migration history', async () => {
    const rows = await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`;
    expect(rows[0].count).toBeGreaterThanOrEqual(1);
  });

  it('enforces a database unique constraint on product slugs', async () => {
    await expect(prisma.product.create({ data: { name: 'Duplicate slug', slug: product.slug, sourceType: 'OUR_COMPANY', tags: [], specifications: {} } })).rejects.toMatchObject({ code: 'P2002' });
  });

  it('isolates admin routes from customer roles against real user rows', async () => {
    const response = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${tokenFor(customer)}`);
    expect(response.status).toBe(403);
  });

  it('rejects overlapping active shipping rules through the API and PostgreSQL', async () => {
    const authorization = `Bearer ${tokenFor(admin)}`;
    firstRuleName = `${prefix}-shipping-one`;
    const body = { name: firstRuleName, originState: 'KA', destinationState: 'MH', basePrice: 100, minWeightKg: 1, maxWeightKg: 10, minOrderValue: 0, maxOrderValue: 5000, sortOrder: 0, isActive: true };
    const first = await request(app).post('/api/shipping/admin/rules').set('Authorization', authorization).send(body);
    expect(first.status).toBe(201);
    const second = await request(app).post('/api/shipping/admin/rules').set('Authorization', authorization).send({ ...body, name: `${prefix}-shipping-overlap`, minWeightKg: 5, maxWeightKg: 15 });
    expect(second.status).toBe(409);
    expect(await prisma.shippingRule.count({ where: { name: `${prefix}-shipping-overlap` } })).toBe(0);
  });

  it('creates one order for concurrent submissions with the same idempotency key', async () => {
    const key = randomUUID();
    const submit = () => request(app).post('/api/orders/order-request').set('Authorization', `Bearer ${tokenFor(customer)}`).send(orderBody(key));
    const responses = await Promise.all([submit(), submit()]);
    expect(responses.map(response => response.status).sort()).toEqual([200, 201]);
    expect(await prisma.orderRequest.count({ where: { idempotencyKey: key } })).toBe(1);
  });

  it('allocates distinct order numbers for simultaneous separate requests', async () => {
    const keys = [randomUUID(), randomUUID()];
    const responses = await Promise.all(keys.map(key => request(app).post('/api/orders/order-request').set('Authorization', `Bearer ${tokenFor(customer)}`).send(orderBody(key))));
    expect(responses.map(response => response.status)).toEqual([201, 201]);
    const numbers = responses.map(response => response.body.data.order.orderNumber);
    expect(new Set(numbers).size).toBe(2);
    expect(await prisma.orderRequest.count({ where: { orderNumber: { in: numbers } } })).toBe(2);
  });
});
