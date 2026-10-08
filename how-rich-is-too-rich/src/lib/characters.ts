export interface Character {
  slug: string;
  isHome?: boolean;
  displayName: string;
  shortName: string;
  avatarId: string;
  tagline: string;
  netWorth: number;
  netWorthLabel: string;
  netWorthSource: string;
  netWorthAsOf: string;
  metaTitle: string;
  metaDescription: string;
  disclaimerShort: string;
}

// Vite glob-imports every character JSON file. To add a new billionaire in a
// future pSEO pass: drop a new file in src/data/characters/ following the
// same shape as elon-musk.json — no code changes needed anywhere else.
const modules = import.meta.glob<Character>("../data/characters/*.json", {
  eager: true,
  import: "default",
});

export const characters: Character[] = Object.values(modules);

export function getHomeCharacter(): Character {
  const home = characters.find((c) => c.isHome);
  if (!home) throw new Error("No character marked isHome: true in src/data/characters/*.json");
  return home;
}

export function getCharacterBySlug(slug: string): Character | undefined {
  return characters.find((c) => c.slug === slug);
}

// Characters other than the homepage one get their own /[slug] route.
// This keeps Elon at "/" for the primary keyword while leaving room to add
// Bezos, MrBeast, etc. later purely via data (Phase 5+ pSEO expansion).
export function getRoutableCharacters(): Character[] {
  return characters.filter((c) => !c.isHome);
}

export function formatUSD(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(amount % 1_000_000_000 === 0 ? 0 : 1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  return `${amount.toLocaleString("en-US")}`;
}
