import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const { prisma, mailer } = vi.hoisted(() => {
  const fn = () => vi.fn();
  return {
    prisma: {
      user: { findUnique: fn(), findFirst: fn(), create: fn(), update: fn(), count: fn(), findMany: fn() },
      category: { count: fn(), findUnique: fn(), delete: fn() },
      brand: { count: fn() },
      product: { count: fn(), findMany: fn(), findFirst: fn() },
      productVariant: { findMany: fn() },
      orderRequest: { count: fn(), create: fn(), findUnique: fn(), findFirst: fn(), findMany: fn(), groupBy: fn(), update: fn() },
      orderStatusHistory: { create: fn() },
      notificationLog: { create: fn(), update: fn(), findUnique: fn() },
      $transaction: fn(),
    },
    mailer: { sendMail: vi.fn() },
  };
});

vi.mock('../src/lib/prisma.js', () => ({ prisma }));
vi.mock('../src/lib/mailer.js', () => mailer);

const { default: app } = await import('../src/app.js');
const { toPublicProductDTO } = await import('../src/utils/productDto.js');
const { sanitizeHtml } = await import('../src/utils/sanitizeHtml.js');
const jwt = await import('jsonwebtoken');
const token = () => jwt.default.sign({ sub: 'test-user' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '5m' });

beforeEach(() => {
  vi.clearAllMocks();
  prisma.user.findUnique.mockResolvedValue({ id: 'test-user', email: 'test@example.test', role: 'CUSTOMER', isActive: true });
  prisma.user.findFirst.mockResolvedValue(null);
  prisma.product.findMany.mockResolvedValue([]);
  prisma.product.count.mockResolvedValue(0);
  prisma.category.count.mockResolvedValue(0);
  prisma.orderRequest.findFirst.mockResolvedValue(null);
  mailer.sendMail.mockResolvedValue({ ok: false, error: 'SMTP unavailable' });
});

