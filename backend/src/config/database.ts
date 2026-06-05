import { AppDataSource } from "./data-source";

export async function initializeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    return;
  }

  await AppDataSource.initialize();
}

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!AppDataSource.isInitialized) {
    return false;
  }

  try {
    await AppDataSource.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export { AppDataSource };
