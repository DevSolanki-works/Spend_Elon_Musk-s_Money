import { describe, it, expect } from 'vitest';
import { amountSpent, createInitialState, GameState } from './gameEngine';

describe('gameEngine', () => {
  describe('amountSpent', () => {
    it('should return 0 when no money has been spent (balance equals startingBalance)', () => {
      const state = createInitialState(1000);
      expect(amountSpent(state)).toBe(0);
    });

    it('should calculate the amount spent correctly when balance is less than startingBalance', () => {
      const state = createInitialState(1000);
      state.balance = 400;
      expect(amountSpent(state)).toBe(600);
    });

    it('should return startingBalance when balance is 0 (all money spent)', () => {
      const state = createInitialState(1000);
      state.balance = 0;
      expect(amountSpent(state)).toBe(1000);
    });

    it('should return 0 when startingBalance is 0 and balance is 0', () => {
      const state = createInitialState(0);
      expect(amountSpent(state)).toBe(0);
    });

    it('should return a negative amount when balance exceeds startingBalance (money earned)', () => {
      const state = createInitialState(1000);
      state.balance = 1500;
      expect(amountSpent(state)).toBe(-500);
    });
  });
});
