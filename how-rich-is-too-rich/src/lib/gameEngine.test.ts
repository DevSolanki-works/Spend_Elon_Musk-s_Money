import { describe, it, expect } from 'vitest';
import { getSpendTier, createInitialState, GameState } from './gameEngine';

describe('gameEngine - getSpendTier', () => {
  // Helper to quickly create state with a specific percentage spent
  const createStateWithSpentPercent = (percent: number): GameState => {
    const startingBalance = 1_000_000_000;
    // Calculate how much to spend to hit the exact percentage
    const spentAmount = startingBalance * (percent / 100);
    const balance = startingBalance - spentAmount;

    const state = createInitialState(startingBalance);
    state.balance = balance;
    return state;
  };

  it('returns "Window Shopping" at exactly 0% spent', () => {
    const state = createStateWithSpentPercent(0);
    expect(getSpendTier(state)).toBe('Window Shopping');
  });

  it('returns "Casual Browser" at 0.001% spent', () => {
    const state = createStateWithSpentPercent(0.001);
    expect(getSpendTier(state)).toBe('Casual Browser');
  });

  it('returns "Casual Browser" just below 1%', () => {
    const state = createStateWithSpentPercent(0.99);
    expect(getSpendTier(state)).toBe('Casual Browser');
  });

  it('returns "Getting Warmed Up" at 1% spent', () => {
    const state = createStateWithSpentPercent(1);
    expect(getSpendTier(state)).toBe('Getting Warmed Up');
  });

  it('returns "Getting Warmed Up" at 9.9%', () => {
    const state = createStateWithSpentPercent(9.9);
    expect(getSpendTier(state)).toBe('Getting Warmed Up');
  });

  it('returns "Serious Spender" at 10% spent', () => {
    const state = createStateWithSpentPercent(10);
    expect(getSpendTier(state)).toBe('Serious Spender');
  });

  it('returns "Big Baller" at 25% spent', () => {
    const state = createStateWithSpentPercent(25);
    expect(getSpendTier(state)).toBe('Big Baller');
  });

  it('returns "Fortune Crusher" at 50% spent', () => {
    const state = createStateWithSpentPercent(50);
    expect(getSpendTier(state)).toBe('Fortune Crusher');
  });

  it('returns "Nearly Broke" at 75% spent', () => {
    const state = createStateWithSpentPercent(75);
    expect(getSpendTier(state)).toBe('Nearly Broke');
  });

  it('returns "Legendary Overspender" at exactly 100% spent', () => {
    const state = createStateWithSpentPercent(100);
    expect(getSpendTier(state)).toBe('Legendary Overspender');
  });

  it('returns "Legendary Overspender" if balance goes below 0 (e.g. 110% spent)', () => {
    const state = createStateWithSpentPercent(110);
    expect(getSpendTier(state)).toBe('Legendary Overspender');
  });

  it('returns "Window Shopping" if amount spent is negative (e.g. earned money)', () => {
    const state = createStateWithSpentPercent(-10);
    expect(getSpendTier(state)).toBe('Window Shopping');
  });

  it('handles startingBalance of 0 without error', () => {
    const state = createInitialState(0);
    // percentSpent returns 0 if startingBalance <= 0
    expect(getSpendTier(state)).toBe('Window Shopping');
  });
});
