import "reflect-metadata";
import "../config/env";
import { DataSource } from "typeorm";
import {
  Comment,
  Like,
  Post,
  RefreshToken,
  User,
} from "../entities";
import { InitialSchema1738680000000 } from "../migrations/1738680000000-InitialSchema";
import { PerformanceIndexes1738690000000 } from "../migrations/1738690000000-PerformanceIndexes";

function resolveSsl():
  | boolean
  | { rejectUnauthorized: boolean }
  | undefined {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (
    databaseUrl.includes("neon.tech") ||
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("sslmode=verify-full")
  ) {
    return { rejectUnauthorized: false };
  }

  return undefined;
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: resolveSsl(),
  entities: [User, Post, Comment, Like, RefreshToken],
  migrations: [InitialSchema1738680000000, PerformanceIndexes1738690000000],
  migrationsTableName: "migrations",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  extra: {
    max: Number(process.env.DATABASE_POOL_MAX) || 10,
    min: Number(process.env.DATABASE_POOL_MIN) || 2,
    idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS) || 30_000,
    connectionTimeoutMillis:
      Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS) || 5_000,
  },
});
