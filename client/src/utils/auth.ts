import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "./constants";

const LAST_ACTIVITY_KEY = "lastActivityAt";
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const CLIENT_HASH_PREFIX = "sha256:";

type JwtPayload = {
  exp?: number;
  sub?: string;
  username?: string;
};

export const hashCredentialForAuth = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  const bytes = new Uint8Array(digest);
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return `${CLIENT_HASH_PREFIX}${hex}`;
};

const decodeToken = (token: string | null): JwtPayload | null => {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(paddedPayload)) as JwtPayload;
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null =>
  localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

export const setAccessToken = (token: string) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const getUsernameFromToken = (token?: string | null): string | null => {
  const payload = decodeToken(token ?? getAccessToken());
  return typeof payload?.username === "string" ? payload.username : null;
};

export const getUserId = (): string | null => {
  const stored = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
  if (stored) {
    return stored;
  }

  const payload = decodeToken(getAccessToken());
  return typeof payload?.sub === "string" ? payload.sub : null;
};

export const setUserId = (userId: string) => {
  sessionStorage.setItem(STORAGE_KEYS.USER_ID, userId);
};

export const setUserCompanies = (companies: string[]) => {
  sessionStorage.setItem(
    STORAGE_KEYS.USER_COMPANIES,
    JSON.stringify(companies),
  );
};

export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_COMPANIES);
  sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
  sessionStorage.removeItem(STORAGE_KEYS.USER_COMPANIES);
  sessionStorage.removeItem(LAST_ACTIVITY_KEY);
};

export const isTokenExpired = (token?: string | null): boolean => {
  const payload = decodeToken(token ?? getAccessToken());
  if (!payload?.exp) {
    return true;
  }
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
};

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return Boolean(token) && !isTokenExpired(token);
};

export const markActivity = (timestamp = Date.now()) => {
  sessionStorage.setItem(LAST_ACTIVITY_KEY, String(timestamp));
};

export const isIdle = (now = Date.now()): boolean => {
  const stored = sessionStorage.getItem(LAST_ACTIVITY_KEY);
  if (!stored) {
    return false;
  }
  const last = Number(stored);
  if (Number.isNaN(last)) {
    return false;
  }
  return now - last > IDLE_TIMEOUT_MS;
};

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );

    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
      const payload = decodeToken(response.data.accessToken);
      if (payload?.sub) {
        setUserId(payload.sub);
      }
      markActivity();
      return true;
    }
  } catch {
    // Ignore errors so callers can handle logout.
  }

  return false;
};

export const logout = async (redirect = true) => {
  try {
    await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      { withCredentials: true },
    );
  } catch {
    // Ignore network errors on logout.
  } finally {
    clearAuthStorage();
    if (redirect) {
      window.location.href = "/login";
    }
  }
};

export { IDLE_TIMEOUT_MS };
