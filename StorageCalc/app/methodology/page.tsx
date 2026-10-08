import type { Metadata } from "next";
import {
  ALL_METHODOLOGY_ASSUMPTIONS,
  HEADROOM_ASSUMPTIONS,
  STORAGE_TIERS,
  STORAGE_UNIT_CONVERSION,
} from "@/lib/calculator/assumptions";
import { MB_PER_MINUTE_PER_MBPS } from "@/lib/calculator/calculations";
import { calculateStorageReality } from "@/lib/calculator/engine";
import { serializeProfileToSearchParams } from "@/lib/calculator/url-state";
import type { CalculatorInputProfile } from "@/lib/calculator/types";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: {
    absolute:
      "Storage Calculator Methodology — How Storage Reality Calculates Your Needs",
  },
  description:
    "Learn how Storage Reality estimates photo, video, game, app and file storage requirements, including assumptions, ranges, headroom and storage tiers.",
  alternates: {
    canonical: "/methodology",
  },
};

interface MethodologyTopic {
  number: string;
  id: string;
  title: string;
  simpleExplanation: string;
  technicalDetails: string[];
  formula?: string;
  sources: { label: string; url?: string }[];
}

const METHODOLOGY_TOPICS: MethodologyTopic[] = [
  {
    number: "1",
    id: "photos",
    title: "Photos",
    simpleExplanation:
      "We estimate your photo storage by combining the photos you already have with the new photos you expect to take each month over your chosen time horizon. Because a photo's file size depends on camera settings and scene detail—not just megapixels—we use realistic ranges for each type of camera.",
    formula:
      "Total Photos = Current Photos + (Monthly New Photos × 12 × Years)\nPhoto Storage (GB) = (Total Photos × MB per Photo) ÷ 1,000",
    technicalDetails: [
      "Typical phone photos: 3.5 MB typical (2.2–5.0 MB range). Models 12 MP–24 MP HEIC/HEIF and standard JPEG captures, including occasional Live Photos.",
      "High-resolution phone photos: 8.0 MB typical (5.5–12.0 MB range). Models 24 MP–48 MP HEIF/JPEG captures and frequent Live Photos on flagship phones.",
      "DSLR / mirrorless JPEG: 14.0 MB typical (9.0–20.0 MB range). Models 24 MP–33 MP dedicated camera Fine JPEGs.",
      "RAW photos: 35.0 MB typical (25.0–75.0 MB range). Spans 12 MP ProRAW (~25 MB), 24 MP–33 MP lossless compressed camera RAW (~30–45 MB), and 48 MP ProRAW (~75 MB).",
    ],
    sources: [
      {
        label: "Apple Support — About Apple ProRAW (12 MP ~25 MB, 48 MP ~75 MB)",
        url: "https://support.apple.com/en-us/102652",
      },
      {
        label: "Canon 24 MP–33 MP Fine JPEG & RAW File Size Specifications",
        url: "https://cam.start.canon/en/C003/manual/html/UG-09_Reference_0100.html",
      },
    ],
  },
  {
    number: "2",
    id: "videos",
    title: "Videos",
    simpleExplanation:
      "Video is often the fastest way to fill a device. We estimate video storage based on how many minutes you record each month and the recording quality. Higher resolutions (like 4K) and smoother frame rates (60 fps) record significantly more data every minute than standard HD video.",
    formula: `1 Mbps = 0.125 MB/sec = ${MB_PER_MINUTE_PER_MBPS} MB/minute\nVideo Storage (GB) = Existing Video GB + ((Monthly Minutes × 12 × Years × MB/min) ÷ 1,000)`,
    technicalDetails: [
      "Resolution alone does not determine file size—bitrate, codec (HEVC/H.265 vs H.264), HDR, and frame rate do.",
      "720p HD: 45 MB/min at 30 fps (~6 Mbps, range 36–56 MB/min) · 68 MB/min at 60 fps (~9 Mbps).",
      "1080p Full HD: 90 MB/min at 30 fps (~12 Mbps, range 65–130 MB/min bridging HEVC and H.264) · 135 MB/min at 60 fps (~18 Mbps).",
      "4K Ultra HD: 240 MB/min at 30 fps (~32 Mbps, range 170–324 MB/min) · 400 MB/min at 60 fps (~53.3 Mbps, matching iOS 4K60 HEVC).",
      "8K Ultra High Resolution: 600 MB/min at 30 fps (~80 Mbps) · 900 MB/min at 60 fps (~120 Mbps).",
    ],
    sources: [
      {
        label: "Apple Support — iPhone Video Recording Settings & Rates",
        url: "https://support.apple.com/en-us/102270",
      },
      {
        label: "Google / YouTube Recommended Upload Encoding Bitrates",
        url: "https://support.google.com/youtube/answer/1722171",
      },
    ],
  },
  {
    number: "3",
    id: "games",
    title: "Games",
    simpleExplanation:
      "Game sizes vary enormously. A casual puzzle or indie game might use only a few gigabytes, while a modern open-world or multiplayer shooter can easily exceed 100 GB after updates. Instead of assuming a single average game size, we group games by type and multiply by the number of games you keep installed at the same time.",
    formula: "Games Storage (GB) = Installed Games Count × GB per Game",
    technicalDetails: [
      "Small games: 3 GB typical (1.5–6 GB range) for mobile, retro, and 2D indie titles.",
      "Medium games: 18 GB typical (10–28 GB range) for handheld, AA, and rich 3D mobile games.",
      "Large games: 55 GB typical (35–75 GB range) for mainstream modern PC and console AAA releases.",
      "Very large games: 100 GB typical (75–135 GB range) for flagship open-world games, sims, and live-service shooters with high-res textures.",
    ],
    sources: [
      {
        label: "Steam Store & Console Hardware System Requirement Disclosures",
        url: "https://store.steampowered.com/",
      },
    ],
  },
  {
    number: "4",
    id: "apps",
    title: "Apps",
    simpleExplanation:
      "Apps take up much more space after a few months of use than they do when you first download them. Social media feeds, messaging attachments, offline maps, and streaming downloads build up local caches over time. Our estimates reflect this real installed footprint—not just the initial download size.",
    formula: "Apps Storage (GB) = (App Count × Installed MB per App) ÷ 1,000",
    technicalDetails: [
      "Light / utility apps: 180 MB typical (110–260 MB range) including basic local data.",
      "Typical everyday mix: 450 MB typical (300–650 MB range) across social, messaging, maps, and shopping apps.",
      "Heavy / creative & media apps: 1,100 MB typical (750–1,500 MB range) for creative tools and offline media caches.",
      "Default everyday baseline: 60 apps × 450 MB = 27 GB typical (18–39 GB range).",
    ],
    sources: [
      {
        label: "Apple Support — Understanding App Size vs. Documents & Data Cache",
        url: "https://support.apple.com/en-us/108429",
      },
    ],
  },
  {
    number: "5",
    id: "documents",
    title: "Documents",
    simpleExplanation:
      "Plain text documents are tiny, but most people's document folders also include PDFs, slide presentations with images, spreadsheets, scanned files, and ZIP archives. We model documents as a realistic mixed folder rather than plain text files alone.",
    formula: "Documents Storage (GB) = (File Count × MB per File) ÷ 1,000",
    technicalDetails: [
      "Mostly small documents: 0.8 MB typical (0.4–1.5 MB range) for notes, receipts, and office files.",
      "Mixed files: 3.5 MB typical (2.0–5.5 MB range) for PDFs, slide decks, spreadsheets, and scans.",
      "Large files: 15.0 MB typical (9.0–24.0 MB range) for media-rich presentations, textbooks, and project exports.",
      "Other files / archives: Modeled as an initial archive (15 GB light, 50 GB moderate, 150 GB heavy) plus monthly growth (0.4–2.5 GB/month) over your ownership horizon.",
    ],
    sources: [
      {
        label: "Storage Reality Mixed File Collection Heuristic",
      },
    ],
  },
  {
    number: "6",
    id: "headroom",
    title: "Headroom",
    simpleExplanation:
      "Filling a phone or computer to 100% causes slowdowns, failed software updates, and constant 'Storage Almost Full' warnings. Plus, the usable space on any drive is smaller than the number printed on the box. We add a practical buffer on top of your estimated files so your storage stays comfortable.",
    formula: `Local Devices & Drives: Headroom = max(${HEADROOM_ASSUMPTIONS.minimumHeadroomGb} GB, +20% of Content up to 2 TB, +10% above 2 TB)\nCloud Storage: Headroom = max(${HEADROOM_ASSUMPTIONS.cloudMinimumHeadroomGb} GB, +12% of Content)\nTotal Planned Capacity = Estimated Content + Recommended Headroom`,
    technicalDetails: [
      `Local devices and drives reserve +20% of estimated content (with a minimum ${HEADROOM_ASSUMPTIONS.minimumHeadroomGb} GB floor) to absorb operating system files, update unpacking, temporary caches, and the ~7% decimal-to-binary formatting gap.`,
      "Above 2 TB of content, the additional headroom tapers to +10% on the portion exceeding 2 TB so multi-terabyte creative libraries do not jump to an oversized 8 TB tier solely from a flat percentage buffer.",
      `Cloud storage plans reserve a lighter +12% buffer (minimum ${HEADROOM_ASSUMPTIONS.cloudMinimumHeadroomGb} GB) because cloud accounts do not require local operating system partitions or swap files.`,
    ],
    sources: [
      {
        label: "Apple Support — How OS & Formatted Storage Capacity is Reported",
        url: "https://support.apple.com/en-us/102119",
      },
    ],
  },
  {
    number: "7",
    id: "storage-tiers",
    title: "Storage tiers",
    simpleExplanation:
      "Once we combine your estimated files and headroom into a total planned capacity, we recommend the first standard storage size (such as 128 GB, 256 GB, 512 GB, 1 TB, or 2 TB) that comfortably fits that total while respecting realistic hardware limits for your device.",
    technicalDetails: [
      `Standard tiers evaluated: ${STORAGE_TIERS.map((t) => t.label).join(", ")}.`,
      "Category-aware hardware caps: Phone recommendations are restricted to realistic smartphone capacities (128 GB, 256 GB, 512 GB, 1 TB). If a multi-year 4K video or photo library exceeds 1 TB, we recommend a 1 TB phone paired with cloud backup or an external SSD rather than a non-existent 2 TB–8 TB phone.",
      "Laptop recommendations start at 256 GB and scale up to 4 TB (with external SSD or NAS workflow guidance above 4 TB).",
      "Recommended: The smallest practical tier for your category whose capacity is greater than or equal to your Total Planned Capacity.",
      "May feel tight: A smaller tier that can hold your raw Estimated Content, but leaves less than our recommended headroom buffer.",
      "Too small: Any tier smaller than your projected content alone.",
      "More than you need: Tiers above the recommended tier.",
    ],
    sources: [
      {
        label: "Storage Reality Category-Aware Tier Selection Policy",
      },
    ],
  },
  {
    number: "8",
    id: "units",
    title: "Units",
    simpleExplanation:
      "Device and drive manufacturers sell storage using decimal gigabytes (where 1 GB = 1,000 MB and 1 TB = 1,000 GB). Our calculator uses the same decimal gigabytes so our numbers match the 128 GB, 256 GB, 512 GB, and 1 TB labels you see when shopping.",
    formula: `Decimal SI: 1 GB = 1,000 MB = 1,000,000,000 bytes\nBinary IEC: 1 GiB = 1,024 MiB = 1,073,741,824 bytes (1 GiB ≈ ${STORAGE_UNIT_CONVERSION.BINARY_GIB_TO_DECIMAL_GB_RATIO.toFixed(
      3
    )} GB)`,
    technicalDetails: [
      "Because Windows and some disk tools measure in binary gibibytes (GiB), a 256 GB drive displays roughly 238 GiB, and a 1 TB (1,000 GB) drive displays roughly 931 GiB before OS files.",
      "Our 20% headroom buffer automatically accounts for this ~7% difference so you don't have to convert between GB and GiB yourself.",
    ],
    sources: [
      {
        label: "NIST / IEC 60027-2 Standard for Binary and Decimal Prefixes",
        url: "https://physics.nist.gov/cuu/Units/binary.html",
      },
      {
        label: "Apple Support — Decimal vs Binary Storage Reporting",
        url: "https://support.apple.com/en-us/102119",
      },
    ],
  },
];

