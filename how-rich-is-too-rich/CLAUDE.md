# 🚀 CLAUDE.md — Project Blueprint: "How Rich Is Too Rich"

A fun, shareable, 100% client-side game where players spend a billionaire's net worth on real (and absurd) things until it hits zero. Built multi-character from day one (Elon Musk first) for virality + programmatic SEO + AdSense revenue, following the Micro-Tool Web Factory playbook.

This file is the single source of truth. Work through it **top to bottom, phase by phase**. Don't skip the legal/compliance items — they're what get an AdSense application rejected or a site DMCA'd/C&D'd.

**Project status:** Phase 1 (Foundation) and Phase 2 (Core Game Engine) are built. Working title/domain placeholder: **How Rich Is Too Rich**. Contact email for all pages (footer, `/contact`, `/privacy-policy`): **dev.solanki.works@gmail.com**.

**Working agreement with Claude:**
- From this point on, Claude delivers **individual updated files**, not a full project zip, unless the change spans a brand-new project or a huge number of files at once.
- CLAUDE.md updates are delivered as **find-and-replace edits** (targeted `str_replace` blocks), never a full file rewrite — see Section 10 for the full working agreement.

---

## 1. Project Identity & Goal

**What it is:** A satirical, playful budget-simulator game. The player starts with a running total (Elon Musk's approximate public net worth, sourced from public reporting) and "spends" it by clicking/adding items from a shop (Teslas, rockets, islands, a lifetime supply of Twitter/X Premium, buying a sports team, etc.) until the counter hits $0. Along the way it shows fun stats ("You could buy every NBA team X times over").

**Why it works for pSEO + AdSense:**
- High search volume, evergreen curiosity keyword ("elon musk net worth game", "how would you spend elon musk's money", "billionaire spending game").
- Naturally shareable (results screen = social image = free traffic).
- Long time-on-page (good for AdSense RPM) since it's a game, not a one-shot tool.
- Can be templated into a whole family of pages (`/spend-jeff-bezos-billions`, `/spend-mrbeast-millions`, etc.) later, reusing the same engine — classic pSEO leverage.

**Core Philosophy (unchanged from the Playbook):** Zero backend cost. 100% client-side. No data leaves the browser. Fast Core Web Vitals. Ship in days, not weeks.

**Important framing decision — treat this as parody/commentary, not fact-reporting:**
- This is a game and satire, not a financial product. Every page must clearly label the net-worth figure as an **illustrative, publicly-reported estimate**, not real-time or authoritative data.
- Do not imply Elon Musk endorses, sponsors, or is affiliated with the site.
- Do not use his photograph/likeness or Tesla/SpaceX/X logos (trademark risk). Use an original illustrated/cartoon avatar instead — this also solves the "AI slop" aesthetic problem by forcing a distinctive art style.
- Keep tone light and non-defamatory: playful, not mocking in a way that reads as a false factual claim about him personally.
- This single decision (illustrated parody character, not real photos) removes most of the legal/AdSense risk in one move — don't skip it.

---

## 2. Tech Stack (same as Playbook default)

- **Framework:** AstroJS (static generation + `getStaticPaths` for future pSEO expansion)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite`
- **Interactivity:** Vanilla TypeScript. No React/Vue unless the game state genuinely needs it (a simple reducer pattern in vanilla TS is enough here).
- **State:** In-memory JS object + `localStorage` only for "high score" / "fastest to $0" — never sends data anywhere.
- **Hosting:** Cloudflare Pages (free tier).
- **Environment:** Windows 11 ARM64 — use native ARM64 Node 20/22 LTS `.msi`, avoid packages that need `node-gyp` native builds.

---

## 3. Design System — SpaceX "Mission Control" Telemetry HUD
 
Superseded the earlier receipt/cash-register direction. Locked visual identity as of this
remake:
 
- **Aesthetic:** Dark-mode sci-fi command console inspired by SpaceX Starship touchscreen
  controls and Linear/Vercel design systems. Clean, high-contrast, zero "AI slop."
- **Color Palette:**
  - Background: Deep space black `#030712` with Slate-950/900 paneling.
  - Telemetry colors: Emerald Green `#10b981`, Cyber Cyan `#06b6d4`, Crisp White `#f8fafc`.
  - Warning/alert: Mars Orange `#f97316` → Rose `#f43f5e` when balance drops below 20%.
- **UI details:** HUD corner-bracket accents, glowing 1px cyan borders, monospace tabular-nums
  counters (JetBrains Mono), light glass/backdrop-blur on the sticky header only (not stacked
  everywhere — restraint matters).
- **Typography:** Inter for body, JetBrains Mono for all numeric/telemetry readouts. Max 2
  font families, per Playbook default.
- **Item art:** Emoji icons only (unchanged principle from prior design pass — zero licensing
  risk, no real photos/logos).
- **Item names:** Generic/parody descriptions only — no real brand names, product names, or
  trademarks (e.g. "Angular Electric Pickup," not the real vehicle name; "Struggling Social
  Platform," not the real platform name). This is a deliberate trademark-risk mitigation,
  stricter than the doc-4 draft spec that named real products.
- **Motion:** Purposeful only — fuel gauge transitions, achievement toast slide-in, receipt
  modal open/close. No decorative ambient animation. `prefers-reduced-motion` respected globally.

---

## 3. Design System — "Carnival Poster"
 
- **Aesthetic:** Bright, warm, comic-book toy — a game-show set, not a dashboard. Flat color
  only, no gradients/glow/glassmorphism.
- **Color palette:** Cream background `#FFFBF2`, white raised cards `#FFFFFF`, ticket paper
  `#FFF4DE`, near-black ink `#1A1508` for text and borders, amber `#FFC630` primary accent,
  green `#16A34A` / red `#E11D3C` for credit/debit, pink `#E0328B` extra-fun accent. Category
  accents: Vehicles `#3FA9F5`, Real Estate `#2FE3B4`, Companies `#B388FF`, Space `#7C83FD`,
  Absurd `#FF3D8F`.
- **Signature UI trick:** `.brutal` utility — thick 2px black border + hard 4px offset shadow
  (no blur), wobble/rotate slightly on hover, press down on active. Applied to every card,
  button, and modal panel.
- **Typography:** Space Grotesk (display/headings), Inter (body), IBM Plex Mono (numbers/
  receipts), loaded via Google Fonts CDN.
- **Item art:** Emoji only, unchanged principle — zero licensing risk.
- **Item names:** Generic/parody descriptions only, unchanged — no real brand names or
  trademarks.
- **Motion:** Bump/wobble on purchase, screen-shake on big spends (≥5% of starting balance),
  confetti burst on checkout and big wins, bouncy sticker-style toasts. `prefers-reduced-motion`
  respected globally.

## 4. Game Design Spec
 
- **Starting value:** unchanged — flat $1,000,000,000,000, illustrative estimate.
- **Shop items:** unchanged dataset (~20 items, $10–$500B, generic/parody names, 5 categories).
- **Core loop:** Category tabs filter the shop. Each card has a quantity input + MAX quick-fill
  + Buy button (no Sell — matches the earlier "no forced game-over" decision; balance can go
  negative, nothing locks). Player hits **Checkout** whenever done, opening a summary modal:
  total spent, elapsed time, spend-tier label (Window Shopping → Legendary Overspender),
  playful comparisons ("= X mega-mansions"), and a downloadable canvas-rendered receipt image.
- **Achievements:** unchanged five-tier toast system based on total amount spent.
- **Doge Mode:** unchanged display-only `$` ↔ `Ð` toggle.
- **Sound FX:** unchanged synthesized Web Audio (click/coin/rumble/jingle/sad-trombone-ish
  tone), global on/off toggle.
- **Secrets (expanded this pass):**
  - "Your Mama 💀" — tap the header title 5x quickly. Unchanged mechanic, restyled.
  - **NEW** — tap the `$` logo icon 3x quickly to open the hidden **Money Rain** mini-game.
  - **NEW** — type the word `YOLO` anywhere on the page (outside form inputs) to trigger
    **Chaos Mode**: a 5-second rainbow hue-cycle + everything wobbling, for no reason other
    than fun. No lasting effect on game state.
- **Mini-games (new this pass):**
  - **🎰 Lucky Spin** — always-visible header button. $20B entry fee (illustrative), spins a
    slot-style reel weighted toward small/mid outcomes with a rare 10x jackpot. Net result
    (loss or win) is logged as a receipt line item like any purchase.
  - **💰 Money Rain** — hidden behind the logo-tap secret above. 8-second timed catch game:
    falling 💵/💰/💎 emojis worth random bonus amounts (💎 rare and high-value). Tally is
    added to balance as a bonus when the modal closes.
- **Best score:** unchanged — fewest total buys, persisted in `localStorage`, shown next to
  Reset.
- **No dark patterns:** unchanged — no fake urgency, no forced email capture, no ad
  interstitials blocking play. The mini-game "gambling" flavor is explicitly play-money and
  framed as satire, not real-stakes mechanics.

---

## 5. Programmatic SEO Plan

- `src/pages/index.astro` — the main game.
- Future expansion via `src/pages/[slug].astro` + a JSON dataset, reusing the same game engine with a different `startingNetWorth` and character (Bezos, MrBeast, a fictional "average lottery winner," etc.) — don't build this in Phase 1, but architect the game engine as a reusable component/module now so it's a data change later, not a rewrite.
- Each page needs: unique H1, unique meta title/description, a 500–600 word on-page content block below the game explaining the concept, methodology/source of the net-worth figure, and an FAQ block with `FAQPage` JSON-LD schema.
- `sitemap.xml` (via `@astrojs/sitemap`), `robots.txt`, canonical tags on every page.

---

## 6. Required Pages for AdSense Approval

AdSense reviewers explicitly check for these. Missing any one is a common rejection reason. Real contact email for all of these: **dev.solanki.works@gmail.com** (replace the `hello@example.com` placeholder still sitting in `contact.astro` and `privacy-policy.astro`).

- [x] `/privacy-policy` — built in Phase 1. Placeholder email needs swapping to the real one above.
- [x] `/about` — built in Phase 1.
- [x] `/terms` (Terms of Use) — built in Phase 1.
- [x] `/contact` — built in Phase 1. Placeholder email needs swapping to the real one above.
- [x] `/disclaimer` — built in Phase 1.
- [x] Custom `404.astro` and `500.astro` — built in Phase 1.
- [ ] Site must have a reasonable amount of original content (the SEO blocks + FAQ handle this) — a single bare game canvas with no text tends to get rejected as "insufficient content." **Still needed: Phase 3 SEO content block + FAQ.**
- [ ] No broken links, no placeholder ("lorem ipsum") text anywhere before submitting. **Still needed: swap the placeholder email above before launch.**

---

## 7. Step-by-Step Execution Plan

We'll go through these phases one at a time in our sessions — tell me when you're ready to start a phase and I'll generate the actual code/config for it.

### Phase 0 — Setup ✅ done
1. Install native ARM64 Node 20/22 LTS.
2. `npm create astro@latest` → TypeScript strict, empty template.
3. Install VS Code extensions: Astro, Tailwind CSS IntelliSense, ESLint.
4. Register a domain (via Instant Domain Search) and a Cloudflare Pages project — **still pending, intentionally deferred to Phase 4.**

### Phase 1 — Foundation ✅ done
- Configure Tailwind v4 (`@tailwindcss/vite`).
- Build `Layout.astro` (SEO meta, OG tags, canonical, favicon).
- Build Header/Footer with links to the required pages.
- Build all required legal/about/contact pages + custom 404/500.
- Multi-billionaire data architecture (`src/data/characters/*.json` + `src/lib/characters.ts`), scoped in from v1 per Section 8 decision log.
- Design system v1 locked (now being revised — see Section 3 and Phase 2.5 below).

### Phase 2 — Core Game Engine ✅ done
- `gameEngine.ts`: state (current balance, purchase log), pure functions (`purchaseItem()`, `resetGame()`), no framework dependency, fully portable.
- Shop item JSON dataset — 50 items across 5 categories, written generically (no trademarked product names) so the same dataset works for every future character.
- Built the UI: animated money counter, shop grid with category filters, receipt log with print-in animation, reset button, "broke" end state.
- Built the shareable end-screen: canvas-rendered downloadable receipt image.

Phase 2 (Core Game Engine) is being rebuilt against this new spec:
`src/lib/gameEngine.ts` (pure state logic), `src/data/items.ts` (item dataset),
`src/layouts/Layout.astro` (SEO/meta/FAQ schema), `src/pages/index.astro` (HUD UI + game).
Legal/about/contact/disclaimer pages from the prior Phase 3 pass are unaffected and do not
need to be regenerated.

### Phase 2.5 — Design Pass (new, insert before Phase 3)
- Apply the revised bright/fun palette and layout rules from Section 3 to `global.css` and existing components.
- Evaluate adding a comedic assistant/mascot commentary element and/or a timer challenge mode (see Section 3's competitive notes) — scope this as its own sub-step, don't let it block the rest of Phase 2.5.
- Re-test contrast/accessibility after the palette change (bright ≠ illegible).

### Phase 3 — Content & SEO
- Write the on-page 500–600 word content block + FAQ + JSON-LD.
- Add `@astrojs/sitemap`, `robots.txt`.
- Add the required legal/about/contact pages (real, specific content — not filler).
- Add the public-figure disclaimer prominently (footer + dedicated `/disclaimer` page).

### Phase 4 — Monetization Prep & AdSense Application
- Add Google Analytics.
- Add `public/_headers` to noindex any `*.pages.dev` staging URL.
- Deploy to Cloudflare Pages on the real custom domain.
- Submit sitemap to Google Search Console + Bing Webmaster.
- Let the site sit live for a bit with real content and (ideally) a little organic traffic — brand-new domains with zero content history are a common soft-rejection reason.
- Apply to Google AdSense. While in review: do not place any ad code/placeholder ad units on the page (AdSense reviews the live site, not a mockup) — that comes after approval.

### Phase 5 — Post-Approval
- Add AdSense ad units in approved placements (avoid layout-shifting or intrusive placements — Google penalizes both ads.txt issues and bad UX).
- Add `ads.txt` at domain root.
- Monitor Core Web Vitals after ad script is added (ads are the #1 thing that tanks CWV — lazy-load below the fold).

---

## 8. Decision Log

- **Working title:** How Rich Is Too Rich.
- **Multi-billionaire scope:** built into v1 architecture from the start (not deferred) — Elon Musk is the only live character page for now, but adding another is a data-only change (drop a JSON file in `src/data/characters/`).
- **Design direction:** v1 shipped a muted "receipt/cash register" look; superseded per Section 3 by a brighter, funnier direction — v1 palette was too "professional dashboard," not "comedy toy."
- **Item images:** using large emoji per shop item instead of photos. Real product photos would need properly licensed sourcing (Claude can't scrape/bundle web images into a commercial site — copyright risk); emoji is zero-cost, zero-licensing-risk, and fits the absurd tone. Revisit only if the user explicitly wants to source licensed photos later.
- **Starting net worth:** rounded to a flat $1 trillion for Elon Musk (was $900B) — cleaner number for a satire game, still footnoted as an illustrative estimate.
- **Shop item count:** trimmed from 50 to 25 (5 per category) — the original list was too dense to browse comfortably.
- **Secret item:** "Your Mama" 💀 — hidden easter egg, unlocked by tapping the receipt title 5x quickly, priced at the character's entire remaining balance at the moment of purchase (computed live, not hardcoded). A small "psst… can you find the secret option?" hint now sits at the page bottom so it's discoverable without being obvious.
- **Design v3 — full switch to a light "Carnival Poster" theme.** v2's dark base was still reading as a techy SaaS dashboard even with brighter accents. v3 moves to a bright cream background with bold black comic-style borders and hard colored shadows — closer to a game-show set/carnival poster. This touched nearly every page (swapped `text-white` → `text-ink` throughout) since the base flipped from dark to light.
- **No forced game-over.** Balance can go negative freely; nothing locks. The player explicitly hits a **Checkout** button whenever they're done, which opens the summary (total spent, elapsed time, spend-tier label, comparisons, download/share). This replaced the old "auto-broke-at-zero" behavior.
- **Quantity buying.** Every shop card now has a number input + "Max" quick-fill button + explicit "Buy" button, instead of one-click-per-purchase.
- **Small viral/fun additions:** a dependency-free Web-Audio "cha-ching" on purchase (mutable), a screen-shake on big purchases (≥5% of starting balance), a "spend tier" label (Window Shopping → Legendary Overspender) shown live and at checkout, and a persisted "best score" (fewest buys) shown next to Reset.

---

## 9. SEO Keyword Targets

Researched against the live competitive set (see sources below) rather than guessed. Revisit this list periodically — search behavior in this niche shifts with news cycles (net worth spikes/drops get their own traffic bursts).

**Primary keywords (high intent, high competition):**
- spend elon musk money / spend elon musk's money
- elon musk money game / elon musk money spending game
- billionaire spending simulator / billionaire spending game

**Long-tail / supporting keywords (lower competition, good for FAQ + on-page copy):**
- how would you spend elon musk's money
- how long would it take to spend elon musk's money
- can you spend elon musk's entire net worth
- spend elon musk money in 30 seconds / spend it all challenge
- elon musk net worth game
- spend jeff bezos money / spend bill gates money / spend mark zuckerberg money — future sister-page targets once another character JSON is added

**What the top-ranking competitors are doing (as of this research pass, Aug 2026):** most cite a specific net-worth figure prominently above the fold with a source, most offer a "receipt" or share mechanic already, several use a countdown timer or "spend it in X seconds" framing, a couple use a sarcastic in-game assistant character for personality, and most run an explicit "not affiliated with Elon Musk" disclaimer. This site already covers the receipt/share mechanic and the disclaimer; the timer/challenge framing and mascot commentary are the gaps worth closing (tracked in Phase 2.5).

**Sources checked this pass:** spendelonmoney.org, onlinegames.io/spend-elon-musk-money, spendmoneyelonmusk.com, spendmoneygame.com, spend-elon-fortune.com, spendelonmuskmoney.org, spendelonmusk.money, spend-elon-money.com.

---

## 10. Working Agreement with Claude

- **File delivery:** Claude provides individually updated files for incremental changes. A full project zip is only for the initial handoff or a change that touches most of the project at once.
- **CLAUDE.md changes:** always delivered as targeted find-and-replace edits against the existing file, never a full rewrite, so changes are easy to track.
- **When Claude can't do something:** if a task needs something Claude genuinely can't do from this chat — creating accounts (Cloudflare, Google AdSense, Google Search Console), buying a domain, anything requiring OAuth/login, testing on a real mobile device, or actions on the user's local machine outside what's shared here — Claude says so explicitly and gives clear, numbered, step-by-step instructions for the user to do it themselves, rather than pretending it's handled or going quiet on that part of the request.
- **Keyword tracking:** Section 9 gets revisited (not necessarily every session) as the project progresses toward launch, so on-page copy and FAQ content stay aligned with what people are actually searching.

---

**Next step:** Phase 2.5 (design pass) or Phase 3 (SEO content) — say which and we'll generate the actual updated files.