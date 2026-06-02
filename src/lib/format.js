/**
 * Formateadores reutilizables.
 *
 * - Trabajamos en quetzales (GTQ) porque la API es de Guatemala.
 * - Todas las fechas se renderizan en zona horaria America/Guatemala
 *   (UTC-6, sin DST), independientemente del navegador del usuario,
 *   para que el "hoy" mostrado coincida con el "hoy" del banco.
 */

export const ZONA_HORARIA_BANCO = 'America/Guatemala';

const currencyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('es-GT', {
  maximumFractionDigits: 2,
});

export const fmtMoney = (n) =>
  currencyFormatter.format(Number.isFinite(+n) ? +n : 0);

export const fmtNumber = (n) =>
  numberFormatter.format(Number.isFinite(+n) ? +n : 0);

const dateFmt = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: ZONA_HORARIA_BANCO,
});
const timeFmt = new Intl.DateTimeFormat('es-GT', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: ZONA_HORARIA_BANCO,
});
const dateTimeFmt = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
  hour12: false,
  timeZone: ZONA_HORARIA_BANCO,
});

export const fmtDate = (iso) => (iso ? dateFmt.format(new Date(iso)) : '—');
export const fmtTime = (iso) => (iso ? timeFmt.format(new Date(iso)) : '—');
export const fmtDateTime = (iso) =>
  iso ? dateTimeFmt.format(new Date(iso)) : '—';

/**
 * Devuelve los componentes Y/M/D del momento `iso` interpretados en hora del
 * banco (Guatemala). Útil para inputs `<input type="date">` y para calcular
 * rangos "hoy" / "este mes" desde la perspectiva del banco.
 *
 *   const { year, month, day } = partsEnGuatemala(new Date());
 */
export function partsEnGuatemala(iso = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: ZONA_HORARIA_BANCO,
  }).formatToParts(new Date(iso));

  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
    // "YYYY-MM-DD" listo para usar en <input type="date">
    iso: `${lookup.year}-${lookup.month}-${lookup.day}`,
  };
}

/**
 * Devuelve "YYYY-MM-DD" del día actual en hora del banco.
 * Útil como `max` o `defaultValue` de un <input type="date">.
 */
export const hoyEnGuatemalaIso = () => partsEnGuatemala(new Date()).iso;

/**
 * Convierte un valor de <input type="datetime-local"> (o "datetime-local"
 * tipo "YYYY-MM-DDTHH:mm") interpretándolo como hora del banco (Guatemala,
 * UTC-6 sin DST) y devuelve el ISO UTC equivalente, listo para enviar al
 * backend. Útil para filtros de bitácora/kardex.
 *
 *   "2026-06-01T22:30" (Guatemala) → "2026-06-02T04:30:00.000Z"
 *
 * Devuelve `null` si el input está vacío.
 */
export function inputLocalGuatemalaAIsoUtc(localDatetime) {
  if (!localDatetime) return null;
  // Aseguramos formato con segundos para que Date acepte el offset explícito.
  const conSegundos =
    localDatetime.length === 16 ? `${localDatetime}:00` : localDatetime;
  // Guatemala es UTC-6 fijo, sin horario de verano: el offset es siempre -06:00.
  const d = new Date(`${conSegundos}-06:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** "5 mins ago", "hace 2 horas"… */
export function fmtRelative(iso) {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  if (sec < 60) return rtf.format(-sec, 'second');
  const min = Math.round(sec / 60);
  if (min < 60) return rtf.format(-min, 'minute');
  const h = Math.round(min / 60);
  if (h < 24) return rtf.format(-h, 'hour');
  const d = Math.round(h / 24);
  if (d < 30) return rtf.format(-d, 'day');
  const mo = Math.round(d / 30);
  if (mo < 12) return rtf.format(-mo, 'month');
  return rtf.format(-Math.round(mo / 12), 'year');
}

/** 1234567890123456 -> "1234 •••• •••• 3456" */
export function maskCard(n) {
  const s = String(n ?? '').replace(/\D/g, '');
  if (s.length < 8) return s;
  return `${s.slice(0, 4)} •••• •••• ${s.slice(-4)}`;
}

/** 1234567890 -> "1234 5678 90" */
export function chunkCard(n) {
  const s = String(n ?? '').replace(/\D/g, '');
  return s.replace(/(.{4})/g, '$1 ').trim();
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}
