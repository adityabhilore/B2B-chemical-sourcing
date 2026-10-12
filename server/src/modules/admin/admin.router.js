import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireAdmin } from "../../middleware/authorise.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/me", asyncHandler(async (req, res) => {
  sendSuccess(res, { user: { id: req.user.id, email: req.user.email, role: req.user.role } });
}));

export default router;
