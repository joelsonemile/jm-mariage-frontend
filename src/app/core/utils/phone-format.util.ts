// Indicatif Maroc par défaut, le mariage ayant lieu à Agadir.
const DEFAULT_COUNTRY_CODE = '212';

export function toWhatsAppNumber(rawPhone: string | null | undefined): string | null {
  if (!rawPhone) return null;
  const trimmed = rawPhone.trim();
  let digits = trimmed.replace(/\D/g, '');

  if (trimmed.startsWith('00')) {
    digits = digits.slice(2);
  } else if (!trimmed.startsWith('+')) {
    if (digits.startsWith('0')) {
      digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
    } else if (digits.length <= 9) {
      digits = DEFAULT_COUNTRY_CODE + digits;
    }
  }

  return digits.length >= 10 ? digits : null;
}
