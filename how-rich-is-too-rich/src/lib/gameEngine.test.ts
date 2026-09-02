import { describe, it, expect } from 'vitest';
import { createInitialState, STARTING_NET_WORTH } from './gameEngine';

describe('createInitialState', () => {
  it('creates state with default starting balance', () => {
    const beforeTime = Date.now();
    const state = createInitialState();
    const afterTime = Date.now();

    expect(state.startingBalance).toBe(STARTING_NET_WORTH);
    expect(state.balance).toBe(STARTING_NET_WORTH);
    expect(state.counts).toEqual({});
    expect(state.log).toEqual([]);
    expect(state.unlockedAchievements).toEqual([]);
    expect(state.unlockedMilestones).toEqual([]);
    expect(state.secretRevealed).toBe(false);
    expect(state.secretPurchased).toBe(false);
    expect(state.startedAt).toBeGreaterThanOrEqual(beforeTime);
    expect(state.startedAt).toBeLessThanOrEqual(afterTime);
  });

  it('creates state with custom starting balance', () => {
    const customBalance = 5000;
    const state = createInitialState(customBalance);

    expect(state.startingBalance).toBe(customBalance);
    expect(state.balance).toBe(customBalance);
  });
});
