// netWorthGame.ts — pure, portable game state logic.
// No DOM, no framework. UI code imports and calls these functions.

export type Category = 'Vehicles' | 'Real Estate' | 'Companies' | 'Absurd' | 'Space';

export interface ShopItem {
  id: string;
  name: string;
  price: number; // USD, base unit
  emoji: string;
  category: Category;
  flavor: string;
}

export interface PurchaseLogEntry {
  itemId: string;
  name: string;
  unitPrice: number;
  qty: number;
  total: number;
  timestamp: number;
}

export interface GameState {
  startingBalance: number;
  balance: number;
  counts: Record<string, number>;
  log: PurchaseLogEntry[];
  unlockedAchievements: string[];
  secretRevealed: boolean;
  secretPurchased: boolean;
}

export interface Achievement {
  id: string;
  thresholdSpent: number; // USD amount spent to trigger
  label: string;
  emoji: string;
}

// $1,000,000,000,000 — a single configurable constant, illustrative public estimate,
// not real-time or authoritative financial data. Update manually every few months.
export const STARTING_NET_WORTH = 1_000_000_000_000;

export const DOGE_USD_RATE = 0.15; // 1 DOGE = $0.15 USD (illustrative, fixed for gameplay)

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'casual', thresholdSpent: 1_000, label: 'Casual Spender', emoji: '🍔' },
  { id: 'pickup', thresholdSpent: 100_000, label: 'Angular Pickup Flexer', emoji: '📐' },
  { id: 'platform', thresholdSpent: 44_000_000_000, label: 'Platform Buyout Baron', emoji: '❌' },
  { id: 'infra', thresholdSpent: 500_000_000_000, label: 'Infrastructure Mogul', emoji: '🛣️' },
  { id: 'zero', thresholdSpent: 1_000_000_000_000, label: 'Zero Balance Achievement', emoji: '💸' },
];

export const SECRET_ITEM_ID = 'secret-mama';

export function createInitialState(startingBalance: number = STARTING_NET_WORTH): GameState {
  return {
    startingBalance,
    balance: startingBalance,
    counts: {},
    log: [],
    unlockedAchievements: [],
    secretRevealed: false,
    secretPurchased: false,
  };
}

export function amountSpent(state: GameState): number {
  return state.startingBalance - state.balance;
}

export function percentSpent(state: GameState): number {
  if (state.startingBalance <= 0) return 0;
  return (amountSpent(state) / state.startingBalance) * 100;
}

export function percentRemaining(state: GameState): number {
  return 100 - percentSpent(state);
}

export function canAfford(state: GameState, item: ShopItem, qty: number): boolean {
  return qty > 0 && item.price * qty <= state.balance;
}

export function purchase(state: GameState, item: ShopItem, qty: number): GameState {
  if (!canAfford(state, item, qty)) return state;
  const total = item.price * qty;
  const nextCounts = { ...state.counts, [item.id]: (state.counts[item.id] ?? 0) + qty };
  const entry: PurchaseLogEntry = {
    itemId: item.id,
    name: item.name,
    unitPrice: item.price,
    qty,
    total,
    timestamp: Date.now(),
  };
  return {
    ...state,
    balance: state.balance - total,
    counts: nextCounts,
    log: [...state.log, entry],
    secretPurchased: item.id === SECRET_ITEM_ID ? true : state.secretPurchased,
  };
}

export function sell(state: GameState, item: ShopItem, qty: number): GameState {
  const owned = state.counts[item.id] ?? 0;
  const sellQty = Math.min(qty, owned);
  if (sellQty <= 0) return state;
  const refund = item.price * sellQty;
  const nextCounts = { ...state.counts, [item.id]: owned - sellQty };
  return {
    ...state,
    balance: state.balance + refund,
    counts: nextCounts,
  };
}

export function reset(startingBalance: number = STARTING_NET_WORTH): GameState {
  return createInitialState(startingBalance);
}

/** Returns achievements newly crossed since the last check (does not mutate state). */
export function checkNewAchievements(state: GameState): Achievement[] {
  const spent = amountSpent(state);
  return ACHIEVEMENTS.filter(
    (a) => spent >= a.thresholdSpent && !state.unlockedAchievements.includes(a.id)
  );
}

export function withUnlockedAchievements(state: GameState, newly: Achievement[]): GameState {
  if (newly.length === 0) return state;
  return {
    ...state,
    unlockedAchievements: [...state.unlockedAchievements, ...newly.map((a) => a.id)],
  };
}

/** Builds the dynamically-priced secret item, priced at the player's entire remaining balance. */
export function buildSecretItem(state: GameState): ShopItem {
  return {
    id: SECRET_ITEM_ID,
    name: 'Your Mama',
    price: Math.max(state.balance, 0),
    emoji: '💀',
    category: 'Absurd',
    flavor: "Empties the tank. There's no refund on this one.",
  };
}

export function usdToDoge(usd: number): number {
  return usd / DOGE_USD_RATE;
}

export function formatUsd(usd: number): string {
  const abs = Math.abs(usd);
  const sign = usd < 0 ? '-' : '';
  if (abs >= 1_000_000_000_000) return `${sign}$${(abs / 1_000_000_000_000).toFixed(3)}T`;
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(3)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

export function formatDoge(usd: number): string {
  const doge = usdToDoge(usd);
  const abs = Math.abs(doge);
  const sign = doge < 0 ? '-' : '';
  if (abs >= 1_000_000_000_000) return `${sign}Ð${(abs / 1_000_000_000_000).toFixed(3)}T`;
  if (abs >= 1_000_000_000) return `${sign}Ð${(abs / 1_000_000_000).toFixed(3)}B`;
  if (abs >= 1_000_000) return `${sign}Ð${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}Ð${(abs / 1_000).toFixed(1)}K`;
  return `${sign}Ð${abs.toFixed(2)}`;
}