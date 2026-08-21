# 🚀 CLAUDE.md — Project Blueprint: "How Rich Is Too Rich"

> **How to use this file:** This is the complete, current source of truth for the project —
> not a diff. If you're starting a new chat, attach or paste this whole file and Claude will
> have full context without needing the conversation history. This file replaces
> `CLAUDE-update.md`, `CLAUDE-update-v2.md`, and `CLAUDE-update-v3.md` — those are now obsolete
> and can be deleted.

A fun, shareable, 100% client-side game where players spend a billionaire's fortune on real
(and absurd) things until it hits zero — or, if they're lucky in the right mini-game, watch it
multiply into numbers that shouldn't exist. Built for virality + programmatic SEO + AdSense
revenue.

**Working title / domain:** How Rich Is Too Rich — **how-rich-is-too-rich.com** (domain being
purchased now; site config already points at it).
**Contact email for all pages** (footer, `/contact`, `/privacy-policy`, etc.):
**dev.solanki.works@gmail.com**

---

## 1. Project Identity & Goal

A satirical, playful spending-simulator game. The player starts with a flat, illustrative
**$1 trillion** and spends it on generic/parody items (rockets, mansions, sports teams, a
national highway overhaul) until they're done — there's no forced "broke" state, they hit
**Checkout** whenever they want a summary. Along the way: mini-games, hidden secrets, a
timed hint system, and two near-impossible wealth achievements with shareable certificates.

