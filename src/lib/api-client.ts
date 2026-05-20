type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type ApiError = Error & { status?: number; details?: JsonValue | Record<string, JsonValue> | null };

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api/v1";
const ACCESS_TOKEN_KEY = "brailled.accessToken";
const REFRESH_TOKEN_KEY = "brailled.refreshToken";

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function setStoredTokens(accessToken: string, refreshToken?: string | null) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = API_BASE.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

async function readJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function createApiError(response: Response, payload: any): ApiError {
  const message =
    payload?.detail ||
    payload?.message ||
    payload?.error ||
    response.statusText ||
    "Request failed";
  const error = new Error(message) as ApiError;
  error.status = response.status;
  error.details = payload ?? null;
  return error;
}

async function refreshAccessToken() {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(buildUrl("/refresh/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    clearStoredTokens();
    return null;
  }

  const payload = await readJsonSafely(response);
  const accessToken = payload?.access as string | undefined;
  if (!accessToken) {
    clearStoredTokens();
    return null;
  }

  setStoredTokens(accessToken, refreshToken);
  return accessToken;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, signal, headers = {} } = options;

  let { accessToken } = getStoredTokens();
  if (auth && !accessToken) {
    accessToken = await refreshAccessToken();
  }

  if (auth && !accessToken) {
    const error = new Error("You need to sign in to continue.") as ApiError;
    error.status = 401;
    throw error;
  }

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  if (auth && accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: requestBody,
    signal,
  });

  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest(path, { ...options, auth: true });
    }
  }

  if (!response.ok) {
    const payload = await readJsonSafely(response);
    throw createApiError(response, payload);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await readJsonSafely(response)) as T;
}

export function normalizeList<T>(payload: any): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload?.results && Array.isArray(payload.results)) {
    return payload.results as T[];
  }
  return [];
}

function toRelativePath(nextUrl: string) {
  if (!/^https?:\/\//i.test(nextUrl)) {
    return nextUrl;
  }
  const base = API_BASE.replace(/\/$/, "");
  return nextUrl.startsWith(base) ? nextUrl.slice(base.length) : nextUrl;
}

export async function fetchAllPages<T>(path: string, options: RequestOptions = {}, maxPages = 10) {
  const results: T[] = [];
  let nextPath: string | null = path;

  for (let page = 0; page < maxPages && nextPath; page += 1) {
    const payload = await apiRequest<any>(nextPath, options);
    results.push(...normalizeList<T>(payload));
    const next = payload?.next as string | null | undefined;
    nextPath = next ? toRelativePath(next) : null;
  }

  return results;
}
