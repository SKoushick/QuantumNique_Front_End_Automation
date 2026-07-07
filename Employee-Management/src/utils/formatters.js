/**
 * Utility formatters for dates, currency, numbers, and strings
 */

import { format, formatDistance, isValid, parseISO } from 'date-fns';

// ── Date formatters ──────────────────────────────────────────────────────────

/** Format a date to a readable string. Default: 'MMM d, yyyy' */
export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(d)) return '—';
  return format(d, fmt);
};

/** Format datetime: 'MMM d, yyyy h:mm a' */
export const formatDateTime = (date) => formatDate(date, 'MMM d, yyyy h:mm a');

/** Format time only: 'h:mm a' */
export const formatTime = (date) => formatDate(date, 'h:mm a');

/** Relative time: '3 days ago' */
export const formatRelative = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(d)) return '—';
  return formatDistance(d, new Date(), { addSuffix: true });
};

/** Get initials from a full name */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
};

// ── Number & Currency ────────────────────────────────────────────────────────

/** Format as USD currency */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Format large numbers with K/M suffix */
export const formatCompact = (num) => {
  if (num == null) return '—';
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
};

/** Format percentage */
export const formatPercent = (val, decimals = 1) => {
  if (val == null) return '—';
  return `${Number(val).toFixed(decimals)}%`;
};

/** Format hours from decimal: 8.5 → '8h 30m' */
export const formatHours = (hours) => {
  if (hours == null) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// ── String helpers ───────────────────────────────────────────────────────────

/** Capitalize first letter */
export const capitalize = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/** Convert camelCase / snake_case to Title Case */
export const toTitleCase = (str = '') =>
  str
    .replace(/[-_]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(capitalize)
    .join(' ');

/** Truncate string */
export const truncate = (str = '', maxLen = 50) =>
  str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;

/** Pluralize */
export const pluralize = (count, singular, plural) =>
  `${count} ${count === 1 ? singular : (plural || `${singular}s`)}`;

// ── Color helpers ────────────────────────────────────────────────────────────

/** Get CSS var for a status */
export const getStatusColor = (status) => {
  const map = {
    active:      'var(--color-success-400)',
    inactive:    'var(--text-muted)',
    terminated:  'var(--color-danger-400)',
    pending:     'var(--color-warning-400)',
    approved:    'var(--color-success-400)',
    rejected:    'var(--color-danger-400)',
    on_leave:    'var(--color-cyan-400)',
    completed:   'var(--color-success-400)',
    in_progress: 'var(--color-primary-400)',
    overdue:     'var(--color-danger-400)',
    draft:       'var(--text-muted)',
    published:   'var(--color-success-400)',
    high:        'var(--color-danger-400)',
    medium:      'var(--color-warning-400)',
    low:         'var(--color-success-400)',
  };
  return map[status?.toLowerCase()] || 'var(--text-muted)';
};

/** Get CSS var background for a status badge */
export const getStatusBg = (status) => {
  const map = {
    active:      'rgba(52, 168, 83, 0.12)',
    inactive:    'rgba(128, 128, 128, 0.12)',
    terminated:  'rgba(234, 67, 53, 0.12)',
    pending:     'rgba(251, 188, 4, 0.12)',
    approved:    'rgba(52, 168, 83, 0.12)',
    rejected:    'rgba(234, 67, 53, 0.12)',
    on_leave:    'rgba(32, 178, 170, 0.12)',
    completed:   'rgba(52, 168, 83, 0.12)',
    in_progress: 'rgba(66, 133, 244, 0.12)',
    overdue:     'rgba(234, 67, 53, 0.12)',
    high:        'rgba(234, 67, 53, 0.12)',
    medium:      'rgba(251, 188, 4, 0.12)',
    low:         'rgba(52, 168, 83, 0.12)',
  };
  return map[status?.toLowerCase()] || 'rgba(128,128,128,0.12)';
};

/** Generate a deterministic avatar color from a name */
export const getAvatarColor = (name = '') => {
  const colors = [
    'hsl(220,90%,56%)', 'hsl(262,80%,60%)', 'hsl(145,65%,42%)',
    'hsl(38,95%,55%)',  'hsl(191,90%,42%)',  'hsl(330,85%,62%)',
    'hsl(25,95%,58%)',  'hsl(174,72%,46%)',  'hsl(44,100%,52%)',
  ];
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

// ── File helpers ─────────────────────────────────────────────────────────────

/** Format bytes to KB/MB/GB */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/** Get file extension icon label */
export const getFileIcon = (filename = '') => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', zip: '📦' };
  return map[ext] || '📎';
};