**Why it works for pSEO + AdSense:**
- High search volume, evergreen curiosity keyword ("spend elon musk money game", "billionaire
  spending simulator").
- Naturally shareable — checkout receipt and achievement certificates are both
  downloadable/shareable images.
- Long time-on-page (good for AdSense RPM): it's a game with mini-games and a slow-reveal hint
  system, not a one-shot tool.
- Architected so a second billionaire page is *meant* to be a data-only change later (see
  Section 8 — currently not wired up, needs a decision).

**Framing decision — parody/commentary, not fact-reporting:**
- Satire, not a financial product. Net worth figures are clearly labeled as illustrative,
  publicly-reported estimates, not real-time data.
- No implication that Elon Musk endorses, sponsors, or is affiliated with the site.
- No real photos, logos, or trademarked product names anywhere — emoji + generic/parody
  item names only (e.g. "Angular Electric Pickup," not the real vehicle name).
- Elon Musk's name is **deliberately kept** in the page `<title>`, meta description, and H1/H2
  copy for SEO, even though gameplay has grown well beyond a single-character premise. The
  on-page copy is honest about this: it says the game "started as a simple 'spend Elon Musk's
  money' idea and has grown into its own little universe."

---

## 2. Tech Stack & Environment

- **Framework:** AstroJS 7, static generation.
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` (CSS-first config, `@theme` block).
- **Interactivity:** Vanilla TypeScript in `<script>` tags. No React/Vue.
- **State:** In-memory only, plus `localStorage` for a "best score" (fewest buys) — nothing is
  sent to a server.
- **Hosting (planned):** Cloudflare Pages — **not deployed yet** (see Next Steps).
- **Dev environment:** Windows 11 ARM64. Native ARM64 Node ≥22.12. Avoid packages needing
  `node-gyp` native builds where possible.

---

## 3. Design System — "Carnival Poster" (current, locked)

Superseded two earlier attempts: a muted "receipt/cash register" look (v1), then a dark
SpaceX-style "Mission Control" telemetry HUD (tried and explicitly rejected — read as a
serious financial dashboard, "AI slop," wrong register for a satirical toy).

- **Aesthetic:** Bright, warm, comic-book toy — a game-show set, not a dashboard. Flat color
  only, no gradients/glow/glassmorphism (the *certificate canvas* is the one deliberate
  exception — gold/pink gradient border, because certificates conventionally look ornate).
- **Color palette:**
  - Cream background `#FFFBF2`, white raised cards `#FFFFFF`, ticket paper `#FFF4DE`,
    near-black ink `#1A1508` (text/borders), amber `#FFC630` (primary accent), green
    `#16A34A` / red `#E11D3C` (credit/debit), pink `#E0328B` (extra-fun accent).
  - Category accents: Vehicles `#3FA9F5`, Real Estate `#2FE3B4`, Companies `#B388FF`,
    Space `#7C83FD`, Absurd `#FF3D8F`.
- **Signature UI trick — `.brutal` utility:** thick 2px black border + hard 4px offset shadow
  (no blur), wobbles/rotates slightly on hover, presses down on active. Applied to every card,
  button, and modal panel.
- **Typography:** Space Grotesk (display/headings), Inter (body), IBM Plex Mono (numbers/
  receipts) — Google Fonts CDN.
- **Item art:** Emoji only — zero licensing risk.
- **Item names:** Generic/parody only, no real brand names or trademarks.
- **Motion:** Bump/wobble on purchase, screen-shake on big spends (≥5% of starting balance),
  confetti burst on checkout/big wins/certificates, bouncy sticker-style toasts.
  `prefers-reduced-motion` respected globally.

---

## 4. Game Design Spec (current, full)

### Economy
- **Starting balance:** flat **$1,000,000,000,000** (`STARTING_NET_WORTH` constant in
  `gameEngine.ts`), footnoted everywhere as an illustrative estimate, not live data.
- **Shop:** 20 items across 5 categories, $10 to $500B, all generic/parody names. Full list
  and prices live in `src/data/items.ts`.

### Core loop
- Category tabs filter the shop (All / Vehicles / Real Estate / Companies / Space / Absurd).
- Each card: quantity input + MAX quick-fill + Buy button. **No Sell** — balance can go
  negative, nothing ever locks or forces a "broke" state.
- **Checkout** (always available) opens a summary modal: total spent, elapsed time, a
  spend-tier label (Window Shopping → Casual Browser → Getting Warmed Up → Serious Spender →
  Big Baller → Fortune Crusher → Nearly Broke → Legendary Overspender), 1–2 playful
  comparisons ("= 400 mega-mansions"), and a **downloadable canvas-rendered receipt image**.
- **Achievements** (spend-based, toast notification): Casual Spender ($1K spent) → Angular
  Pickup Flexer ($100K) → Platform Buyout Baron ($44B) → Infrastructure Mogul ($500B) → Zero
  Balance Achievement ($1T, i.e. fully spent). Defined in `ACHIEVEMENTS` in `gameEngine.ts`.
- **Doge Mode:** header toggle (`$` ↔ `Ð`), converts all displayed prices/balance at a fixed
  illustrative rate (1 DOGE = $0.15 USD). Display-only, doesn't touch game math.
- **Sound FX:** synthesized via Web Audio API (click / coin chime / launch rumble / victory
  jingle / sad tone) — zero external audio files. Global on/off toggle.
- **Best score:** fewest total buys to complete a run, persisted in `localStorage`, shown next
  to Reset.

### Secrets (5 total)
| # | Secret | Trigger |
|---|---|---|
| 1 | "Your Mama 💀" — hidden shop item, priced at your entire remaining balance | Tap the header title **5×** quickly |
| 2 | 💰 Money Rain mini-game | Tap the `$` logo icon **3×** quickly |
| 3 | 🎉 Chaos Mode (cosmetic only — 5s rainbow hue-cycle + wobble, no game effect) | Type **`YOLO`** anywhere outside a form field |
| 4 | 🃏 Double or Nothing Vault mini-game | Tap the balance number **4×** quickly |
| 5 | 🎁 Mystery Chest mini-game | Type **`CHEST`** anywhere outside a form field |

### Mini-games (4 total)
- **🎰 Lucky Spin** (always visible, header button). Entry fee is **dynamic**: the greater of
  $50B or 2% of current balance, so it stays meaningful even after a huge win. Slot-reel spin,
  multiplier ladder 0 / 0.5x / 1x / 2x / 5x / 10x / 25x / 50x / **100x MEGA JACKPOT**, weighted
  pool biased toward the low end (`SPIN_WEIGHTED_POOL` in `index.astro`).
- **💰 Money Rain** (secret #2). 10-second timed catch game. Rebalanced for desktop playability
  after user feedback that it was too hard with a mouse: large targets (text-6xl, padded hit
  area), fall over 4.5–6.5s, spawn every 700ms, catch on **pointerdown AND pointerenter**
  (hover-catch). Payouts: 💵 $50M–200M (weight 6), 💰 $500M–2B (weight 3), 💎 $5B–20B
  (weight 1).
- **🃏 Double or Nothing Vault** (secret #4). Player stakes an amount (default suggestion: 5%
  of balance), then flips a fair 50/50 coin: win doubles the pot, lose forfeits it entirely.
  Cash out anytime. **This is the only realistic path to the wealth milestones below** — an
  n-win streak multiplies the stake by 2ⁿ. Closing the modal mid-run auto-cashes-out the
  current pot rather than silently losing it.
- **🎁 Mystery Chest** (secret #5). One-shot weighted bonus: Small $1B–5B (weight 6), Medium
  $10B–50B (weight 3), Large $100B–300B (weight 1). 60-second cooldown between opens so it
  can't be farmed for infinite money.

### Wealth milestones — the "how rich is too rich" payoff
Checked against current **balance**, not amount spent (spending alone can never push balance
above the $1T start — only mini-game winnings can).

- **$10T balance → "Richest Person of the Century" 👑** — needs roughly an 8-win Double-or-
  Nothing streak from a typical stake (~0.4% chance per attempt at that stake size).
- **$100T balance → "The Richest Person Who Will Ever Exist" 🏆** — needs roughly an 11-win
  streak (~0.05% per attempt). Intentionally near-impossible, not literally impossible.
- Both auto-open a **canvas-rendered certificate**: ornate gold/pink gradient border,
  achievement title, the amount reached, date, and `location.hostname` printed directly on the
  image + "Think you can beat this? Play now." — so a shared image carries its own back-link
  even with no backend for unique share URLs. Download button always available; Share button
  uses the Web Share API where supported (mostly mobile), falling back to download + a
  clipboard-copied caption (which includes `location.origin`) otherwise.
- **Tuning knobs if 10T/100T feel wrong after playtesting:** the default stake suggestion
  (`Math.round(state.balance * 0.05)` in `openDouble()`) or the coin-flip odds (currently a
  fair `Math.random() < 0.5` in the `dbl-flip` handler) in `src/pages/index.astro`.

### Time-based hint box + 100-minute achievement
A session timer (starts on page load, **does not persist across reloads** — see Next Steps)
reveals one hint at a time, each pointing at a secret without fully spelling out the trigger:

| Minute | Reveals hint toward |
|---|---|
| 15 | Secret #1 (Your Mama) |
| 30 | Secret #2 (Money Rain) |
| 45 | Secret #3 (Chaos Mode) |
| 60 | Secret #4 (Double or Nothing) |
| 80 | Secret #5 (Mystery Chest) |
| 100 | **Not a hint — a reward.** Same certificate treatment as the wealth milestones, titled "Time Traveler ⏱️" |

A floating "💡 Hints" button appears bottom-left the moment the first hint unlocks (invisible
before that) and opens a panel listing everything earned so far.

### Easter-egg teaser
A dedicated block near the bottom of the page (below the FAQ) invites players to hunt for "a
legendary secret item, a couple of hidden mini-games, a magic word or two, and two absurd
wealth achievements that almost nobody will ever unlock" — without listing exact triggers —
and mentions hints "start finding you" the longer you stay.

### No dark patterns
All mini-game "gambling" is explicitly play-money and framed as satire. Nothing gates content
behind email capture, forced waiting, or paid mechanics.

---

## 5. File Map (current state)

**Rebuilt / current this pass:**
- `src/pages/index.astro` — the whole game (shop, checkout, all 4 mini-games, hint box,
  certificates, SEO content + FAQ + easter-egg teaser).
- `src/lib/gameEngine.ts` — pure state logic: purchase/reset/applyDelta, spend achievements,
  wealth milestones, spend-tier labels, Doge conversion, formatting helpers.
- `src/data/items.ts` — the 20-item shop dataset.
- `src/layouts/Layout.astro` — SEO meta, OG/Twitter tags, FAQPage JSON-LD, Carnival Poster
  global CSS tokens. Accepts **either** a `path` prop (canonical resolved against
  `astro.config.mjs`'s `site`) **or** a full `canonicalUrl` override — this dual support was a
  bug fix (see Section 7).
- `astro.config.mjs` — `site: 'https://how-rich-is-too-rich.com'`.
- `public/robots.txt` — sitemap URL points at the real domain.

**Unchanged, still in use:**
- `src/pages/privacy-policy.astro`, `about.astro`, `terms.astro`, `contact.astro`,
  `disclaimer.astro`, `404.astro`, `500.astro` — all call `<Layout path="...">`, all still work
  against the fixed `Layout.astro`.
- `src/components/Footer.astro` — used by the legal pages. **Not currently rendered on
  `index.astro`** (see Priority 1 in Next Steps — this needs fixing).
- `public/favicon.svg`, `package.json`, `tsconfig.json`, `.gitignore`, `.vscode/*`.

**Likely orphaned — needs a decision, not yet deleted:**
- `src/components/Header.astro` — built for the multi-character nav (`getRoutableCharacters()`
  from `characters.ts`). `index.astro` now builds its own header inline instead of using this
  component.
- `src/components/CategoryIcon.astro` — SVG category icons; items now use emoji instead, so
  this is probably unused.
- `src/lib/characters.ts` + `src/data/characters/elon-musk.json` — the multi-billionaire data
  architecture from Phase 1. `index.astro` no longer reads from this; Elon Musk framing is
  hardcoded directly in the page instead. If a second billionaire page is still a goal, this
  needs to be reconciled (see Section 8).
- `src/components/Game.astro`, `src/data/shop-items.json` — an earlier standalone shop
  component + dataset, superseded by the current self-contained `index.astro` +
  `src/data/items.ts`. Probably dead code.

---

## 6. Required Pages for AdSense — status

- [x] `/privacy-policy`, `/about`, `/terms`, `/contact`, `/disclaimer` — built, real contact
      email in place.
- [x] Custom `404.astro` / `500.astro`.
- [x] Substantial original content: 600+ word SEO block + FAQ with JSON-LD schema on the
      homepage.
- [ ] **No broken links / all pages reachable from every page** — currently **fails**: the
      homepage has no footer, so a first-time visitor landing on `/` has no visible path to
      the legal pages. Fix before applying to AdSense (Priority 1 below).
- [ ] Site should have some real traffic/history before applying — brand-new domains with zero
      content history are a common soft-rejection reason (Phase 4, not started).

---

## 7. Notable bug fixes made along the way

- **`Layout.astro` prop mismatch:** an earlier rebuild required a full `canonicalUrl` string,
  which would have silently broken every legal page (they pass `path="/disclaimer"` etc.).
  Fixed by accepting both, with `path` resolved against `Astro.site`.
- **Missing Tailwind import:** a rebuilt `Layout.astro` once shipped without
  `@import "tailwindcss";` in its global style block, so the whole site rendered unstyled.
  Fixed; if you ever see bare/unstyled HTML again, check for this line first.

---

## 8. Open Decisions

1. **Multi-billionaire expansion** (Section 8 in the original plan) — architecture exists
   (`characters.ts`, `characters/*.json`, `Header.astro`) but is currently disconnected from
   the live game page. Decide: (a) formally retire it and clean up the orphaned files, or
   (b) migrate `index.astro`'s hardcoded Elon Musk framing back to read from character JSON so
   a second character really is just a data change. Recommend (a) unless a second character
   page is an active near-term goal.
2. **Hint/time-achievement persistence** — currently session-only (resets on reload). Decide
   if it's worth persisting via `localStorage` so a returning visitor doesn't lose progress.
3. **Homepage footer** — needs to be added; open question is whether to reuse the existing
   `Footer.astro` as-is or give the homepage a themed (Carnival Poster) footer variant to match
   the rest of the page instead of the plain one used on legal pages.

---

## 9. SEO Keyword Targets (unchanged research, still current)

**Primary:** spend elon musk money / spend elon musk's money, elon musk money game, billionaire
spending simulator / billionaire spending game.

**Long-tail:** how would you spend elon musk's money, how long would it take to spend elon
musk's money, can you spend elon musk's entire net worth, elon musk net worth game, spend jeff
bezos money / spend bill gates money — future sister-page targets if Open Decision #1 above
goes with option (b).

**Competitive reference set:** spendelonmoney.org, onlinegames.io/spend-elon-musk-money,
spendmoneyelonmusk.com, and similar sites — most cite a specific net-worth figure with a
source, most offer a receipt/share mechanic, several use a countdown/timer framing, a couple
use a sarcastic in-game mascot. This site covers receipt/share + disclaimer already; a
countdown challenge mode and a mascot are still-open ideas if more differentiation is wanted
later.

---

## 10. Working Agreement with Claude

- **File delivery:** individually updated files for incremental changes; a full zip only for
  brand-new projects or a change touching most files at once.
- **CLAUDE.md changes:** normally targeted find-and-replace edits — this file is an exception,
  delivered as a full rewrite by explicit request to consolidate three rounds of patches.
- **When Claude can't do something:** account creation (Cloudflare, AdSense, Search Console),
  buying/registering the domain, anything needing OAuth/login, testing on a real device — all
  get explicit numbered manual steps, never silently skipped.
- **Design/creative direction:** dev makes quick calls and moves forward; iterate until
  something feels right, then lock it in (see Section 3's history for an example — HUD tried
  and explicitly rejected in favor of Carnival Poster).

---

## 11. Next Steps (prioritized)

### Priority 1 — fix before doing anything else
1. **Add `<Footer />` to `index.astro`.** The homepage currently has zero visible legal links.
   This is both a real UX gap and an AdSense-readiness blocker.
2. **Resolve Open Decision #1** (multi-billionaire architecture) — at minimum, decide whether
   `Header.astro`, `CategoryIcon.astro`, `characters.ts`, `characters/elon-musk.json`,
   `Game.astro`, and `shop-items.json` are dead code to delete, or need to be reconciled with
   the current `index.astro`.
3. **Run `npm run build` locally** to confirm everything compiles cleanly under TypeScript
   strict mode + Tailwind v4 — hasn't been verified since the latest rebuild.

### Priority 2 — polish before launch
4. Create a real `og-image.png` (currently a placeholder path in `Layout.astro`) for social
   share previews.
5. Decide on hint/time-achievement persistence (Open Decision #2).
6. Mobile responsiveness pass on all modals (Checkout, Lucky Spin, Money Rain, Double or
   Nothing, Mystery Chest, Certificate, Hint panel) — built but not visually verified on a
   small viewport.
7. Playtest Double-or-Nothing odds/default stake to confirm 10T/100T feel appropriately
   rare-but-reachable (tuning knobs documented in Section 4).

### Priority 3 — launch (original Phase 4, not started)
8. Complete the `how-rich-is-too-rich.com` domain purchase (in progress per this session).
9. Deploy to Cloudflare Pages — **dev has limited Cloudflare experience, will need
   step-by-step guidance** when this is picked up.
10. Point DNS at Cloudflare Pages once deployed.
11. Add Google Analytics.
12. Add `public/_headers` to noindex any `*.pages.dev` staging URL.
13. Let the site sit live with a little organic traffic before applying — brand-new domains
    with zero history are a common soft-rejection reason.
14. Apply to Google AdSense (only after Priority 1 item #1 is confirmed fixed site-wide).

### Priority 4 — post-approval / future
15. Add AdSense ad units in non-intrusive placements; add `ads.txt` at domain root; monitor
    Core Web Vitals after ad script is added (lazy-load below the fold).
16. Revisit multi-billionaire expansion per Open Decision #1, if still wanted.
17. Consider a countdown/challenge mode or sarcastic mascot commentary (Section 9's
    competitive-gap notes) if more differentiation from competitors is wanted later.