describe('API security and business rules', () => {
  it('validates auth input before persistence', async () => {
    const response = await request(app).post('/api/auth/login').send({});
    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'email' })]));
  });

  it('rejects customer access to admin APIs', async () => {
    const response = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(403);
  });

  it('prevents category deletion when products are assigned', async () => {
    prisma.user.findUnique.mockResolvedValue({ id:'test-user',email:'test@example.test',role:'ADMIN',isActive:true });
    prisma.category.count.mockResolvedValue(0);
    prisma.product.count.mockResolvedValue(2);
    const response = await request(app).delete('/api/catalogue/admin/categories/category-1').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(409);
    expect(prisma.category.delete).not.toHaveBeenCalled();
  });

  it('public product listing queries published products only', async () => {
    const response = await request(app).get('/api/products/public');
    expect(response.status).toBe(200);
    expect(prisma.product.findMany.mock.calls[0][0].where).toMatchObject({ status: 'ACTIVE', deletedAt: null });
  });

  it('strips supplier and internal product fields from public DTOs', () => {
    const dto = toPublicProductDTO({ id:'p',name:'Solvent',slug:'solvent',sourceType:'OTHER_COMPANY',supplierCompanyId:'private',supplierCompany:{name:'Private Supplier'},supplier:{contactEmail:'private@example.test'},purchasePriceRef:99,internalNotes:'private',category:null,brand:null,manufacturer:null,manufacturerCompany:null,sellerCompany:null,images:[],documents:[],variants:[] });
    for (const key of ['sourceType','supplierCompanyId','supplierCompany','supplier','purchasePriceRef','internalNotes']) expect(dto).not.toHaveProperty(key);
  });

  it('sanitizes blog scripts, event handlers, and unsafe links', () => {
    const html=sanitizeHtml('<script>alert(1)</script><p onclick="run()">safe <a href="javascript:alert(1)">link</a></p>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('<p>safe <a>link</a></p>');
  });

  it('does not return another customer’s order', async () => {
    const response = await request(app).get('/api/customer/orders/foreign-order').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(404);
    expect(prisma.orderRequest.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id:'foreign-order', userId:'test-user' } }));
  });

  it('calculates order totals on the server and keeps the order when email fails', async () => {
    prisma.product.findMany.mockResolvedValue([{ id:'product-1',name:'Reagent',status:'ACTIVE',deletedAt:null,pricingMode:'FIXED',basePrice:999,minOrderQuantity:1,trackStock:false,brand:null,manufacturer:null,manufacturerCompany:null,sellerCompany:{name:'Seller'},supplierCompany:null,supplier:null,sourceType:'OUR_COMPANY',variants:[{id:'variant-1',isActive:true,moq:2,stockStatus:'IN_STOCK',pricingMode:'FIXED',price:75,currency:'INR',unit:'kg',sku:'SKU-1',label:'10 kg drum',name:'10 kg drum',packageSize:'10',packageUnit:'kg',attributes:{}}] }]);
    const tx={orderRequest:{count:vi.fn().mockResolvedValue(0),create:vi.fn().mockResolvedValue({id:'order-1',orderNumber:'CHM-2026-000001',userId:'test-user',items:[]})},orderStatusHistory:{create:vi.fn().mockResolvedValue({})}};
    prisma.$transaction.mockImplementation(async callback=>callback(tx));
    prisma.notificationLog.create.mockResolvedValue({id:'notification-1'});
    prisma.notificationLog.update.mockResolvedValue({});
    const response=await request(app).post('/api/orders/order-request').set('Authorization',`Bearer ${token()}`).send({items:[{productId:'product-1',variantId:'variant-1',quantity:2,price:0}],estimatedTotal:0,deliveryState:'Maharashtra',shippingAddress:{name:'Test Customer',phone:'1234567890',line1:'123 Test Road',city:'Pune',state:'Maharashtra',pincode:'411001'},idempotencyKey:'f7c1b205-5532-4abe-a2f9-a6db1d1ab928'});
    expect(response.status).toBe(201);
    expect(tx.orderRequest.create.mock.calls[0][0].data.estimatedTotal).toBe(150);
    expect(tx.orderRequest.create.mock.calls[0][0].data.estimatedTotal).not.toBe(0);
    expect(prisma.notificationLog.update).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({status:'FAILED',error:'SMTP unavailable'})}));
  });

  it('rejects quantity below product MOQ before creating an order', async () => {
    prisma.product.findMany.mockResolvedValue([{ id:'product-1',name:'Reagent',status:'ACTIVE',deletedAt:null,minOrderQuantity:5,variants:[{id:'variant-1',isActive:true,moq:1,stockStatus:'IN_STOCK'}] }]);
    const response=await request(app).post('/api/orders/order-request').set('Authorization',`Bearer ${token()}`).send({items:[{productId:'product-1',variantId:'variant-1',quantity:2}],deliveryState:'Maharashtra',shippingAddress:{name:'Test Customer',phone:'1234567890',line1:'123 Test Road',city:'Pune',state:'Maharashtra',pincode:'411001'}});
    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('records order status history for every accepted transition', async () => {
    prisma.user.findUnique.mockResolvedValue({ id:'test-user',email:'test@example.test',role:'ADMIN',isActive:true });
    prisma.orderRequest.findUnique.mockResolvedValue({id:'order-1',status:'PENDING',estimatedTotal:50});
    const tx={orderRequest:{update:vi.fn().mockResolvedValue({id:'order-1',status:'CONFIRMED'})},orderStatusHistory:{create:vi.fn().mockResolvedValue({})}};
    prisma.$transaction.mockImplementation(async callback=>callback(tx));
    const response=await request(app).patch('/api/orders/admin/order-1/status').set('Authorization',`Bearer ${token()}`).send({status:'CONFIRMED',note:'Price confirmed'});
    expect(response.status).toBe(200);
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({data:expect.objectContaining({orderRequestId:'order-1',fromStatus:'PENDING',toStatus:'CONFIRMED',note:'Price confirmed'})});
  });
});
