import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getAccessToken,
  setAccessToken,
  getUserId,
  setUserId,
  setUserCompanies,
  clearAuthStorage,
  isTokenExpired,
  isAuthenticated,
  markActivity,
  isIdle,
  getUsernameFromToken,
  IDLE_TIMEOUT_MS,
} from "./auth";
import { STORAGE_KEYS } from "./constants";

// Mock axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

const toBase64Url = (value: Record<string, string | number>): string => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

describe("Auth Utils", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Token Storage", () => {
    it("should store and retrieve access token from localStorage", () => {
      const token = "test-token-123";
      setAccessToken(token);
      expect(getAccessToken()).toBe(token);
    });

    it("should store user id in sessionStorage", () => {
      const userId = "user-123";
      setUserId(userId);
      expect(getUserId()).toBe(userId);
    });

    it("should store user companies in sessionStorage", () => {
      const companies = ["company-1", "company-2"];
      setUserCompanies(companies);
      expect(sessionStorage.getItem(STORAGE_KEYS.USER_COMPANIES)).toBe(
        JSON.stringify(companies),
      );
    });
  });

  describe("Token Expiry", () => {
    it("should detect expired token", () => {
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEsInN1YiI6InRlc3QtMTIzIn0.test";
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it("should detect valid (non-expired) token", () => {
      // Token with exp far in future (year 2100)
      const futureTime = Math.floor(new Date(2100, 0, 1).getTime() / 1000);
      const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${toBase64Url(
        {
          exp: futureTime,
          sub: "user-123",
          username: "testuser",
        },
      )}.signature`;

      expect(isTokenExpired(validToken)).toBe(false);
    });

    it("should return true for token with no exp", () => {
      const tokenNoExp = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${toBase64Url({ sub: "user-123" })}.signature`;

      expect(isTokenExpired(tokenNoExp)).toBe(true);
    });
  });

  describe("Username Extraction", () => {
    it("should extract username from token", () => {
      const futureTime = Math.floor(new Date(2100, 0, 1).getTime() / 1000);
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${toBase64Url(
        {
          exp: futureTime,
          sub: "user-123",
          username: "john",
        },
      )}.signature`;

      expect(getUsernameFromToken(token)).toBe("john");
    });

    it("should return null for invalid token", () => {
      expect(getUsernameFromToken("invalid-token")).toBeNull();
    });
  });

  describe("Authentication Status", () => {
    it("should return false when no token", () => {
      expect(isAuthenticated()).toBe(false);
    });

    it("should return false for expired token", () => {
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEsInN1YiI6InRlc3QtMTIzIn0.test";
      setAccessToken(expiredToken);
      expect(isAuthenticated()).toBe(false);
    });

    it("should return true for valid token", () => {
      const futureTime = Math.floor(new Date(2100, 0, 1).getTime() / 1000);
      const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${toBase64Url(
        {
          exp: futureTime,
          sub: "user-123",
          username: "testuser",
        },
      )}.signature`;

      setAccessToken(validToken);
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe("Idle Tracking", () => {
    it("should mark activity with current timestamp", () => {
      const now = Date.now();
      markActivity(now);
      const stored = sessionStorage.getItem("lastActivityAt");
      expect(stored).toBe(String(now));
    });

    it("should return false when no activity recorded", () => {
      expect(isIdle()).toBe(false);
    });

    it("should return false when activity is recent", () => {
      const now = Date.now();
      markActivity(now);
      expect(isIdle(now + 1000)).toBe(false);
    });

    it("should return true when idle time exceeded", () => {
      const now = Date.now();
      markActivity(now);
      const futureTime = now + IDLE_TIMEOUT_MS + 1000;
      expect(isIdle(futureTime)).toBe(true);
    });
  });

  describe("Storage Cleanup", () => {
    it("should clear all auth storage", () => {
      setAccessToken("token-123");
      setUserId("user-123");
      setUserCompanies(["company-1"]);
      markActivity();

      clearAuthStorage();

      expect(getAccessToken()).toBeNull();
      expect(sessionStorage.getItem(STORAGE_KEYS.USER_ID)).toBeNull();
      expect(sessionStorage.getItem(STORAGE_KEYS.USER_COMPANIES)).toBeNull();
      expect(sessionStorage.getItem("lastActivityAt")).toBeNull();
    });
  });
});
