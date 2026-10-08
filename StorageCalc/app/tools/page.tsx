import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PurposeIcon, type PurposeIconId } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Practical storage calculators, device presets, and reference guides from Storage Reality.",
  alternates: {
    canonical: "/tools",
  },
};

const CALCULATOR_PRESETS: {
  id: PurposeIconId;
  title: string;
  range: string;
  description: string;
  href: string;
}[] = [
  {
    id: "phone",
    title: "Phone Storage Planner",
    range: "128 GB – 1 TB",
    description:
      "Start the calculator configured for iPhone or Android apps, photos, 4K clips, and system headroom.",
    href: "/calculator?purpose=phone",
  },
  {
    id: "laptop",
    title: "Laptop SSD Planner",
    range: "256 GB – 2 TB",
    description:
      "Estimate local storage for macOS or Windows programs, documents, offline media, and project files.",
    href: "/calculator?purpose=laptop",
  },
  {
    id: "gaming",
    title: "Gaming Storage Planner",
    range: "512 GB – 4 TB",
    description:
      "Plan PC, console, or handheld storage based on how many indie, mid-size, and AAA games you keep installed.",
    href: "/calculator?purpose=gaming",
  },
  {
    id: "photography",
    title: "Photography Library Planner",
    range: "256 GB – 4 TB+",
    description:
      "Model existing photo archives and monthly shooting volume across HEIC, high-res JPEG, and RAW.",
    href: "/calculator?purpose=photography",
  },
  {
    id: "video",
    title: "Video Recording Planner",
    range: "512 GB – 4 TB+",
    description:
      "Calculate storage growth for 1080p, 4K, and 8K video at 30fps or 60fps, or enter a custom Mbps bitrate.",
    href: "/calculator?purpose=video",
  },
  {
    id: "cloud",
    title: "Cloud Backup Planner",
    range: "200 GB – 2 TB+",
    description:
      "Estimate how much cloud storage your photos, videos, and personal documents will need over 1–5 years.",
    href: "/calculator?purpose=cloud",
  },
];

const REFERENCE_SECTIONS = [
  {
    title: "Photo File Size Assumptions",
    description:
      "Typical MB per photo and realistic ranges for HEIC/JPEG phone photos, 24–48 MP high-res modes, DSLR/mirrorless JPEGs, and RAW files.",
    href: "/methodology#photos",
  },
  {
    title: "Video Bitrate & MB/Minute Table",
    description:
      "How Mbps converts to MB per minute (1 Mbps = 7.5 MB/min) across 720p, 1080p, 4K, and 8K at 30fps and 60fps.",
    href: "/methodology#videos",
  },
  {
    title: "Game & Application Size Benchmarks",
    description:
      "Modern install size estimates for indie, mid-size, and 100 GB+ AAA games, plus everyday and creative software suites.",
    href: "/methodology#games",
  },
  {
    title: "Headroom & Storage Tier Thresholds",
    description:
      "Why we reserve 20% working headroom and how planned capacity maps to standard 64 GB – 4 TB hardware tiers.",
    href: "/methodology#headroom",
  },
];

export default function ToolsPage() {
  return (
    <div className="divide-y divide-border-subtle">
      <section aria-labelledby="tools-page-heading" className="py-10 sm:py-12">
        <Container size="wide">
          <div className="max-w-2xl">
            <h1
              id="tools-page-heading"
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              Tools
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted sm:text-base">
              Practical utilities and reference models to help you choose the
              right digital storage capacity.
            </p>
          </div>

          {/* Primary Featured Tool */}
          <div className="mt-6 rounded-xl border border-border-subtle bg-surface p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    Storage Reality Calculator
                  </h2>
                  <span className="rounded-xs border border-border-subtle bg-surface-subtle px-2 py-0.5 text-xs font-medium text-foreground-muted">
                    Primary tool
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted sm:text-base">
                  Find the storage size that fits your needs. Answer four
                  everyday questions—or customize exact photo counts, video
                  bitrates, and game libraries—to get a hardware tier
                  recommendation from 64 GB to 4 TB+.
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-foreground-muted">
                  <li>&bull; 1 to 5+ year growth modeling</li>
                  <li>&bull; 20% system &amp; free-space headroom</li>
                  <li>&bull; Shareable result links</li>
                  <li>&bull; Optional advanced overrides</li>
                </ul>
              </div>

              <div className="shrink-0">
                <ButtonLink href="/calculator" variant="primary" size="lg">
                  Open calculator &rarr;
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Preset Entry Points */}
      <section className="py-10 sm:py-12">
        <Container size="wide">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Start by device or use case
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Jump straight into the calculator pre-configured for a specific
              storage decision.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CALCULATOR_PRESETS.map((preset) => (
              <Link
                key={preset.id}
                href={preset.href}
                className="group flex flex-col justify-between rounded-lg border border-border-subtle bg-surface p-4 transition-colors hover:border-border-strong"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-subtle text-foreground">
                        <PurposeIcon id={preset.id} className="h-4 w-4" />
                      </span>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-accent-primary">
                        {preset.title}
                      </h3>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-xs text-foreground-subtle tabular-nums">
                      {preset.range}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-foreground-muted">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-border-subtle pt-2.5 text-xs font-medium text-foreground-muted group-hover:text-foreground">
                  <span>Launch preset</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Methodology & Reference Tables */}
      <section className="py-10 sm:py-12">
        <Container size="wide">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Methodology &amp; reference tables
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                Inspect the file-size benchmarks, formulas, and worked examples
                used by our calculation engine.
              </p>
            </div>
            <Link
              href="/methodology"
              className="text-sm font-medium text-accent-primary hover:underline"
            >
              Full methodology &rarr;
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {REFERENCE_SECTIONS.map((ref) => (
              <Link
                key={ref.title}
                href={ref.href}
                className="group rounded-lg border border-border-subtle bg-surface p-4 transition-colors hover:border-border-strong"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent-primary">
                    {ref.title}
                  </h3>
                  <span className="text-xs text-foreground-muted group-hover:text-foreground">
                    &rarr;
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground-muted">
                  {ref.description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
