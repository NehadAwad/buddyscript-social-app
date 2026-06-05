import "reflect-metadata";
import "./config/env";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import {
  AppDataSource,
  checkDatabaseConnection,
  initializeDatabase,
} from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import apiRoutes from "./routes";

const app = express();
const port = Number(process.env.BACKEND_PORT) || 4000;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", async (_req, res) => {
  const databaseConnected = await checkDatabaseConnection();

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "degraded",
    service: "appifylab-backend",
    database: databaseConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

async function bootstrap(): Promise<void> {
  try {
    await initializeDatabase();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

process.on("SIGINT", async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(0);
});

bootstrap();
