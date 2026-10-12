// src/modules/customer/customer.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Thin HTTP layer for customer account routes.
// ─────────────────────────────────────────────────────────────────────────────

import * as svc from "./customer.service.js";
import * as authService from "../auth/auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/apiResponse.js";

// GET /api/customer/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await svc.getMe(req.user.id);
  sendSuccess(res, { user });
});

// PATCH /api/customer/me
export const updateMe = asyncHandler(async (req, res) => {
  const user = await svc.updateMe(req.user.id, req.body);
  sendSuccess(res, { user }, "Profile updated");
});

// PATCH /api/customer/me/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
  // Clear refresh cookie — user must log in again
  authService.clearRefreshCookie(res);
  sendSuccess(res, result, "Password updated");
});

// GET /api/customer/addresses
export const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await svc.listAddresses(req.user.id);
  sendSuccess(res, { addresses });
});

// POST /api/customer/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const address = await svc.addAddress(req.user.id, req.body);
  sendSuccess(res, { address }, "Address added", 201);
});

// PATCH /api/customer/addresses/:addressId
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await svc.updateAddress(req.user.id, req.params.addressId, req.body);
  sendSuccess(res, { address }, "Address updated");
});

// DELETE /api/customer/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  await svc.deleteAddress(req.user.id, req.params.addressId);
  sendSuccess(res, null, "Address deleted");
});

// GET /api/customer/orders
export const listOrders = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = parsePagination(req.query);
  const { orders, total } = await svc.listMyOrders(req.user.id, { skip, take });
  sendSuccess(res, { orders, meta: buildMeta({ page, limit, total }) });
});

// GET /api/customer/orders/:orderId
export const getOrder = asyncHandler(async (req, res) => {
  const order = await svc.getMyOrder(req.user.id, req.params.orderId);
  sendSuccess(res, { order });
});
