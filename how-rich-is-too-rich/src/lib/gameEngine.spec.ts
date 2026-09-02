import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  canAfford,
  getMaxAffordableQty,
  purchase,
  createInitialState,
  GameState,
  ShopItem,
  SECRET_ITEM_ID
} from './gameEngine';

describe('Game Engine Purchase Logic', () => {
  let state: GameState;
  const standardItem: ShopItem = {
    id: 'test-item',
    name: 'Test Item',
    price: 100,
    emoji: '📦',
    category: 'Companies',
    flavor: 'A generic test item',
  };

  const secretItem: ShopItem = {
    id: SECRET_ITEM_ID,
    name: 'Secret Item',
    price: 500,
    emoji: '🤫',
    category: 'Absurd',
    flavor: 'It is a secret',
  };

  beforeEach(() => {
    state = createInitialState(1000);
  });

  describe('canAfford', () => {
    it('returns true if the total cost is less than or equal to balance and qty > 0', () => {
      expect(canAfford(state, standardItem, 1)).toBe(true); // 100 <= 1000
      expect(canAfford(state, standardItem, 10)).toBe(true); // 1000 <= 1000
    });

    it('returns false if the total cost exceeds the balance', () => {
      expect(canAfford(state, standardItem, 11)).toBe(false); // 1100 > 1000
    });

    it('returns false if quantity is 0 or negative', () => {
      expect(canAfford(state, standardItem, 0)).toBe(false);
      expect(canAfford(state, standardItem, -5)).toBe(false);
    });
  });

  describe('getMaxAffordableQty', () => {
    it('returns the maximum quantity that can be afforded', () => {
      expect(getMaxAffordableQty(state, standardItem)).toBe(10); // 1000 / 100
      state.balance = 250;
      expect(getMaxAffordableQty(state, standardItem)).toBe(2); // floor(250 / 100)
    });

    it('returns 0 if item price is 0 or negative', () => {
      const freeItem = { ...standardItem, price: 0 };
      expect(getMaxAffordableQty(state, freeItem)).toBe(0);
      const negativeItem = { ...standardItem, price: -10 };
      expect(getMaxAffordableQty(state, negativeItem)).toBe(0);
    });

    it('returns 0 if the price exceeds current balance', () => {
      state.balance = 50;
      expect(getMaxAffordableQty(state, standardItem)).toBe(0);
    });
  });

  describe('purchase', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(1000));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('successfully purchases an item, updating balance, counts, and log', () => {
      const newState = purchase(state, standardItem, 2);

      expect(newState.balance).toBe(800); // 1000 - 200
      expect(newState.counts[standardItem.id]).toBe(2);
      expect(newState.log).toHaveLength(1);
      expect(newState.log[0]).toEqual({
        itemId: standardItem.id,
        name: standardItem.name,
        unitPrice: standardItem.price,
        qty: 2,
        total: 200,
        timestamp: 1000,
      });
      expect(newState.secretPurchased).toBe(false);
    });

    it('does not modify state if the item cannot be afforded', () => {
      const newState = purchase(state, standardItem, 11);

      expect(newState).toBe(state); // Strict equality means same object
      expect(newState.balance).toBe(1000);
      expect(newState.counts[standardItem.id]).toBeUndefined();
      expect(newState.log).toHaveLength(0);
    });

    it('updates existing item counts when purchasing an item multiple times', () => {
      const firstPurchaseState = purchase(state, standardItem, 1);
      const secondPurchaseState = purchase(firstPurchaseState, standardItem, 3);

      expect(secondPurchaseState.counts[standardItem.id]).toBe(4);
      expect(secondPurchaseState.balance).toBe(600); // 1000 - 100 - 300
    });

    it('sets secretPurchased to true when purchasing the secret item', () => {
      const newState = purchase(state, secretItem, 1);

      expect(newState.secretPurchased).toBe(true);
      expect(newState.balance).toBe(500); // 1000 - 500
    });
  });
});
