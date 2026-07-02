const MALAGASY_DAYS = ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Asabotsy'];
const FRENCH_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function formatWeddingDateLabel(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = MALAGASY_DAYS[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const month = FRENCH_MONTHS[d.getMonth()];
  return `${day} ${dd} ${month} ${d.getFullYear()}`;
}
