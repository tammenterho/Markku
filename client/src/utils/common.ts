/**
 * Formats an age range from PostgreSQL range format: "[25,45)" -> "25-45"
 */
export const formatAgeRange = (value: string | null | undefined): string => {
  if (!value) return "";

  const nums = value.match(/\d+/g);
  return nums?.length === 2 ? `${nums[0]}-${nums[1]}` : value;
};
