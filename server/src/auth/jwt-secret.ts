export function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('Missing JWT secret: set JWT_SECRET or JWT_REFRESH_SECRET');
  }
  return secret;
}