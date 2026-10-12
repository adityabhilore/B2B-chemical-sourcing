// src/modules/customer/customer.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Customer account business logic.
// ─────────────────────────────────────────────────────────────────────────────

import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma.js";
import { sanitiseUser, sanitiseCustomerProfile } from "../../utils/sanitise.js";
import { notFound, badRequest } from "../../utils/AppError.js";

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) throw notFound("User not found");

  const sanitised = sanitiseUser(user);
  if (sanitised.profile) {
    sanitised.profile = sanitiseCustomerProfile(sanitised.profile);
  }
  return sanitised;
}

export async function updateMe(userId, data) {
  const { fullName, phone, companyName, businessType, alternatePhone, website } = data;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(phone !== undefined && { phone }),
      },
    }),
    prisma.customerProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyName,
        businessType,
        alternatePhone,
        website,
      },
      update: {
        ...(companyName !== undefined && { companyName }),
        ...(businessType !== undefined && { businessType }),
        ...(alternatePhone !== undefined && { alternatePhone }),
        ...(website !== undefined && { website }),
      },
    }),
  ]);

  return getMe(userId);
}

// ─── Addresses (stored as JSON array in CustomerProfile.addresses) ────────────

async function getProfile(userId) {
  const profile = await prisma.customerProfile.findUnique({ where: { userId } });
  if (!profile) {
    // Create if doesn't exist (edge case: old users before profile was required)
    return prisma.customerProfile.create({ data: { userId } });
  }
  return profile;
}

export async function listAddresses(userId) {
  const profile = await getProfile(userId);
  return profile.addresses ?? [];
}

export async function addAddress(userId, addressData) {
  const profile = await getProfile(userId);
  const addresses = [...(profile.addresses ?? [])];

  const newAddr = { id: randomUUID(), ...addressData };

  // If isDefault set, clear existing defaults
  if (newAddr.isDefault) {
    addresses.forEach((a) => (a.isDefault = false));
  }

  // If this is the first address, make it default
  if (addresses.length === 0) newAddr.isDefault = true;

  addresses.push(newAddr);

  await prisma.customerProfile.update({
    where: { userId },
    data: { addresses },
  });

  return newAddr;
}

export async function updateAddress(userId, addressId, updates) {
  const profile = await getProfile(userId);
  const addresses = [...(profile.addresses ?? [])];
  const idx = addresses.findIndex((a) => a.id === addressId);

  if (idx === -1) throw notFound("Address not found");

  // If setting this as default, clear others
  if (updates.isDefault) {
    addresses.forEach((a) => (a.isDefault = false));
  }

  addresses[idx] = { ...addresses[idx], ...updates, id: addressId };

  await prisma.customerProfile.update({
    where: { userId },
    data: { addresses },
  });

  return addresses[idx];
}

export async function deleteAddress(userId, addressId) {
  const profile = await getProfile(userId);
  const addresses = (profile.addresses ?? []).filter((a) => a.id !== addressId);

  if (addresses.length === (profile.addresses ?? []).length) {
    throw notFound("Address not found");
  }

  // If we deleted the default, make the first remaining one default
  if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
    addresses[0].isDefault = true;
  }

  await prisma.customerProfile.update({
    where: { userId },
    data: { addresses },
  });
}

// ─── Orders (read-only — customer view) ──────────────────────────────────────

export async function listMyOrders(userId, { skip, take }) {
  const [orders, total] = await Promise.all([
    prisma.orderRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            snapshotProductName: true,
            snapshotVariantLabel: true,
            snapshotPrice: true,
            snapshotCurrency: true,
            lineTotal: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 1, // just the latest status change
        },
      },
    }),
    prisma.orderRequest.count({ where: { userId } }),
  ]);

  // Strip private fields
  const sanitised = orders.map(({ adminNotes, idempotencyKey, ...o }) => o);
  return { orders: sanitised, total };
}

export async function getMyOrder(userId, orderId) {
  const order = await prisma.orderRequest.findFirst({
    where: { id: orderId, userId },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) throw notFound("Order not found");

  // Strip private fields
  // eslint-disable-next-line no-unused-vars
  const { adminNotes, idempotencyKey, ...sanitised } = order;
  // Supplier/source snapshots are restricted to admin order detail responses.
  sanitised.items = sanitised.items.map(({ snapshotSource, ...item }) => item);
  return sanitised;
}
