import { Router } from "express";
import { container } from "../../../di/container";
import { TYPES } from "../../../shared/types/common.types";
import { UserController } from "../controllers/user.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { userContextMiddleware } from "../middleware/user-context.middleware";

const router = Router();
const userController = container.get<UserController>(TYPES.UserController);

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticateJWT, userContextMiddleware, (req, res) =>
  userController.getCurrentUser(req, res),
);

export default router;
