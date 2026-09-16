import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

const ISO2_TO_COUNTRY_NAME: Record<string, string> = {
  ET: 'Ethiopia',
  KE: 'Kenya',
  RW: 'Rwanda',
  UG: 'Uganda',
  TZ: 'Tanzania',
  DJ: 'Djibouti',
  SO: 'Somalia',
  SD: 'Sudan',
  SS: 'South Sudan',
  ER: 'Eritrea',
  US: 'United States',
  GB: 'United Kingdom',
};

/**
 * Extracts country name from an E.164 phone number using libphonenumber-js.
 * High-confidence signal.
 */
export function getCountryFromPhoneNumber(
  phone: string,
  availableCountries: string[]
): string | null {
  try {
    const trimmed = phone.trim();
    if (!trimmed) return null;

    const parsed = parsePhoneNumberFromString(trimmed);
    if (!parsed || !parsed.country) return null;

    const iso = parsed.country.toUpperCase();
    const mappedName = ISO2_TO_COUNTRY_NAME[iso];

    if (!mappedName) return null;

    // Verify against dataset countries
    const match = availableCountries.find(
      (c) => c.toLowerCase() === mappedName.toLowerCase()
    );

    return match || mappedName;
  } catch {
    return null;
  }
}

/**
 * Extracts country name from a Google OAuth ID token locale claim (e.g. "am-ET", "sw-KE", "en-ET").
 * Low-confidence hint. Returns null if unmappable or not in dataset countries.
 */
export function getCountryFromGoogleLocale(
  locale: string | undefined | null,
  availableCountries: string[]
): string | null {
  if (!locale || typeof locale !== 'string') return null;

  const clean = locale.trim().replace('_', '-');
  const parts = clean.split('-');

  let regionCode: string | null = null;
  let langCode = parts[0]?.toLowerCase();

  if (parts.length >= 2) {
    regionCode = parts[1]?.toUpperCase();
  }

  let resolvedCountryName: string | null = null;

  // 1. Check region code (e.g. "ET" from "am-ET")
  if (regionCode && ISO2_TO_COUNTRY_NAME[regionCode]) {
    resolvedCountryName = ISO2_TO_COUNTRY_NAME[regionCode];
  } else if (langCode) {
    // 2. Fallback to language hints
    if (['am', 'om', 'ti'].includes(langCode)) {
      resolvedCountryName = 'Ethiopia';
    } else if (['rw', 'kin'].includes(langCode)) {
      resolvedCountryName = 'Rwanda';
    }
  }

  if (!resolvedCountryName) return null;

  // Verify that resolved country exists in the dataset countries
  const match = availableCountries.find(
    (c) => c.toLowerCase() === resolvedCountryName!.toLowerCase()
  );

  return match || null;
}
