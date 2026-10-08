import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PurposeIcon, type PurposeIconId } from "@/components/ui/Icons";

interface UseCaseItem {
  id: PurposeIconId;
  title: string;
  typicalRange: string;
  description: string;
  href: string;
}

const USE_CASES: UseCaseItem[] = [
  {
    id: "phone",
    title: "Phone",
    typicalRange: "128 GB – 1 TB",
    description:
      "Apps, everyday photos, 4K video clips, offline downloads, and system updates.",
    href: "/calculator?purpose=phone",
  },
  {
    id: "laptop",
    title: "Laptop",
    typicalRange: "256 GB – 2 TB",
    description:
      "Desktop programs, work documents, local photo libraries, and project files.",
    href: "/calculator?purpose=laptop",
  },
  {
    id: "gaming",
    title: "Gaming",
    typicalRange: "512 GB – 4 TB",
    description:
      "Console, PC, or handheld game libraries, modern AAA installs, and update patches.",
    href: "/calculator?purpose=gaming",
  },
  {
    id: "photography",
    title: "Photography",
    typicalRange: "256 GB – 4 TB+",
    description:
      "High-resolution phone libraries, mirrorless JPEGs, and uncompressed RAW shoots.",
    href: "/calculator?purpose=photography",
  },
  {
    id: "video",
    title: "Video",
    typicalRange: "512 GB – 4 TB+",
    description:
      "Regular 1080p, 4K, or 60fps video recording where footage adds up every month.",
    href: "/calculator?purpose=video",
  },
  {
    id: "cloud",
    title: "Cloud storage",
    typicalRange: "200 GB – 2 TB+",
    description:
      "Multi-year photo and video backups, family libraries, and synced document folders.",
    href: "/calculator?purpose=cloud",
  },
];

const TIER_GLANCE = [
  {
    tier: "128 GB",
    fit: "Light phone use, streaming media, and cloud-backed photos",
  },
  {
    tier: "256 GB",
    fit: "Everyday smartphone or work laptop with moderate local files",
  },
  {
    tier: "512 GB",
    fit: "Regular 4K video clips, large apps, or 4–6 modern games",
  },
  {
    tier: "1 TB",
    fit: "Heavy photo/video libraries, creative work, or 10+ large games",
  },
  {
    tier: "2 TB+",
    fit: "RAW photography, frequent 4K/60 filming, or large local archives",
  },
];

const ESTIMATE_FACTORS = [
  {
    name: "Photos",
    detail: "Current photo library plus new photos added each month (HEIC, JPEG, or RAW).",
  },
  {
    name: "Videos",
    detail: "Monthly recording duration scaled by resolution (720p to 8K) and frame rate.",
  },
  {
    name: "Games",
    detail: "Installed library across indie titles, mid-size games, and 100 GB+ AAA releases.",
  },
  {
    name: "Apps",
    detail: "Everyday apps, creative or developer tools, and local application caches.",
  },
  {
    name: "Documents",
    detail: "PDFs, office files, project archives, and offline downloads.",
  },
  {
    name: "Future growth",
    detail: "How your files accumulate over your chosen 1, 2, 3, or 5-year horizon.",
  },
  {
    name: "Free space & headroom",
    detail: "A practical 20% buffer for OS updates, temporary caches, and drive health.",
  },
];

