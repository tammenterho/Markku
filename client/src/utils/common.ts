/** Apufunktio: lisää etunollan yksinumeroisille arvoille */
const pad = (n: number): string => n.toString().padStart(2, "0");

/**
 * Parsii päivämäärän paikalliseksi Date-objektiksi.
 *
 * Tärkeää: new Date("2024-03-29T12:00") tulkitaan UTC-aikana useissa selaimissa,
 * mikä aiheuttaa aikavyöhykeongelmia. Tämä funktio parsii ISO-muotoisen merkkijonon
 * AINA paikallisena aikana käyttämällä Date-konstruktorin komponenttimuotoa.
 */
export const parseLocalDate = (
  value: Date | string | null | undefined,
): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const str = String(value).trim();

  // Parsii ISO-muoto: "2024-03-29" tai "2024-03-29T12:00:00.123"
  const match = str.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );

  if (match) {
    const [, year, month, day, hour = "0", min = "0", sec = "0"] = match;
    return new Date(+year, +month - 1, +day, +hour, +min, +sec);
  }

  // Fallback muille formaateille
  return new Date(str);
};

/**
 * Muuntaa päivämäärän ISO-muotoiseksi merkkijonoksi ILMAN aikavyöhykemuunnosta.
 *
 * Käytetään API-kutsuissa, koska JSON.stringify(Date) muuntaa UTC-aikaan,
 * joka Suomessa (UTC+2/+3) aiheuttaa 2-3h eron valittuun aikaan.
 */
export const toLocalISOString = (
  date: Date | string | null | undefined,
): string | null => {
  const d = parseLocalDate(date);
  if (!d) return null;

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/**
 * Muotoilee päivämäärän suomalaiseen esitysmuotoon: "29.03.2024 klo. 12:00"
 */
export const formatDate = (date: Date | string): string => {
  const d = parseLocalDate(date);
  if (!d) return "";

  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} klo. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Muotoilee ikähaarukan PostgreSQL range-muodosta: "[25,45)" -> "25-45"
 */
export const formatAgeRange = (value: string | null | undefined): string => {
  if (!value) return "";

  const nums = value.match(/\d+/g);
  return nums?.length === 2 ? `${nums[0]}-${nums[1]}` : value;
};
