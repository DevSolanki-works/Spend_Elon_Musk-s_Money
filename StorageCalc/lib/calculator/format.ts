import { STORAGE_UNIT_CONVERSION } from "./assumptions.ts";

/**
 * Sanitizes a numeric input so NaN, Infinity, or negative numbers never
 * corrupt the calculation engine.
 */
export function sanitizeNonNegativeNumber(
  value: unknown,
  fallback = 0,
  max = 1_000_000_000
): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  if (num < 0) {
    return 0;
  }
  return Math.min(num, max);
}

/**
 * Rounds a number to a clean step (e.g., nearest 5 or 10) for range bounds
 * so ranges read naturally like "~300–380 GB" rather than "~301.4–379.2 GB".
 */
export function roundToCleanStep(gb: number): number {
  if (!Number.isFinite(gb) || gb <= 0) return 0;
  if (gb < 20) return Math.max(1, Math.round(gb));
  if (gb < 100) return Math.round(gb / 5) * 5;
  if (gb < 1000) return Math.round(gb / 10) * 10;
  return Math.round(gb / 50) * 50;
}

/**
 * Formats a storage amount in GB without false decimal precision.
 * Examples:
 * - 0 -> "0 GB"
 * - 0.4 -> "< 1 GB"
 * - 347.82 -> "~348 GB" (or "348 GB" when includeTilde is false)
 * - 1450 -> "~1.5 TB (1,450 GB)"
 */
export function formatStorageGb(
  gb: number,
  options: { includeTilde?: boolean; compactTb?: boolean } = {}
): string {
  const { includeTilde = true, compactTb = false } = options;
  const safeGb = sanitizeNonNegativeNumber(gb, 0);

  if (safeGb <= 0) {
    return "0 GB";
  }

  if (safeGb < 1) {
    return "< 1 GB";
  }

  const prefix = includeTilde ? "~" : "";
  const roundedGb = Math.round(safeGb);

  if (roundedGb >= STORAGE_UNIT_CONVERSION.GB_PER_TB) {
    const tb = roundedGb / STORAGE_UNIT_CONVERSION.GB_PER_TB;
    const tbFormatted =
      tb >= 10 ? Math.round(tb).toString() : tb.toFixed(1).replace(/\.0$/, "");
    if (compactTb) {
      return `${prefix}${tbFormatted} TB`;
    }
    return `${prefix}${tbFormatted} TB (${roundedGb.toLocaleString("en-US")} GB)`;
  }

  return `${prefix}${roundedGb.toLocaleString("en-US")} GB`;
}

/**
 * Formats a low–high GB range without false precision.
 * Example: formatStorageRangeGb(302, 381) -> "~300–380 GB"
 */
export function formatStorageRangeGb(lowGb: number, highGb: number): string {
  const safeLow = sanitizeNonNegativeNumber(lowGb, 0);
  const safeHigh = Math.max(safeLow, sanitizeNonNegativeNumber(highGb, 0));

  if (safeHigh <= 0) {
    return "0 GB";
  }

  if (safeHigh < 1) {
    return "< 1 GB";
  }

  const cleanLow = roundToCleanStep(safeLow);
  const cleanHigh = Math.max(cleanLow, roundToCleanStep(safeHigh));

  if (cleanLow === cleanHigh) {
    return formatStorageGb(cleanLow, { includeTilde: true, compactTb: true });
  }

  if (cleanLow >= STORAGE_UNIT_CONVERSION.GB_PER_TB) {
    const lowTb = (cleanLow / STORAGE_UNIT_CONVERSION.GB_PER_TB)
      .toFixed(1)
      .replace(/\.0$/, "");
    const highTb = (cleanHigh / STORAGE_UNIT_CONVERSION.GB_PER_TB)
      .toFixed(1)
      .replace(/\.0$/, "");
    return `~${lowTb}–${highTb} TB`;
  }

  return `~${cleanLow.toLocaleString("en-US")}–${cleanHigh.toLocaleString("en-US")} GB`;
}

/**
 * Formats a time horizon in years cleanly.
 */
export function formatYearsLabel(years: number): string {
  const safeYears = sanitizeNonNegativeNumber(years, 1, 50);
  if (safeYears === 1) return "1 year";
  return `${safeYears} years`;
}
