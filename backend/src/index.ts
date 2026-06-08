import "reflect-metadata";
import "./config/env";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import { corsOptions } from "./config/cors";
import { configureHelmet } from "./config/helmet";
import {
  AppDataSource,
  checkDatabaseConnection,
  initializeDatabase,
} from "./config/database";
import { csrfProtection } from "./middleware/csrf.middleware";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger.middleware";
import { formatMemoryMb, logError, logInfo } from "./utils/logger";
import apiRoutes from "./routes";
import {
  serveUploadWithFallback,
  staticAssetsDir,
} from "./utils/postImage";

const app = express();
const port = Number(process.env.PORT) || Number(process.env.BACKEND_PORT) || 4000;

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(configureHelmet());
app.use(
  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
app.use(cors(corsOptions()));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(
  "/static",
  express.static(staticAssetsDir, {
    maxAge: "365d",
    immutable: true,
  })
);
app.get("/uploads/:filename", serveUploadWithFallback);

app.get("/api/health", async (_req, res) => {
  const databaseConnected = await checkDatabaseConnection();
  const memory = process.memoryUsage();

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "degraded",
    service: "appifylab-backend",
    database: databaseConnected ? "connected" : "disconnected",
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rssMb: formatMemoryMb(memory.rss),
      heapUsedMb: formatMemoryMb(memory.heapUsed),
      heapTotalMb: formatMemoryMb(memory.heapTotal),
      externalMb: formatMemoryMb(memory.external),
    },
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", csrfProtection);
app.use("/api", apiRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

async function bootstrap(): Promise<void> {
  try {
    await initializeDatabase();
    logInfo("database_connected");
  } catch (error) {
    logError("database_connection_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }

  app.listen(port, () => {
    logInfo("server_started", { port });
  });
}

process.on("SIGINT", async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(0);
});

bootstrap();
