"use client";

import Link from "next/link";
import { formatYearsLabel } from "@/lib/calculator/format";
import type { CalculationResult } from "@/lib/calculator/types";
import { Button } from "@/components/ui/Button";

interface ResultScreenProps {
  result: CalculationResult;
  onEditAnswers: () => void;
  onOpenAdvanced: () => void;
  onReset: () => void;
  onCopyShareLink: () => void;
  copiedShareLink: boolean;
}

interface ThreeTierCardItem {
  label: string;
  caption: string;
  isRecommended: boolean;
}

function getThreeTierOptions(result: CalculationResult): ThreeTierCardItem[] {
  const { recommendedStorage, tierComparisons } = result;

  if (recommendedStorage.exceedsStandardTiers) {
    return [
      {
        label: "2 TB",
        caption: "Too small",
        isRecommended: false,
      },
      {
        label: "4 TB",
        caption: "May feel tight",
        isRecommended: false,
      },
      {
        label: "8 TB+",
        caption: "Recommended",
        isRecommended: true,
      },
    ];
  }

  const list = tierComparisons;
  if (list.length === 0) {
    return [
      {
        label: recommendedStorage.tier,
        caption: "Recommended",
        isRecommended: true,
      },
    ];
  }

  const recIndex = list.findIndex((t) => t.isRecommended);
  const safeIndex = recIndex >= 0 ? recIndex : 0;

  const count = Math.min(3, list.length);
  const startIndex = Math.max(0, Math.min(safeIndex - 1, list.length - count));
  const slice = list.slice(startIndex, startIndex + count);

  return slice.map((item) => {
    if (item.isRecommended) {
      return {
        label: item.tier,
        caption:
          result.purpose === "phone" &&
          recommendedStorage.exceedsPracticalDeviceCapacity
            ? "Max phone tier"
            : "Recommended",
        isRecommended: true,
      };
    }

    if (item.status === "tight") {
      return {
        label: item.tier,
        caption: "May feel tight",
        isRecommended: false,
      };
    }

    if (item.status === "too_small") {
      return {
        label: item.tier,
        caption: "Too small",
        isRecommended: false,
      };
    }

    return {
      label: item.tier,
      caption: "More than you need",
      isRecommended: false,
    };
  });
}

