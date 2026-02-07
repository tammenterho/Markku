export const getUsernameFromToken = (token: string | null): string | null => {
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
    const decoded = JSON.parse(atob(paddedPayload));

    return typeof decoded.username === "string" ? decoded.username : null;
  } catch {
    return null;
  }
};

export const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const decoded: any = JSON.parse(atob(padded));
    if (typeof decoded.id === "string") return decoded.id;
    if (typeof decoded.sub === "string") return decoded.sub;
    return null;
  } catch {
    return null;
  }
};
