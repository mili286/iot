import { configDotenv } from "dotenv";
import app from "./app";
import { connect } from "./infrastructure/database/database";

const PORT = process.env.PORT || 3000;

configDotenv();

const startServer = async () => {
  try {
    await connect();
    app.listen(PORT, () => {
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
