import { describe, it, expect } from 'vitest';
import { canAfford, createInitialState, ShopItem } from '../gameEngine';

describe('gameEngine - canAfford', () => {
  const mockItem: ShopItem = {
    id: 'test-item',
    name: 'Test Item',
    price: 100,
    emoji: '🧪',
    category: 'Absurd',
    flavor: 'A tasty test item.'
  };

  it('should return true if balance is greater than the total price (happy path)', () => {
    const state = createInitialState(1000);
    expect(canAfford(state, mockItem, 2)).toBe(true); // 2 * 100 = 200 <= 1000
  });

  it('should return true if balance is exactly equal to the total price', () => {
    const state = createInitialState(100);
    expect(canAfford(state, mockItem, 1)).toBe(true); // 1 * 100 = 100 <= 100
  });

  it('should return false if balance is less than the total price (insufficient funds)', () => {
    const state = createInitialState(50);
    expect(canAfford(state, mockItem, 1)).toBe(false); // 1 * 100 = 100 > 50
  });

  it('should return false if quantity is 0', () => {
    const state = createInitialState(1000);
    expect(canAfford(state, mockItem, 0)).toBe(false); // qty > 0 check fails
  });

  it('should return false if quantity is negative', () => {
    const state = createInitialState(1000);
    expect(canAfford(state, mockItem, -1)).toBe(false); // qty > 0 check fails
  });

  it('should handle zero price items (e.g. free items)', () => {
    const freeItem: ShopItem = { ...mockItem, price: 0 };
    const state = createInitialState(1000);
    expect(canAfford(state, freeItem, 1)).toBe(true);
    expect(canAfford(state, freeItem, 10)).toBe(true);
  });
});
