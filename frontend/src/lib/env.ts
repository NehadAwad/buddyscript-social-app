const DEFAULT_API_URL = "http://localhost:4000/api";

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export function getApiOrigin(): string {
  return getApiUrl().replace(/\/api\/?$/, "");
}
