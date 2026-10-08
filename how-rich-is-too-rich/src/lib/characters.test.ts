import { describe, it, expect } from 'vitest';
import { formatUSD } from './characters';

describe('formatUSD', () => {
  it('formats billions correctly without remainder', () => {
    expect(formatUSD(1_000_000_000)).toBe('1B');
    expect(formatUSD(250_000_000_000)).toBe('250B');
  });

  it('formats billions correctly with remainder', () => {
    expect(formatUSD(1_500_000_000)).toBe('1.5B');
    expect(formatUSD(1_550_000_000)).toBe('1.6B');
  });

  it('formats millions correctly without remainder', () => {
    expect(formatUSD(1_000_000)).toBe('1M');
    expect(formatUSD(999_000_000)).toBe('999M');
  });

  it('formats millions correctly with remainder', () => {
    expect(formatUSD(1_500_000)).toBe('1.5M');
  });

  it('formats numbers under a million correctly', () => {
    expect(formatUSD(500_000)).toBe('500,000');
    expect(formatUSD(10_000)).toBe('10,000');
    expect(formatUSD(1)).toBe('1');
    expect(formatUSD(0)).toBe('0');
  });
});
