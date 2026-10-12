// src/modules/customer/customer.schemas.js
// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas for customer account routes.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { changePasswordSchema } from "../auth/auth.schemas.js";

export { changePasswordSchema };

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  companyName: z.string().max(200).optional(),
  businessType: z.string().max(100).optional(),
  alternatePhone: z.string().max(20).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

const addressSchema = z.object({
  id: z.string().optional(), // client-generated for update
  label: z.string().max(50).optional(),  // e.g. "Head Office", "Warehouse"
  name: z.string().min(2).max(100),
  phone: z.string().max(20),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().min(6).max(10),
  isDefault: z.boolean().optional(),
});

export const addAddressSchema = addressSchema;
export const updateAddressSchema = addressSchema.partial().extend({
  id: z.string().min(1),
});
