export const parseLocalDate = (value: Date | string | null | undefined) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const str = String(value).trim();
  const match = str.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?/,
  );

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const hour = Number(match[4] || 0);
    const minute = Number(match[5] || 0);
    const second = Number(match[6] || 0);
    const ms = Number((match[7] || "0").padEnd(3, "0"));
    return new Date(year, month, day, hour, minute, second, ms);
  }

  return new Date(str);
};

export const formatDate = (date: Date | string) => {
  const d = parseLocalDate(date);
  if (!d) return "";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return `${day}.${month}.${year} klo. ${hours}:${minutes}`;
};

export const formatAgeRange = (value: string | null | undefined) => {
  if (!value) return "";
  const nums = value.match(/\d+/g);
  if (nums && nums.length >= 2) {
    return `${nums[0]}-${nums[1]}`;
  }
  return value;
};
