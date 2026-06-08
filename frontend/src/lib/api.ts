export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

import { getApiUrl } from "./env";

const API_URL = getApiUrl();

const NO_REFRESH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

let refreshPromise: Promise<boolean> | null = null;

function shouldAttemptRefresh(path: string, retried: boolean): boolean {
  if (retried) {
    return false;
  }

  return !NO_REFRESH_PATHS.some((authPath) => path.startsWith(authPath));
}

async function tryRefreshSession(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function buildHeaders(options: RequestInit): Headers {
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: buildHeaders(options),
  });

  if (response.status === 401 && shouldAttemptRefresh(path, retried)) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return fetchWithAuth(path, options, true);
    }
  }

  return response;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(path, options);

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? "Request failed");
  }

  return data as T;
}
