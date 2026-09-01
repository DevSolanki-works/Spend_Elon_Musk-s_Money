import { describe, it, expect } from 'vitest';
import { formatUsd } from './gameEngine';

describe('formatUsd', () => {
  it('formats exactly zero', () => {
    expect(formatUsd(0)).toBe('$0.00');
  });

  it('formats small numbers (< 1000)', () => {
    expect(formatUsd(999)).toBe('$999.00');
    expect(formatUsd(50)).toBe('$50.00');
    expect(formatUsd(0.5)).toBe('$0.50');
  });

  it('formats thousands (K)', () => {
    expect(formatUsd(1000)).toBe('$1.0K');
    expect(formatUsd(1500)).toBe('$1.5K');
    expect(formatUsd(999999)).toBe('$1000.0K');
  });

  it('formats millions (M)', () => {
    expect(formatUsd(1_000_000)).toBe('$1.00M');
    expect(formatUsd(1_500_000)).toBe('$1.50M');
    expect(formatUsd(999_999_999)).toBe('$1000.00M');
  });

  it('formats billions (B)', () => {
    expect(formatUsd(1_000_000_000)).toBe('$1.000B');
    expect(formatUsd(1_500_000_000)).toBe('$1.500B');
    expect(formatUsd(999_999_999_999)).toBe('$1000.000B');
  });

  it('formats trillions (T)', () => {
    expect(formatUsd(1_000_000_000_000)).toBe('$1.000T');
    expect(formatUsd(1_500_000_000_000)).toBe('$1.500T');
    expect(formatUsd(1_000_000_000_000_000)).toBe('$1000.000T');
  });

  it('formats negative numbers correctly', () => {
    expect(formatUsd(-50)).toBe('-$50.00');
    expect(formatUsd(-1500)).toBe('-$1.5K');
    expect(formatUsd(-1_500_000)).toBe('-$1.50M');
    expect(formatUsd(-1_500_000_000)).toBe('-$1.500B');
    expect(formatUsd(-1_500_000_000_000)).toBe('-$1.500T');
  });

  it('handles negative zero correctly', () => {
    expect(formatUsd(-0)).toBe('$0.00');
  });
});
