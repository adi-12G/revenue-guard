export function stripBom(value: string): string {
  return String(value ?? "").replace(
    /^\uFEFF/,
    ""
  );
}

export function parseNumber(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  let cleaned = String(value)
    .trim();

  if (!cleaned) {
    return null;
  }

  // Handle accounting-style negatives:
  // (₹1,00,000) -> -100000
  const isAccountingNegative =
    cleaned.startsWith("(") &&
    cleaned.endsWith(")");

  // Remove currency symbols, spaces and
  // other non-numeric characters except
  // decimal point, comma and minus.
  cleaned = cleaned
    .replace(/[₹$€£¥]/g, "")
    .replace(/\s/g, "")
    .replace(/[^\d,.\-]/g, "");

  if (!cleaned) {
    return null;
  }

  /*
   * Common Indian / SaaS exports:
   *
   * ₹1,00,000      -> 100000
   * $10,000        -> 10000
   * 10,000.50      -> 10000.50
   * 10000          -> 10000
   */
  cleaned = cleaned.replace(/,/g, "");

  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return isAccountingNegative
    ? -Math.abs(parsed)
    : parsed;
}

function isValidDate(
  year: number,
  month: number,
  day: number
): boolean {
  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function toIsoDate(
  year: number,
  month: number,
  day: number
): string | null {
  if (!isValidDate(year, month, day)) {
    return null;
  }

  return `${String(year).padStart(
    4,
    "0"
  )}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(
    2,
    "0"
  )}`;
}

export function parseDate(
  value: unknown
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const raw = String(value)
    .trim()
    .replace(/^\uFEFF/, "");

  if (!raw) {
    return null;
  }

  // YYYY-MM-DD
  let match = raw.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/
  );

  if (match) {
    return toIsoDate(
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    );
  }

  // DD/MM/YYYY or DD-MM-YYYY
  // Indian exports are treated as DD/MM/YYYY.
  match = raw.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
  );

  if (match) {
    return toIsoDate(
      Number(match[3]),
      Number(match[2]),
      Number(match[1])
    );
  }

  // Excel/CSV values that are already
  // parseable by the JS Date parser.
  const parsed = new Date(raw);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed
      .toISOString()
      .slice(0, 10);
  }

  return null;
}

export function parseBoolean(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
}