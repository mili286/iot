import { Router } from "express";
import { container } from "../../../di/container";
import { TYPES } from "../../../shared/types/common.types";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const userController = container.get<UserController>(TYPES.UserController);

/**
 * @openapi
 * /api/users/me:
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
router.get("/me", authenticate, (req, res) =>
  userController.getCurrentUser(req, res),
);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, (req, res) => userController.getUsers(req, res));

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authenticate, (req, res) =>
  userController.getUserById(req, res),
);

export default router;
