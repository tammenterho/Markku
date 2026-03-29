/** Helper: pads single-digit numbers with a leading zero */
const pad = (n: number): string => n.toString().padStart(2, "0");

/**
 * Parses a date value into a local Date object.
 *
 * Important: new Date("2024-03-29T12:00") is interpreted as UTC in many browsers,
 * which causes timezone issues. This function parses ISO format strings
 * ALWAYS as local time using the Date constructor's component form.
 */
export const parseLocalDate = (
  value: Date | string | null | undefined,
): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const str = String(value).trim();

  // Parse ISO format: "2024-03-29" or "2024-03-29T12:00:00.123"
  const match = str.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );

  if (match) {
    const [, year, month, day, hour = "0", min = "0", sec = "0"] = match;
    return new Date(+year, +month - 1, +day, +hour, +min, +sec);
  }

  // Fallback for other formats
  return new Date(str);
};

/**
 * Converts a date to an ISO format string WITHOUT timezone conversion.
 *
 * Used in API calls because JSON.stringify(Date) converts to UTC,
 * which in Finland (UTC+2/+3) causes a 2-3h offset from the selected time.
 */
export const toLocalISOString = (
  date: Date | string | null | undefined,
): string | null => {
  const d = parseLocalDate(date);
  if (!d) return null;

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/**
 * Formats a date to Finnish display format: "29.03.2024 klo. 12:00"
 */
export const formatDate = (date: Date | string): string => {
  const d = parseLocalDate(date);
  if (!d) return "";

  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} klo. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Formats an age range from PostgreSQL range format: "[25,45)" -> "25-45"
 */
export const formatAgeRange = (value: string | null | undefined): string => {
  if (!value) return "";

  const nums = value.match(/\d+/g);
  return nums?.length === 2 ? `${nums[0]}-${nums[1]}` : value;
};
