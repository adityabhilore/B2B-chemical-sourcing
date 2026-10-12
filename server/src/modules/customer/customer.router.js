// src/modules/customer/customer.router.js
// ─────────────────────────────────────────────────────────────────────────────
// Customer account routes — mounted at /api/customer in src/index.js
// All routes require: authenticate + authorise("CUSTOMER","ADMIN")
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { customerOrAdmin } from "../../middleware/authorise.js";
import { validate } from "../../middleware/validate.js";
import {
  updateProfileSchema,
  addAddressSchema,
  updateAddressSchema,
  changePasswordSchema,
} from "./customer.schemas.js";
import * as ctrl from "./customer.controller.js";

const router = Router();

// All customer routes require a valid JWT
router.use(authenticate, customerOrAdmin);

// ─── Profile ─────────────────────────────────────────────────────────────────
router.get("/me",              ctrl.getMe);
router.patch("/me",            validate(updateProfileSchema),  ctrl.updateMe);
router.patch("/me/password",   validate(changePasswordSchema), ctrl.changePassword);

// ─── Addresses ───────────────────────────────────────────────────────────────
router.get("/addresses",                                       ctrl.listAddresses);
router.post("/addresses",      validate(addAddressSchema),     ctrl.addAddress);
router.patch("/addresses/:addressId", validate(updateAddressSchema), ctrl.updateAddress);
router.delete("/addresses/:addressId",                         ctrl.deleteAddress);

// ─── Orders (read-only — submit handled in order module) ─────────────────────
router.get("/orders",          ctrl.listOrders);
router.get("/orders/:orderId", ctrl.getOrder);

export default router;
