import { Router } from "express";
import { container } from "../../../di/container";
import { TYPES } from "../../../shared/types/common.types";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login and get JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post("/login", (req, res) => authController.login(req, res));

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       204:
 *         description: No content
 */
router.post("/register", (req, res) => authController.register(req, res));

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authToken:
 *                 type: string
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refresh successful
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */
router.post("/refresh-token", (req, res) =>
  authController.refreshToken(req, res),
);

export default router;
