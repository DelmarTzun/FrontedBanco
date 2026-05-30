/**
 * Formateadores reutilizables.
 * Por defecto trabajamos en Quetzales (GTQ) porque la API es de Guatemala.
 */

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
});
const timeFmt = new Intl.DateTimeFormat('es-GT', {
  hour: '2-digit',
  minute: '2-digit',
});
const dateTimeFmt = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const fmtDate = (iso) => (iso ? dateFmt.format(new Date(iso)) : '—');
export const fmtTime = (iso) => (iso ? timeFmt.format(new Date(iso)) : '—');
export const fmtDateTime = (iso) =>
  iso ? dateTimeFmt.format(new Date(iso)) : '—';

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