export default function HomePage() {
  return (
    <div className="divide-y divide-border-subtle">
      {/* B. HERO */}
      <section className="py-10 sm:py-14">
        <Container size="wide">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] lg:leading-[1.13]">
                How much storage do you actually need?
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground-muted sm:text-lg">
                Answer four simple questions about how you use your device.
                We&apos;ll estimate what your photos, videos, games, and files
                will need over time and recommend a practical storage size.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <ButtonLink href="/calculator" variant="primary" size="lg">
                  Calculate my storage
                </ButtonLink>
                <ButtonLink href="/methodology" variant="secondary" size="lg">
                  How we calculate
                </ButtonLink>
              </div>

              <p className="mt-3.5 text-xs text-foreground-subtle">
                Free &middot; No account required &middot; Takes under a minute
              </p>
            </div>

            {/* Right-hand At-a-Glance Reference Block */}
            <div className="lg:col-span-5">
              <div className="rounded-lg border border-border-subtle bg-surface p-5">
                <div className="flex items-baseline justify-between gap-2 border-b border-border-subtle pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Storage sizes at a glance
                  </h2>
                  <span className="shrink-0 whitespace-nowrap text-xs text-foreground-subtle tabular-nums">
                    128 GB – 2 TB+
                  </span>
                </div>

                <dl className="divide-y divide-border-subtle text-sm">
                  {TIER_GLANCE.map((item) => (
                    <div
                      key={item.tier}
                      className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <dt className="w-16 shrink-0 font-semibold text-foreground tabular-nums">
                        {item.tier}
                      </dt>
                      <dd className="flex-1 text-xs leading-snug text-foreground-muted">
                        {item.fit}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-3 border-t border-border-subtle pt-3">
                  <Link
                    href="/calculator"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-primary hover:underline"
                  >
                    <span>Find which tier fits your usage</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* C. WHAT CAN WE HELP YOU WITH? */}
      <section className="py-10 sm:py-12">
        <Container size="wide">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                What can we help you with?
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                Choose what you&apos;re buying or planning for to start the
                calculator with tailored questions.
              </p>
            </div>
            <Link
              href="/calculator"
              className="text-sm font-medium text-accent-primary hover:underline"
            >
              Or start with everything &rarr;
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex flex-col justify-between rounded-lg border border-border-subtle bg-surface p-4 transition-colors hover:border-border-strong"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-subtle text-foreground group-hover:border-border-strong">
                        <PurposeIcon id={item.id} className="h-4 w-4" />
                      </span>
                      <h3 className="text-base font-semibold text-foreground group-hover:text-accent-primary">
                        {item.title}
                      </h3>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-xs font-medium text-foreground-subtle tabular-nums">
                      {item.typicalRange}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-foreground-muted">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-border-subtle pt-2.5 text-xs font-medium text-foreground-muted group-hover:text-foreground">
                  <span>Calculate for {item.title.toLowerCase()}</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* D. HOW IT WORKS */}
      <section className="py-10 sm:py-12">
        <Container size="wide">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              How it works
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              A straightforward three-step process designed for normal buyers,
              not storage engineers.
            </p>
          </div>

          <ol className="mt-6 grid grid-cols-1 gap-6 border-t border-border-subtle pt-6 sm:grid-cols-3 sm:gap-8">
            <li className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border-subtle bg-surface text-xs font-semibold text-foreground tabular-nums">
                  1
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  Tell us how you use storage
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground-muted">
                Pick what you&apos;re choosing storage for and answer a few
                plain-English questions about your habits and how long you plan
                to keep the device.
              </p>
            </li>

            <li className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border-subtle bg-surface text-xs font-semibold text-foreground tabular-nums">
                  2
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  We estimate what you&apos;ll need
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground-muted">
                Our model calculates your current library, monthly additions
                over 1–5 years, realistic file-size ranges, and 20% working
                headroom.
              </p>
            </li>

            <li className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border-subtle bg-surface text-xs font-semibold text-foreground tabular-nums">
                  3
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  Get a practical recommendation
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground-muted">
                See the exact storage tier to buy (from 64 GB to 4 TB+), how
                adjacent sizes compare, and a full category-by-category
                breakdown.
              </p>
            </li>
          </ol>
        </Container>
      </section>

      {/* E. WHY STORAGE REALITY? */}
      <section className="py-10 sm:py-12">
        <Container size="wide">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Why Storage Reality?
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
                <p>
                  Most storage calculators ask for technical information normal
                  people don&apos;t know—like video bitrates in Mbps, codec
                  efficiency, or raw file sizes in megabytes.
                </p>
                <p>
                  Storage Reality turns everyday usage into a practical storage
                  recommendation, while keeping every underlying formula and
                  source open for inspection.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary hover:underline"
                >
                  <span>Inspect our calculation methodology</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-lg border border-border-subtle bg-surface">
                <div className="border-b border-border-subtle px-4 py-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    What every estimate accounts for
                  </h3>
                </div>
                <dl className="divide-y divide-border-subtle text-sm">
                  {ESTIMATE_FACTORS.map((factor) => (
                    <div
                      key={factor.name}
                      className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-12 sm:gap-4"
                    >
                      <dt className="font-medium text-foreground sm:col-span-4">
                        {factor.name}
                      </dt>
                      <dd className="text-xs leading-relaxed text-foreground-muted sm:col-span-8">
                        {factor.detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* F. TOOLS SECTION */}
      <section className="py-10 sm:py-12">
        <Container size="wide">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Tools
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                Practical utilities for planning device and backup capacity.
              </p>
            </div>
            <Link
              href="/tools"
              className="text-sm font-medium text-accent-primary hover:underline"
            >
              View tools index &rarr;
            </Link>
          </div>

          <div className="mt-6 rounded-lg border border-border-subtle bg-surface p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-semibold text-foreground">
                    Storage Reality Calculator
                  </h3>
                  <span className="rounded-xs border border-border-subtle bg-surface-subtle px-2 py-0.5 text-xs font-medium text-foreground-muted">
                    Interactive planner
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                  Estimate how much storage you need across photos, videos,
                  games, apps, and documents over 1 to 5+ years, with optional
                  advanced controls for custom photo formats and video bitrates.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
                  <span className="font-medium text-foreground">
                    Quick launch:
                  </span>
                  {USE_CASES.map((u) => (
                    <Link
                      key={u.id}
                      href={u.href}
                      className="rounded-md border border-border-subtle bg-background px-2.5 py-1 font-medium text-foreground hover:border-border-strong"
                    >
                      {u.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                <ButtonLink href="/calculator" variant="primary" size="md">
                  Open calculator &rarr;
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
