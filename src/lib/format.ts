const dateFormatter = new Intl.DateTimeFormat('en-KE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-KE', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-KE', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fullDateFormatter = new Intl.DateTimeFormat('en-KE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatDate(input: string | Date): string {
  return dateFormatter.format(new Date(input));
}

export function formatDateWithWeekday(input: string | Date): string {
  return dateTimeFormatter.format(new Date(input));
}

export function formatTime(input: string | Date): string {
  return timeFormatter.format(new Date(input));
}

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatFullDate(input: string | Date): string {
  return fullDateFormatter.format(new Date(input));
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(d);
}

export function escapeCsvField(value: unknown): string {
  const str = String(value ?? '');
  // Strip leading characters that trigger formula execution in spreadsheet apps
  const sanitized = str.replace(/^[\t\r\n=+\-@]/, '');
  if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}
