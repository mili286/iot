import "reflect-metadata";
import { configDotenv } from "dotenv";
import { createServer } from "http";
import app from "./app";
import { connect } from "./infrastructure/database/database";
import { container } from "./di/container";
import { TYPES } from "./shared/types/common.types";
import { SocketService } from "./infrastructure/socket/socket.service";
import { ISystemParametersRepository } from "./domain/repositories/system-parameters.repository.interface";

const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);
const socketService = container.get<SocketService>(TYPES.SocketService);
const systemParametersRepository = container.get<ISystemParametersRepository>(
  TYPES.SystemParametersRepository,
);

configDotenv();

const startServer = async () => {
  try {
    await connect();

    // Initialize System Parameters
    await systemParametersRepository.initializeSystemParameters();

    // Initialize Socket.io
    socketService.initialize(httpServer);

    httpServer.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(
        `Swagger documentation is available at http://localhost:${PORT}/api-docs`,
      );
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
