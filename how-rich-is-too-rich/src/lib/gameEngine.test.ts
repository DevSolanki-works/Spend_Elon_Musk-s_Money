import { describe, it, expect } from 'vitest';
import { formatUsd } from './gameEngine';

describe('formatUsd', () => {
  it('formats values under 1,000 correctly', () => {
    expect(formatUsd(0)).toBe('$0.00');
    expect(formatUsd(999)).toBe('$999.00');
    expect(formatUsd(5.5)).toBe('$5.50');
  });

  it('formats values in the thousands (K) correctly', () => {
    expect(formatUsd(1_000)).toBe('$1.0K');
    expect(formatUsd(1_500)).toBe('$1.5K');
    expect(formatUsd(999_900)).toBe('$999.9K');
  });

  it('formats values in the millions (M) correctly', () => {
    expect(formatUsd(1_000_000)).toBe('$1.00M');
    expect(formatUsd(1_550_000)).toBe('$1.55M');
  });

  it('formats values in the billions (B) correctly', () => {
    expect(formatUsd(1_000_000_000)).toBe('$1.000B');
    expect(formatUsd(1_555_000_000)).toBe('$1.555B');
  });

  it('formats values in the trillions (T) correctly', () => {
    expect(formatUsd(1_000_000_000_000)).toBe('$1.000T');
    expect(formatUsd(1_555_500_000_000)).toBe('$1.556T');
  });

  it('handles negative numbers correctly', () => {
    expect(formatUsd(-500)).toBe('-$500.00');
    expect(formatUsd(-1_500)).toBe('-$1.5K');
    expect(formatUsd(-1_550_000)).toBe('-$1.55M');
    expect(formatUsd(-1_555_000_000)).toBe('-$1.555B');
    expect(formatUsd(-1_555_500_000_000)).toBe('-$1.556T');
  });

  it('handles edge cases around boundaries', () => {
    expect(formatUsd(999.99)).toBe('$999.99');
    expect(formatUsd(999_999)).toBe('$1000.0K');
    expect(formatUsd(999_999_999)).toBe('$1000.00M');
    expect(formatUsd(999_999_999_999)).toBe('$1000.000B');
  });
});
