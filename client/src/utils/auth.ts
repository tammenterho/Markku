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
