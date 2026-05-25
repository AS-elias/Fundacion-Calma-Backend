/** Convierte "YYYY-MM-DD" a Date UTC (sin corrimiento de día en @db.Date). */
export function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value).trim());
  if (!match) {
    return new Date(value);
  }

  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
}

/** Serializa Date o ISO a "YYYY-MM-DD" para respuestas API. */
export function formatDateOnly(value: Date | string | null | undefined): string | null {
  if (!value) return null;

  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
  }

  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, '0');
  const d = String(value.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
