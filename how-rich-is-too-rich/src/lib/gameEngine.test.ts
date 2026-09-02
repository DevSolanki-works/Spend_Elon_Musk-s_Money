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
import { describe, it, expect, beforeEach } from 'vitest';
import {
  STARTING_NET_WORTH,
  ACHIEVEMENTS,
  WEALTH_MILESTONES,
  SECRET_ITEM_ID,
  createInitialState,
  amountSpent,
  percentSpent,
  percentRemaining,
  canAfford,
  getMaxAffordableQty,
  purchase,
  applyDelta,
  reset,
  getElapsedSeconds,
  getItemCount,
  getSpendTier,
  checkNewAchievements,
  withUnlockedAchievements,
  checkNewMilestones,
  withUnlockedMilestones,
  buildSecretItem,
  usdToDoge,
  formatUsd,
  formatDoge,
  type GameState,
  type ShopItem,
  type Achievement,
  type WealthMilestone
} from './gameEngine';

describe('gameEngine', () => {
  describe('State Initialization', () => {
    it('creates initial state with default starting balance', () => {
      const state = createInitialState();
      expect(state.startingBalance).toBe(STARTING_NET_WORTH);
      expect(state.balance).toBe(STARTING_NET_WORTH);
      expect(state.counts).toEqual({});
      expect(state.log).toEqual([]);
      expect(state.unlockedAchievements).toEqual([]);
      expect(state.unlockedMilestones).toEqual([]);
      expect(state.secretRevealed).toBe(false);
      expect(state.secretPurchased).toBe(false);
      expect(state.startedAt).toBeLessThanOrEqual(Date.now());
    });

    it('creates initial state with custom starting balance', () => {
      const state = createInitialState(1000);
      expect(state.startingBalance).toBe(1000);
      expect(state.balance).toBe(1000);
    });

    it('resets state to initial state', () => {
      const state = reset(5000);
      expect(state.startingBalance).toBe(5000);
      expect(state.balance).toBe(5000);
      expect(state.counts).toEqual({});
    });
  });

  describe('Core Math', () => {
    let state: GameState;

    beforeEach(() => {
      state = createInitialState(1000);
    });

    it('calculates amount spent', () => {
      expect(amountSpent(state)).toBe(0);
      state.balance = 800;
      expect(amountSpent(state)).toBe(200);
      state.balance = 1200; // if gained via mini-game
      expect(amountSpent(state)).toBe(-200);
    });

    it('calculates percent spent', () => {
      expect(percentSpent(state)).toBe(0);
      state.balance = 500;
      expect(percentSpent(state)).toBe(50);
      state.balance = 0;
      expect(percentSpent(state)).toBe(100);
    });

    it('handles percent spent with 0 starting balance', () => {
      const zeroState = createInitialState(0);
      expect(percentSpent(zeroState)).toBe(0);
    });

    it('calculates percent remaining', () => {
      expect(percentRemaining(state)).toBe(100);
      state.balance = 500;
      expect(percentRemaining(state)).toBe(50);
      state.balance = 0;
      expect(percentRemaining(state)).toBe(0);
    });
  });

  describe('Affordability', () => {
    let state: GameState;
    const testItem: ShopItem = {
      id: 'test-item',
      name: 'Test Item',
      price: 100,
      emoji: '🧪',
      category: 'Absurd',
      flavor: 'Just testing.'
    };

    beforeEach(() => {
      state = createInitialState(1000);
    });

    it('determines if item can be afforded', () => {
      expect(canAfford(state, testItem, 1)).toBe(true);
      expect(canAfford(state, testItem, 10)).toBe(true);
      expect(canAfford(state, testItem, 11)).toBe(false);
    });

    it('cannot afford 0 or negative quantities', () => {
      expect(canAfford(state, testItem, 0)).toBe(false);
      expect(canAfford(state, testItem, -1)).toBe(false);
    });

    it('gets max affordable quantity', () => {
      expect(getMaxAffordableQty(state, testItem)).toBe(10);
      state.balance = 550;
      expect(getMaxAffordableQty(state, testItem)).toBe(5);
      state.balance = 0;
      expect(getMaxAffordableQty(state, testItem)).toBe(0);
    });

    it('gets max affordable quantity for 0 or negative priced item', () => {
      const freeItem = { ...testItem, price: 0 };
      expect(getMaxAffordableQty(state, freeItem)).toBe(0);

      const negativeItem = { ...testItem, price: -10 };
      expect(getMaxAffordableQty(state, negativeItem)).toBe(0);
    });
  });

  describe('Purchasing and State Mutation', () => {
    let state: GameState;
    const testItem: ShopItem = {
      id: 'test-item',
      name: 'Test Item',
      price: 100,
      emoji: '🧪',
      category: 'Absurd',
      flavor: 'Just testing.'
    };

    beforeEach(() => {
      state = createInitialState(1000);
    });

    it('purchases an item successfully', () => {
      const newState = purchase(state, testItem, 2);
      expect(newState.balance).toBe(800);
      expect(newState.counts[testItem.id]).toBe(2);
      expect(newState.log.length).toBe(1);

      const logEntry = newState.log[0];
      expect(logEntry.itemId).toBe(testItem.id);
      expect(logEntry.qty).toBe(2);
      expect(logEntry.total).toBe(200);
      expect(logEntry.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('does not mutate original state on purchase', () => {
      const newState = purchase(state, testItem, 1);
      expect(state.balance).toBe(1000);
      expect(newState.balance).toBe(900);
    });

    it('accumulates counts on multiple purchases', () => {
      let newState = purchase(state, testItem, 2);
      newState = purchase(newState, testItem, 3);
      expect(newState.counts[testItem.id]).toBe(5);
    });

    it('returns original state if item cannot be afforded', () => {
      const newState = purchase(state, testItem, 11);
      expect(newState).toBe(state);
      expect(newState.balance).toBe(1000);
    });

    it('returns original state for invalid quantities', () => {
      let newState = purchase(state, testItem, 0);
      expect(newState).toBe(state);

      newState = purchase(state, testItem, -5);
      expect(newState).toBe(state);
    });

    it('sets secretPurchased when purchasing secret item', () => {
      const secretItem = { ...testItem, id: SECRET_ITEM_ID };
      const newState = purchase(state, secretItem, 1);
      expect(newState.secretPurchased).toBe(true);
    });

    it('applies arbitrary delta to balance', () => {
      const newState = applyDelta(state, 'mini-game win', 500);
      expect(newState.balance).toBe(1500);
      expect(newState.log.length).toBe(1);
      expect(newState.log[0].name).toBe('mini-game win');
      expect(newState.log[0].total).toBe(500);
      expect(newState.log[0].itemId).toBe('minigame:mini-game win');
    });

    it('does not mutate original state on applyDelta', () => {
      const newState = applyDelta(state, 'loss', -100);
      expect(state.balance).toBe(1000);
      expect(newState.balance).toBe(900);
    });
  });

  describe('Utilities and Formatting', () => {
    let state: GameState;
    const testItem: ShopItem = {
      id: 'test-item',
      name: 'Test Item',
      price: 100,
      emoji: '🧪',
      category: 'Absurd',
      flavor: 'Just testing.'
    };

    beforeEach(() => {
      state = createInitialState(1000);
    });

    it('calculates elapsed seconds', () => {
      const start = Date.now();
      state.startedAt = start - 5000;
      expect(getElapsedSeconds(state)).toBeGreaterThanOrEqual(5);
    });

    it('gets total item count', () => {
      expect(getItemCount(state)).toBe(0);
      state.counts = { itemA: 2, itemB: 3 };
      expect(getItemCount(state)).toBe(5);
    });

    it('gets appropriate spend tier', () => {
      expect(getSpendTier(state)).toBe('Window Shopping');

      state.balance = 999;
      expect(getSpendTier(state)).toBe('Casual Browser');

      state.balance = 500;
      expect(getSpendTier(state)).toBe('Fortune Crusher');

      state.balance = 0;
      expect(getSpendTier(state)).toBe('Legendary Overspender');
    });

    it('checks new achievements', () => {
      expect(checkNewAchievements(state)).toEqual([]);

      // Give enough spend for 'Casual Spender' (id: casual) which is $1,000 threshold
      state.startingBalance = STARTING_NET_WORTH;
      state.balance = STARTING_NET_WORTH - 1000;

      const newAchievements = checkNewAchievements(state);
      expect(newAchievements.length).toBe(1);
      expect(newAchievements[0].id).toBe('casual');
    });

    it('adds unlocked achievements', () => {
      const achievements: Achievement[] = [
        { id: 'casual', thresholdSpent: 1000, label: 'Casual', emoji: '🍔' }
      ];

      const newState = withUnlockedAchievements(state, achievements);
      expect(newState.unlockedAchievements).toContain('casual');

      // Does not mutate
      expect(state.unlockedAchievements.length).toBe(0);
    });

    it('returns same state if no new achievements to unlock', () => {
      const newState = withUnlockedAchievements(state, []);
      expect(newState).toBe(state);
    });

    it('checks new milestones', () => {
      expect(checkNewMilestones(state)).toEqual([]);

      // Reach century milestone which requires 10T
      state.balance = 10_000_000_000_000;
      const newMilestones = checkNewMilestones(state);
      expect(newMilestones.length).toBe(1);
      expect(newMilestones[0].id).toBe('century');
    });

    it('adds unlocked milestones', () => {
      const milestones: WealthMilestone[] = [
        { id: 'century', threshold: 10_000_000_000_000, title: 'Title', subtitle: 'Sub', emoji: '👑' }
      ];

      const newState = withUnlockedMilestones(state, milestones);
      expect(newState.unlockedMilestones).toContain('century');

      // Does not mutate
      expect(state.unlockedMilestones.length).toBe(0);
    });

    it('returns same state if no new milestones to unlock', () => {
      const newState = withUnlockedMilestones(state, []);
      expect(newState).toBe(state);
    });

    it('builds the secret item properly', () => {
      state.balance = 12345;
      const secret = buildSecretItem(state);
      expect(secret.id).toBe(SECRET_ITEM_ID);
      expect(secret.price).toBe(12345);

      // Price floored at 0
      state.balance = -100;
      const secretNeg = buildSecretItem(state);
      expect(secretNeg.price).toBe(0);
    });

    it('converts USD to Doge', () => {
      // 1 USD = 1/0.15 Doge = 6.666 Doge
      const doge = usdToDoge(0.15);
      expect(doge).toBeCloseTo(1, 5);
      expect(usdToDoge(15)).toBeCloseTo(100, 5);
    });

    it('formats USD values properly', () => {
      expect(formatUsd(50)).toBe('$50.00');
      expect(formatUsd(1500)).toBe('$1.5K');
      expect(formatUsd(1_500_000)).toBe('$1.50M');
      expect(formatUsd(1_500_000_000)).toBe('$1.500B');
      expect(formatUsd(1_500_000_000_000)).toBe('$1.500T');
      expect(formatUsd(-50)).toBe('-$50.00');
    });

    it('formats Doge values properly', () => {
      expect(formatDoge(0.15)).toBe('Ð1.00'); // $0.15 = 1 Doge
      expect(formatDoge(150)).toBe('Ð1.0K');   // $150 = 1000 Doge
      expect(formatDoge(150_000)).toBe('Ð1.00M');
      expect(formatDoge(-0.15)).toBe('-Ð1.00');
    });
  });
});
