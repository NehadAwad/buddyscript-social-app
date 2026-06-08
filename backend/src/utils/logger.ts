type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, event: string, data?: Record<string, unknown>): void {
  const entry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...data,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export function logInfo(event: string, data?: Record<string, unknown>): void {
  write("info", event, data);
}

export function logWarn(event: string, data?: Record<string, unknown>): void {
  write("warn", event, data);
}

export function logError(event: string, data?: Record<string, unknown>): void {
  write("error", event, data);
}

export function logRequest(data: {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  userId?: string;
}): void {
  logInfo("http_request", {
    method: data.method,
    path: data.path,
    status: data.status,
    durationMs: data.durationMs,
    userId: data.userId ?? "anonymous",
  });
}

export function formatMemoryMb(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}
