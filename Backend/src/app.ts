import { Application } from "express";
import express, { Request, Response } from "express";
import { configDotenv } from "dotenv";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./presentation/http/routes/user.routes";
import authRoutes from "./presentation/http/routes/auth.routes";
import { errorHandler } from "./presentation/http/middleware/error-handler.middleware";
import passport from "passport";
import { configurePassport } from "./infrastructure/auth/passport.config";

configDotenv();

const app: Application = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
configurePassport();

// User Context Middleware
// app.use(userContextMiddleware());

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IoT Backend API",
      version: "1.0.0",
      description: "API documentation for the IoT Backend project",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/presentation/http/routes/*.ts", "./src/app.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to the IoT Backend API
 *     responses:
 *       200:
 *         description: Returns a welcome message.
 */
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the IoT Backend API" });
});

/**
 * @openapi
 * /health:
 *   get:
 *     description: Health check endpoint
 *     responses:
 *       200:
 *         description: Returns the health status.
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// Error handling
app.use(errorHandler);

export default app;
