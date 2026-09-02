import { describe, it, expect } from 'vitest';
import { createInitialState, percentSpent, percentRemaining } from './gameEngine';

describe('gameEngine calculations', () => {
  describe('percentSpent', () => {
    it('should return 0 when startingBalance is 0', () => {
      const state = createInitialState(0);
      expect(percentSpent(state)).toBe(0);
    });

    it('should return 0 when startingBalance is negative', () => {
      const state = createInitialState(-100);
      expect(percentSpent(state)).toBe(0);
    });

    it('should calculate correct percentage for normal spending', () => {
      const state = createInitialState(100);
      state.balance = 25; // Spent 75
      expect(percentSpent(state)).toBe(75);
    });

    it('should calculate correct percentage when everything is spent', () => {
      const state = createInitialState(100);
      state.balance = 0; // Spent 100
      expect(percentSpent(state)).toBe(100);
    });
  });

  describe('percentRemaining', () => {
    it('should return 100 when startingBalance is 0', () => {
      const state = createInitialState(0);
      expect(percentRemaining(state)).toBe(100);
    });

    it('should return 100 when startingBalance is negative', () => {
      const state = createInitialState(-50);
      expect(percentRemaining(state)).toBe(100);
    });

    it('should calculate correct percentage for normal remaining balance', () => {
      const state = createInitialState(100);
      state.balance = 25; // Spent 75, Remaining 25%
      expect(percentRemaining(state)).toBe(25);
    });
  });
});
