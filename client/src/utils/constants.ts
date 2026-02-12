export const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "/api";

export const USER_ID_HEADER = "x-user-id";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  USER_ID: "userId",
  USER_COMPANIES: "userCompanies",
} as const;