export function ResultScreen({
  result,
  onEditAnswers,
  onOpenAdvanced,
  onReset,
  onCopyShareLink,
  copiedShareLink,
}: ResultScreenProps) {
  const {
    totalEstimatedStorage,
    recommendedStorage,
    categoryBreakdown,
    currentStorageStatus,
    effectiveTimeHorizonYears,
  } = result;

  const activeCategories = categoryBreakdown.filter((c) => c.selected);
  const threeTiers = getThreeTierOptions(result);
  const yearsLabel = formatYearsLabel(effectiveTimeHorizonYears);

  return (
    <div className="space-y-7">
      {/* Primary Recommendation */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
          {recommendedStorage.deviceContextLabel}
        </p>
        <div className="mt-2 text-5xl font-bold tracking-tight text-foreground tabular-nums sm:text-6xl">
          {recommendedStorage.tier}
        </div>
        <p className="mt-2 text-base font-medium text-accent-primary">
          {recommendedStorage.exceedsPracticalDeviceCapacity
            ? "Practical maximum for this device"
            : "Recommended for you"}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted sm:text-base">
          {recommendedStorage.tagline}
        </p>
      </div>

      {/* Three Storage Options */}
      <div
        role="region"
        aria-label="Storage size comparison"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {threeTiers.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg border p-4 transition-colors ${
              item.isRecommended
                ? "border-accent-primary bg-accent-soft/60"
                : "border-border-subtle bg-surface"
            }`}
          >
            <div className="text-xl font-semibold tracking-tight text-foreground tabular-nums">
              {item.label}
            </div>
            <div
              className={`mt-1 text-xs font-medium ${
                item.isRecommended
                  ? "text-accent-primary"
                  : "text-foreground-muted"
              }`}
            >
              {item.caption}
            </div>
          </div>
        ))}
      </div>

      {/* Practical Device / Workflow Guidance Callout */}
      {recommendedStorage.workflowGuidance && (
        <div
          className={`rounded-lg border p-4 text-sm leading-relaxed ${
            recommendedStorage.exceedsPracticalDeviceCapacity
              ? "border-accent-border bg-accent-soft/40 text-foreground"
              : "border-border-subtle bg-surface-subtle/60 text-foreground-muted"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {recommendedStorage.exceedsPracticalDeviceCapacity
              ? "Device limit & backup strategy"
              : "Practical storage tip"}
          </p>
          <p className="mt-1">{recommendedStorage.workflowGuidance}</p>
        </div>
      )}

      {/* Progressive Disclosure Sections */}
      <div className="divide-y divide-border-subtle border-y border-border-subtle">
        {/* 1. Why [Tier]? */}
        <details className="group py-4" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-foreground">
            <span>Why {recommendedStorage.tier}?</span>
            <span className="text-xs text-foreground-muted transition-transform group-open:rotate-180">
              &#9662;
            </span>
          </summary>
          <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-foreground-muted">
            <p>
              You&apos;re likely to use around{" "}
              <strong className="font-medium text-foreground tabular-nums">
                {totalEstimatedStorage.formattedContent}
              </strong>{" "}
              over {yearsLabel}
              {totalEstimatedStorage.hasSignificantUncertainty
                ? ` (typical range ${totalEstimatedStorage.formattedContentRange})`
                : ""}
              . We also leave{" "}
              <strong className="font-medium text-foreground tabular-nums">
                {totalEstimatedStorage.formattedHeadroom}
              </strong>{" "}
              of room for future growth, system files, and free working space
              (bringing your planned total to{" "}
              <strong className="font-medium text-foreground tabular-nums">
                {totalEstimatedStorage.formattedTotalPlanned}
              </strong>
              ), so{" "}
              <strong className="font-medium text-foreground tabular-nums">
                {recommendedStorage.tier}
              </strong>{" "}
              {recommendedStorage.exceedsPracticalDeviceCapacity
                ? "is the highest practical tier for this device while you offload older files to cloud or external storage."
                : "gives you a comfortable margin."}
            </p>
            {currentStorageStatus.hasCurrentStorage && (
              <p className="text-foreground">
                Compared with your current{" "}
                <span className="font-medium tabular-nums">
                  {currentStorageStatus.formattedCurrentStorage}
                </span>
                : {currentStorageStatus.headline.toLowerCase()}.{" "}
                <span className="text-foreground-muted">
                  {currentStorageStatus.detail}
                </span>
              </p>
            )}
          </div>
        </details>

        {/* 2. See the full breakdown */}
        <details className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-foreground">
            <span>See the full breakdown</span>
            <span className="text-xs text-foreground-muted transition-transform group-open:rotate-180">
              &#9662;
            </span>
          </summary>
          <div className="mt-3 space-y-3 text-sm">
            <dl className="divide-y divide-border-subtle">
              {activeCategories.map((item) => (
                <div
                  key={item.categoryId}
                  className="flex items-baseline justify-between gap-4 py-2.5"
                >
                  <div>
                    <dt className="font-medium text-foreground">{item.label}</dt>
                    <dd className="text-xs text-foreground-muted">
                      {item.summaryLine}
                    </dd>
                  </div>
                  <dd className="shrink-0 text-right text-sm font-medium text-foreground tabular-nums">
                    {item.formattedEstimate}
                  </dd>
                </div>
              ))}

              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <div>
                  <dt className="font-medium text-foreground">
                    Free space &amp; headroom
                  </dt>
                  <dd className="text-xs text-foreground-muted">
                    {result.purpose === "cloud"
                      ? "12% buffer for shared folders and version growth (min 8 GB)"
                      : "20% buffer for system updates, caches, and growth (min 16 GB)"}
                  </dd>
                </div>
                <dd className="shrink-0 text-sm font-medium text-foreground tabular-nums">
                  {totalEstimatedStorage.formattedHeadroom}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-4 pt-3 font-medium">
                <dt className="text-foreground">Total planned capacity</dt>
                <dd className="text-base text-foreground tabular-nums">
                  {totalEstimatedStorage.formattedTotalPlanned}
                </dd>
              </div>
            </dl>

            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenAdvanced}
                className="text-xs font-medium text-accent-primary hover:underline cursor-pointer"
              >
                Fine-tune exact numbers in advanced settings &rarr;
              </button>
            </div>
          </div>
        </details>

        {/* 3. About this estimate */}
        <details className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-foreground">
            <span>About this estimate</span>
            <span className="font-mono text-xs text-foreground-muted transition-transform group-open:rotate-180">
              &#9662;
            </span>
          </summary>
          <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-foreground-muted">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Real-world file sizes vary depending on your camera settings,
                scene detail, game updates, and accumulated app caches.
              </li>
              <li>
                Our assumptions are based on researched file-size ranges and
                include a 20% free-space buffer (12% for cloud plans) so your
                storage doesn&apos;t feel full.
              </li>
              <li>
                Capacities use standard manufacturer decimal gigabytes (1 GB =
                1,000 MB).
              </li>
            </ul>
            <p className="pt-1">
              <Link
                href="/methodology"
                className="font-medium text-accent-primary hover:underline"
              >
                View calculation methodology &rarr;
              </Link>
            </p>
          </div>
        </details>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={onEditAnswers}>
            Change answers
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Start over
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={onCopyShareLink}>
          {copiedShareLink ? "Link copied" : "Share link"}
        </Button>
      </div>
    </div>
  );
}