const WORKED_EXAMPLES: {
  title: string;
  summary: string;
  profile: Partial<CalculatorInputProfile>;
}[] = [
  {
    title: "Example 1: Everyday Smartphone & 4K Video (3 Years)",
    summary:
      "4,000 existing photos + 150/month (typical phone), 15 GB existing video + 20 min/month of 4K 30fps, default everyday apps (~60 apps), and 1,000 mixed documents over 3 years.",
    profile: {
      purpose: "phone",
      habit: "everyday",
      volume: "medium",
      selectedCategories: ["photos", "videos", "apps", "documents"],
      timeHorizon: { preset: "3", customYears: 3 },
      currentStorage: { preset: "128", customGb: 128 },
      photoProfile: {
        currentPhotoCount: 4000,
        monthlyNewPhotos: 150,
        photoType: "typical_phone",
        customFileSizeMb: 3.5,
        durationMode: "inherit",
        customDurationYears: 3,
      },
      videoProfile: {
        monthlyMinutes: 20,
        currentVideoLibraryGb: 15,
        quality: "4k",
        fps: 30,
        useCustomBitrate: false,
        customBitrateMbps: 32,
      },
      appsProfile: {
        useDefaultEstimate: true,
        appCount: 60,
        sizePreset: "typical",
        customAppSizeMb: 450,
      },
      documentsProfile: {
        fileCount: 1000,
        sizePreset: "mixed",
        customFileSizeMb: 3.5,
      },
    },
  },
  {
    title: "Example 2: Gamer & RAW / 4K60 Creator (4 Years)",
    summary:
      "2,500 existing RAW photos + 120/month, 40 GB existing video + 30 min/month of 4K 60fps, 6 large AAA games, 45 heavy apps, and a moderate archive over 4 years.",
    profile: {
      purpose: "gaming",
      habit: "heavy",
      volume: "high",
      selectedCategories: ["photos", "videos", "games", "apps", "other"],
      timeHorizon: { preset: "custom", customYears: 4 },
      currentStorage: { preset: "512", customGb: 512 },
      photoProfile: {
        currentPhotoCount: 2500,
        monthlyNewPhotos: 120,
        photoType: "raw",
        customFileSizeMb: 35,
        durationMode: "inherit",
        customDurationYears: 4,
      },
      videoProfile: {
        monthlyMinutes: 30,
        currentVideoLibraryGb: 40,
        quality: "4k",
        fps: 60,
        useCustomBitrate: false,
        customBitrateMbps: 53.3,
      },
      gamesProfile: {
        gameCount: 6,
        sizePreset: "large",
        customGameSizeGb: 55,
      },
      appsProfile: {
        useDefaultEstimate: false,
        appCount: 45,
        sizePreset: "large",
        customAppSizeMb: 1100,
      },
      otherProfile: {
        preset: "moderate",
        currentGb: 50,
        monthlyGrowthGb: 1.0,
      },
    },
  },
];

