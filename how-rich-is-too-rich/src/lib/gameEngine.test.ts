import { describe, it, expect } from 'vitest';
import {
  checkNewAchievements,
  withUnlockedAchievements,
  createInitialState,
  ACHIEVEMENTS,
  GameState
} from './gameEngine';

describe('gameEngine - Achievements', () => {
  describe('checkNewAchievements', () => {
    it('returns empty array when no achievements have been met', () => {
      const state = createInitialState(1_000_000);
      // spent is 0
      const newAchievements = checkNewAchievements(state);
      expect(newAchievements).toEqual([]);
    });

    it('returns newly crossed achievements based on amount spent', () => {
      const state = createInitialState(1_000_000);
      // spent is 100_000 (casual = 1,000, pickup = 100_000)
      state.balance = 1_000_000 - 100_000;

      const newAchievements = checkNewAchievements(state);

      expect(newAchievements).toHaveLength(2);
      expect(newAchievements.map(a => a.id)).toEqual(['casual', 'pickup']);
    });

    it('filters out already unlocked achievements', () => {
      const state = createInitialState(1_000_000);
      state.balance = 1_000_000 - 100_000;
      state.unlockedAchievements = ['casual'];

      const newAchievements = checkNewAchievements(state);

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('pickup');
    });

    it('can return all achievements if spent threshold is met', () => {
      const state = createInitialState(1_000_000_000_000);
      // spent all
      state.balance = 0;

      const newAchievements = checkNewAchievements(state);

      expect(newAchievements).toHaveLength(ACHIEVEMENTS.length);
    });
  });

  describe('withUnlockedAchievements', () => {
    it('returns the same state object if no new achievements', () => {
      const state = createInitialState(1_000_000);
      const nextState = withUnlockedAchievements(state, []);

      expect(nextState).toBe(state); // Strict equality
    });

    it('adds new achievements to unlockedAchievements', () => {
      const state = createInitialState(1_000_000);
      state.unlockedAchievements = ['casual'];

      const newAchievements = [ACHIEVEMENTS.find(a => a.id === 'pickup')!];
      const nextState = withUnlockedAchievements(state, newAchievements);

      expect(nextState).not.toBe(state);
      expect(nextState.unlockedAchievements).toEqual(['casual', 'pickup']);
    });
  });
});
