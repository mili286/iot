import mongoose from "mongoose";
import "reflect-metadata";

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
const connectionString = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
export const connect = async () => {
  await mongoose.connect(connectionString, {
    user: DB_USERNAME,
    pass: DB_PASSWORD,
  });

  const database = mongoose.connection;

  database.on("error", console.error.bind(console, "connection error:"));
  database.once("open", () => {
    console.log("Connected to database!");
  });
};