export default function MethodologyPage() {
  const computedExamples = WORKED_EXAMPLES.map((ex) => {
    const result = calculateStorageReality(ex.profile);
    const fullProfile: CalculatorInputProfile = {
      purpose: ex.profile.purpose,
      habit: ex.profile.habit,
      volume: ex.profile.volume,
      selectedCategories: ex.profile.selectedCategories ?? [],
      photoProfile:
        ex.profile.photoProfile as CalculatorInputProfile["photoProfile"],
      videoProfile:
        ex.profile.videoProfile as CalculatorInputProfile["videoProfile"],
      gamesProfile:
        ex.profile.gamesProfile as CalculatorInputProfile["gamesProfile"],
      appsProfile:
        ex.profile.appsProfile as CalculatorInputProfile["appsProfile"],
      documentsProfile:
        ex.profile.documentsProfile as CalculatorInputProfile["documentsProfile"],
      otherProfile:
        ex.profile.otherProfile as CalculatorInputProfile["otherProfile"],
      timeHorizon:
        ex.profile.timeHorizon as CalculatorInputProfile["timeHorizon"],
      currentStorage:
        ex.profile.currentStorage as CalculatorInputProfile["currentStorage"],
    };
    const queryString = serializeProfileToSearchParams(
      fullProfile,
      "results"
    ).toString();
    return {
      ...ex,
      result,
      href: `/calculator?${queryString}`,
    };
  });

  return (
    <div className="py-10 sm:py-14">
      <Container size="default">
        {/* Intro */}
        <header className="pb-8 border-b border-border-subtle">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            How we calculate your storage needs
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
            Storage Reality translates everyday questions about your photos,
            videos, games, apps, and files into a practical storage
            recommendation. Every section below explains our approach in plain
            English first, with optional technical details and sources underneath.
          </p>

          <nav
            aria-label="Methodology sections"
            className="mt-5 flex flex-wrap gap-2"
          >
            {METHODOLOGY_TOPICS.map((topic) => (
              <a
                key={topic.id}
                href={`#${topic.id}`}
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground"
              >
                <span className="mr-1 text-foreground-subtle tabular-nums">
                  {topic.number}.
                </span>
                {topic.title}
              </a>
            ))}
            <a
              href="#reference-heading"
              className="rounded-md border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground"
            >
              Worked examples &amp; table
            </a>
          </nav>
        </header>

        {/* 8 Core Sections */}
        <div className="divide-y divide-border-subtle">
          {METHODOLOGY_TOPICS.map((topic) => (
            <section
              key={topic.id}
              id={topic.id}
              aria-labelledby={`heading-${topic.id}`}
              className="scroll-mt-20 py-7"
            >
              <h2
                id={`heading-${topic.id}`}
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                <span className="mr-2 font-mono text-sm text-foreground-subtle">
                  {topic.number}.
                </span>
                {topic.title}
              </h2>

              <p className="mt-3 text-base leading-relaxed text-foreground-muted">
                {topic.simpleExplanation}
              </p>

              {/* Expandable Technical Details */}
              <details className="group mt-4">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-accent-primary hover:underline">
                  <span>Technical details &amp; assumptions</span>
                  <span className="font-mono text-[10px] transition-transform group-open:rotate-180">
                    &#9662;
                  </span>
                </summary>
                <div className="mt-3 space-y-3 rounded-lg border border-border-subtle bg-surface p-4 text-xs leading-relaxed text-foreground-muted">
                  {topic.formula && (
                    <pre className="overflow-x-auto rounded bg-surface-subtle p-3 font-mono text-xs text-foreground whitespace-pre-wrap">
                      {topic.formula}
                    </pre>
                  )}
                  <ul className="list-disc space-y-1.5 pl-5">
                    {topic.technicalDetails.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </details>

              {/* Sources */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-subtle">
                <span>Sources:</span>
                {topic.sources.map((src) =>
                  src.url ? (
                    <a
                      key={src.label}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground-muted underline hover:text-foreground"
                    >
                      {src.label} &#8599;
                    </a>
                  ) : (
                    <span key={src.label} className="text-foreground-muted">
                      {src.label}
                    </span>
                  )
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Collapsible Reference: Worked Examples & Full Assumption Table */}
        <section
          aria-labelledby="reference-heading"
          className="mt-6 border-t border-border-subtle pt-8"
        >
          <h2
            id="reference-heading"
            className="text-lg font-semibold text-foreground"
          >
            Worked examples &amp; full reference table
          </h2>
          <p className="mt-1.5 text-sm text-foreground-muted">
            Inspect complete step-by-step calculations or view all centralized
            model values in one table.
          </p>

          <div className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
            {/* Worked Examples Disclosure */}
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
                <span>Worked calculation examples (2 profiles)</span>
                <span className="font-mono text-xs text-foreground-muted transition-transform group-open:rotate-180">
                  &#9662;
                </span>
              </summary>
              <div className="mt-4 space-y-4">
                {computedExamples.map((ex) => (
                  <div
                    key={ex.title}
                    className="rounded-lg border border-border-subtle bg-surface p-4 text-xs"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {ex.title}
                      </h3>
                      <a
                        href={ex.href}
                        className="font-medium text-accent-primary hover:underline"
                      >
                        Load in calculator &rarr;
                      </a>
                    </div>
                    <p className="mt-1 text-foreground-muted">{ex.summary}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border-subtle pt-3 sm:grid-cols-4">
                      <div>
                        <dt className="text-foreground-subtle">Content</dt>
                        <dd className="font-mono font-semibold text-foreground">
                          {ex.result.totalEstimatedStorage.formattedContent}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-foreground-subtle">Headroom</dt>
                        <dd className="font-mono font-semibold text-foreground">
                          {ex.result.totalEstimatedStorage.formattedHeadroom}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-foreground-subtle">Planned total</dt>
                        <dd className="font-mono font-semibold text-foreground">
                          {
                            ex.result.totalEstimatedStorage
                              .formattedTotalPlanned
                          }
                        </dd>
                      </div>
                      <div>
                        <dt className="text-foreground-subtle">Recommended</dt>
                        <dd className="font-mono font-semibold text-accent-primary">
                          {ex.result.recommendedStorage.tier}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </details>

            {/* Full Assumption Table Disclosure */}
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
                <span>
                  Complete assumption table ({ALL_METHODOLOGY_ASSUMPTIONS.length}{" "}
                  baselines)
                </span>
                <span className="font-mono text-xs text-foreground-muted transition-transform group-open:rotate-180">
                  &#9662;
                </span>
              </summary>
              <div className="mt-4 overflow-x-auto rounded-lg border border-border-subtle bg-surface">
                <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-subtle font-mono text-[11px] text-foreground-muted">
                      <th className="py-2.5 pl-3 pr-2">Category</th>
                      <th className="px-2 py-2.5">Assumption</th>
                      <th className="px-2 py-2.5">Typical</th>
                      <th className="px-2 py-2.5">Range</th>
                      <th className="py-2.5 pl-2 pr-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {ALL_METHODOLOGY_ASSUMPTIONS.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="py-2.5 pl-3 pr-2 font-medium text-foreground whitespace-nowrap">
                          {row.categoryLabel}
                        </td>
                        <td className="px-2 py-2.5 text-foreground">
                          {row.label}
                        </td>
                        <td className="px-2 py-2.5 font-mono text-foreground whitespace-nowrap">
                          {row.typicalDisplay}
                        </td>
                        <td className="px-2 py-2.5 font-mono text-foreground-muted whitespace-nowrap">
                          {row.rangeDisplay}
                        </td>
                        <td className="py-2.5 pl-2 pr-3 text-foreground-muted">
                          {row.sourceUrl ? (
                            <a
                              href={row.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-foreground"
                            >
                              {row.sourceName} &#8599;
                            </a>
                          ) : (
                            row.sourceName
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-10">
          <ButtonLink href="/calculator" variant="primary" size="md">
            Calculate my storage
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
