import { HEADROOM_ASSUMPTIONS, STORAGE_TIERS } from "./assumptions.ts";
import {
  formatStorageGb,
  formatStorageRangeGb,
  formatYearsLabel,
  sanitizeNonNegativeNumber,
} from "./format.ts";
import type {
  CategoryBreakdownItem,
  CurrentStorageInput,
  CurrentStorageStatusResult,
  PurposeId,
  StorageEstimateSummary,
  StorageTierCapacity,
  TierComparisonItem,
} from "./types.ts";

/**
 * Computes practical headroom in GB for a given content volume and purpose.
 * - Cloud storage uses a lighter 12% buffer (min 8 GB) since cloud plans have no OS swap or binary formatting loss.
 * - Device/drive storage uses a 20% buffer (min 16 GB) up to 2,000 GB, tapering to +10% on volume above 2,000 GB
 *   so multi-terabyte media archives do not receive an exaggerated multi-terabyte OS buffer.
 */
export function calculateHeadroomForContentGb(
  contentGb: number,
  hasSelectedCategories: boolean,
  purpose: PurposeId = "other"
): number {
  const isCloud = purpose === "cloud";
  const minFloor = isCloud
    ? HEADROOM_ASSUMPTIONS.cloudMinimumHeadroomGb
    : HEADROOM_ASSUMPTIONS.minimumHeadroomGb;

  if (contentGb <= 0) {
    return hasSelectedCategories ? minFloor : 0;
  }

  const threshold = HEADROOM_ASSUMPTIONS.taperedThresholdGb;
  const baseRatio = isCloud
    ? HEADROOM_ASSUMPTIONS.cloudBufferRatio
    : HEADROOM_ASSUMPTIONS.contentBufferRatio;
  const taperedRatio = isCloud
    ? 0.08
    : HEADROOM_ASSUMPTIONS.taperedBufferRatio;

  const basePortion = Math.min(contentGb, threshold) * baseRatio;
  const excessPortion = Math.max(0, contentGb - threshold) * taperedRatio;

  return Math.max(minFloor, basePortion + excessPortion);
}

/**
 * Calculates practical headroom and total planned capacity from category estimates.
 * Centralized formula:
 *   Estimated content + Recommended headroom = Total planned capacity
 */
export function computeStorageEstimateSummary(
  categories: CategoryBreakdownItem[],
  hasSelectedCategories: boolean,
  purpose: PurposeId = "other"
): StorageEstimateSummary {
  const rawContentGb = categories.reduce(
    (sum, item) => sum + (item.selected ? item.estimatedGb : 0),
    0
  );
  const rawLowContentGb = categories.reduce(
    (sum, item) => sum + (item.selected ? item.lowGb : 0),
    0
  );
  const rawHighContentGb = categories.reduce(
    (sum, item) => sum + (item.selected ? item.highGb : 0),
    0
  );

  const estimatedContentGb = sanitizeNonNegativeNumber(rawContentGb, 0);
  const lowContentGb = sanitizeNonNegativeNumber(rawLowContentGb, 0);
  const highContentGb = Math.max(
    lowContentGb,
    sanitizeNonNegativeNumber(rawHighContentGb, 0)
  );

  const recommendedHeadroomGb = calculateHeadroomForContentGb(
    estimatedContentGb,
    hasSelectedCategories,
    purpose
  );

  const totalPlannedCapacityGb = estimatedContentGb + recommendedHeadroomGb;
  const lowPlannedCapacityGb =
    lowContentGb +
    (lowContentGb > 0
      ? calculateHeadroomForContentGb(lowContentGb, hasSelectedCategories, purpose)
      : recommendedHeadroomGb);
  const highPlannedCapacityGb =
    highContentGb +
    (highContentGb > 0
      ? calculateHeadroomForContentGb(highContentGb, hasSelectedCategories, purpose)
      : recommendedHeadroomGb);

  const uncertaintySpread =
    estimatedContentGb > 0
      ? (highContentGb - lowContentGb) / estimatedContentGb
      : 0;
  const hasSignificantUncertainty =
    estimatedContentGb >= 20 &&
    uncertaintySpread >= HEADROOM_ASSUMPTIONS.significantUncertaintyRatio;

  return {
    estimatedContentGb,
    lowContentGb,
    highContentGb,
    recommendedHeadroomGb,
    totalPlannedCapacityGb,
    lowPlannedCapacityGb,
    highPlannedCapacityGb,
    hasSignificantUncertainty,
    formattedContent: formatStorageGb(estimatedContentGb),
    formattedContentRange: formatStorageRangeGb(lowContentGb, highContentGb),
    formattedHeadroom: formatStorageGb(recommendedHeadroomGb),
    formattedTotalPlanned: formatStorageGb(totalPlannedCapacityGb),
    formattedTotalPlannedRange: formatStorageRangeGb(
      lowPlannedCapacityGb,
      highPlannedCapacityGb
    ),
  };
}

function getDeviceContextLabel(purpose: PurposeId, nominalGb: number): string {
  switch (purpose) {
    case "phone":
      return "Recommended phone capacity";
    case "laptop":
      return "Recommended laptop / SSD capacity";
    case "gaming":
      return "Recommended gaming SSD capacity";
    case "photography":
      return nominalGb >= 1000
        ? "Recommended photo archive / SSD capacity"
        : "Recommended photo storage capacity";
    case "video":
      return nominalGb >= 2000
        ? "Recommended creator drive / archive capacity"
        : "Recommended video storage capacity";
    case "cloud":
      return "Recommended cloud storage tier";
    default:
      return "Recommended storage capacity";
  }
}

/**
 * Selects the recommended storage tier and evaluates comparison tiers using
 * category-aware hardware constraints and practical workflow guidance.
 */
export function evaluateStorageTiers(
  summary: StorageEstimateSummary,
  effectiveYears: number,
  categories: CategoryBreakdownItem[],
  purpose: PurposeId = "other"
): {
  recommendedStorage: {
    tier: StorageTierCapacity;
    nominalGb: number;
    deviceContextLabel: string;
    tagline: string;
    whyExplanation: string;
    exceedsStandardTiers: boolean;
    exceedsPracticalDeviceCapacity: boolean;
    workflowGuidance: string | null;
  };
  tierComparisons: TierComparisonItem[];
} {
  const targetGb = summary.totalPlannedCapacityGb;
  const yearsText = formatYearsLabel(effectiveYears);

  // Determine valid candidate hardware tiers based on device/use-case category
  let candidateTiers = STORAGE_TIERS.filter((t) => t.nominalGb >= 128);
  if (purpose === "phone") {
    // Consumer smartphones top out at 1 TB (128 GB, 256 GB, 512 GB, 1 TB)
    candidateTiers = STORAGE_TIERS.filter(
      (t) => t.nominalGb >= 128 && t.nominalGb <= 1000
    );
  } else if (purpose === "laptop") {
    // Modern laptops start at 256 GB
    candidateTiers = STORAGE_TIERS.filter((t) => t.nominalGb >= 256);
  }

  const matchedTier = candidateTiers.find((t) => t.nominalGb >= targetGb);

  let recommendedTierLabel: StorageTierCapacity;
  let recommendedNominalGb: number;
  let exceedsStandardTiers = false;
  let exceedsPracticalDeviceCapacity = false;
  let workflowGuidance: string | null = null;

  if (purpose === "phone" && !matchedTier) {
    // Never recommend a 2 TB, 4 TB, or 8 TB phone! Cap internal phone recommendation at 1 TB
    recommendedTierLabel = "1 TB";
    recommendedNominalGb = 1000;
    exceedsStandardTiers = false;
    exceedsPracticalDeviceCapacity = true;
    workflowGuidance = `Consumer smartphones top out at 1 TB (with 2 TB limited to niche specialty models). Because your projected media library over ${yearsText} reaches ${summary.formattedTotalPlanned}, we recommend a 512 GB or 1 TB phone paired with cloud photo/video backup (iCloud+ or Google Photos) or periodic offloading to a portable USB-C SSD.`;
  } else if (!matchedTier) {
    recommendedTierLabel = "8 TB+";
    recommendedNominalGb = Math.ceil(targetGb / 1000) * 1000;
    exceedsStandardTiers = true;
    exceedsPracticalDeviceCapacity = purpose === "laptop";
  } else {
    recommendedTierLabel = matchedTier.label;
    recommendedNominalGb = matchedTier.nominalGb;
  }

  // Provide practical category-specific workflow advice even when within tier bounds
  if (!workflowGuidance) {
    if (purpose === "phone" && recommendedNominalGb === 1000 && targetGb >= 600) {
      workflowGuidance = `A 1 TB phone will hold your entire ${summary.formattedTotalPlanned} library locally on the device. If you prefer a 512 GB phone, turning on iCloud Photos or Google Photos "Optimize Storage" can offload older full-resolution 4K clips to the cloud.`;
    } else if (purpose === "laptop" && recommendedNominalGb >= 4000) {
      exceedsPracticalDeviceCapacity = recommendedNominalGb >= 8000;
      workflowGuidance = `Most laptops top out at 2 TB–4 TB of internal SSD storage, and factory 4 TB–8 TB upgrades are expensive. A practical setup is a 1 TB or 2 TB internal SSD for your OS, apps, and active work, paired with a fast USB4/Thunderbolt external SSD or NAS for your ${summary.formattedTotalPlanned} multi-year archive.`;
    } else if (purpose === "laptop" && recommendedNominalGb === 2000) {
      workflowGuidance = `If factory 2 TB laptop upgrades are pricey on your model, you can also choose a 1 TB internal SSD for daily apps and active projects and keep older media archives on a compact external NVMe SSD.`;
    } else if (purpose === "gaming" && recommendedNominalGb >= 2000) {
      workflowGuidance = `Modern AAA titles require fast NVMe SSD storage. If your desktop or laptop has a second M.2 slot, starting with a 1 TB–2 TB primary SSD and adding a secondary M.2 NVMe drive later is often more cost-effective than buying a single 4 TB+ drive upfront.`;
    } else if (purpose === "photography" && recommendedNominalGb >= 1000) {
      workflowGuidance = `A ${recommendedTierLabel} multi-year photo library (${summary.formattedTotalPlanned}) is best managed on a dedicated external SSD or NAS rather than internal laptop storage alone, ideally following a 3-2-1 backup rule (working drive + local backup + cloud/offsite copy).`;
    } else if (purpose === "video" && recommendedNominalGb >= 1000) {
      workflowGuidance = `Video editors typically separate active scratch storage from long-term archives: use a fast 1 TB–2 TB internal or Thunderbolt SSD for active timelines and render cache, and offload finished projects to a ${recommendedTierLabel} external archive drive or NAS.`;
    } else if (purpose === "cloud") {
      workflowGuidance = `Most consumer cloud services (iCloud+, Google One, OneDrive, Dropbox) offer 200 GB, 1 TB, and 2 TB+ plans rather than every hardware increment. Choose the smallest plan that covers ${summary.formattedTotalPlanned}—installed apps and games stay on your device and do not count toward cloud backup.`;
    }
  }

  // Build comparison list appropriate for the selected category
  let tiersToDisplay = STORAGE_TIERS.filter((t) => t.showInStandardComparison);
  if (purpose === "phone") {
    tiersToDisplay = STORAGE_TIERS.filter(
      (t) => t.nominalGb >= 128 && t.nominalGb <= 1000
    );
  } else if (purpose === "laptop") {
    tiersToDisplay = STORAGE_TIERS.filter(
      (t) =>
        t.nominalGb >= 256 &&
        (t.showInStandardComparison || (targetGb > 2000 && t.nominalGb >= 8000))
    );
  } else if (targetGb > 2000) {
    tiersToDisplay = STORAGE_TIERS.filter((t) => t.nominalGb >= 128);
  }

  const tierComparisons: TierComparisonItem[] = tiersToDisplay.map((tierDef) => {
    const isRecommended =
      !exceedsStandardTiers && tierDef.nominalGb === recommendedNominalGb;

    if (isRecommended) {
      if (purpose === "phone" && exceedsPracticalDeviceCapacity) {
        return {
          tier: tierDef.label,
          nominalGb: tierDef.nominalGb,
          status: "recommended",
          statusLabel: "Max phone tier",
          description:
            "Largest practical internal smartphone capacity — pair with cloud backup or external SSD offload for older media.",
          isRecommended: true,
        };
      }
      return {
        tier: tierDef.label,
        nominalGb: tierDef.nominalGb,
        status: "recommended",
        statusLabel: "Recommended",
        description:
          "Fits your estimated content plus comfortable headroom for future growth.",
        isRecommended: true,
      };
    }

    if (!exceedsStandardTiers && tierDef.nominalGb > recommendedNominalGb) {
      return {
        tier: tierDef.label,
        nominalGb: tierDef.nominalGb,
        status: "plenty_of_room",
        statusLabel: "Plenty of room",
        description:
          "Offers generous extra capacity if you want a longer buffer or heavier media use.",
        isRecommended: false,
      };
    }

    // Tier is smaller than recommendedNominalGb: distinguish "Tight" vs "Too small"
    const contentFitsOrNearlyFits =
      summary.estimatedContentGb > 0 &&
      (summary.estimatedContentGb <= tierDef.nominalGb ||
        summary.lowContentGb <= tierDef.nominalGb * 0.95);

    if (contentFitsOrNearlyFits) {
      return {
        tier: tierDef.label,
        nominalGb: tierDef.nominalGb,
        status: "tight",
        statusLabel: "Tight",
        description:
          "Close to your estimated usage with little breathing room for updates or spikes.",
        isRecommended: false,
      };
    }

    return {
      tier: tierDef.label,
      nominalGb: tierDef.nominalGb,
      status: "too_small",
      statusLabel: "Too small",
      description:
        "Below your projected content needs over your chosen time horizon.",
      isRecommended: false,
    };
  });

  const deviceContextLabel = getDeviceContextLabel(
    purpose,
    recommendedNominalGb
  );

  const tagline =
    summary.estimatedContentGb <= 0
      ? `Entry-level capacity with comfortable room for basic system use over ${yearsText}.`
      : purpose === "phone" && exceedsPracticalDeviceCapacity
      ? `1 TB is the largest practical phone tier — pair with cloud or external backup for your ${summary.formattedTotalPlanned} multi-year total.`
      : exceedsStandardTiers
      ? `Your projected usage (${summary.formattedTotalPlanned}) calls for multi-drive or high-capacity NAS/desktop storage.`
      : `Comfortable for your estimated usage over ${yearsText}.`;

  // Identify top contributing categories for the plain-English explanation
  const activeSorted = [...categories]
    .filter((c) => c.selected && c.estimatedGb > 0)
    .sort((a, b) => b.estimatedGb - a.estimatedGb);

  const topDriverText =
    activeSorted.length === 0
      ? ""
      : activeSorted.length === 1
      ? ` Your main storage driver is ${activeSorted[0].label.toLowerCase()} (${activeSorted[0].formattedEstimate}).`
      : ` Your largest storage drivers are ${activeSorted[0].label.toLowerCase()} (${
          activeSorted[0].formattedEstimate
        }) and ${activeSorted[1].label.toLowerCase()} (${
          activeSorted[1].formattedEstimate
        }).`;

  const bufferLabel =
    purpose === "cloud" ? "cloud growth headroom" : "recommended headroom";

  const whyExplanation =
    summary.estimatedContentGb <= 0
      ? `You haven't added significant file volume yet, so we include a ${summary.formattedHeadroom} baseline reserve for system files and everyday breathing room. A standard ${recommendedTierLabel} tier gives you plenty of space to get started.`
      : `You estimated ${summary.formattedContent} of content${
          summary.hasSignificantUncertainty
            ? ` (typical range ${summary.formattedContentRange})`
            : ""
        } over ${yearsText}.${topDriverText} We also add ${
          summary.formattedHeadroom
        } of ${bufferLabel} for free working space and future growth, bringing your total planned requirement to ${
          summary.formattedTotalPlanned
        }. ${
          purpose === "phone" && exceedsPracticalDeviceCapacity
            ? `Because ${summary.formattedTotalPlanned} exceeds what fits on a single smartphone, we recommend the 1 TB phone tier as your practical on-device maximum and offloading older 4K videos or photos to cloud storage or an external SSD.`
            : exceedsStandardTiers
            ? `Because this exceeds standard single-device tiers, we recommend planning for at least ${formatStorageGb(
                recommendedNominalGb,
                { includeTilde: false, compactTb: true }
              )} across high-capacity drives or NAS storage.`
            : `${recommendedTierLabel} is the first ${
                purpose === "phone"
                  ? "phone"
                  : purpose === "laptop"
                  ? "laptop SSD"
                  : purpose === "cloud"
                  ? "cloud"
                  : "standard storage"
              } tier that comfortably covers that total without running tight.`
        }`;

  return {
    recommendedStorage: {
      tier: recommendedTierLabel,
      nominalGb: recommendedNominalGb,
      deviceContextLabel,
      tagline,
      whyExplanation,
      exceedsStandardTiers,
      exceedsPracticalDeviceCapacity,
      workflowGuidance,
    },
    tierComparisons,
  };
}

/**
 * Evaluates the user's optional current storage capacity against their planned requirement.
 */
export function evaluateCurrentStorageStatus(
  currentStorage: CurrentStorageInput,
  summary: StorageEstimateSummary,
  recommendedTier: StorageTierCapacity
): CurrentStorageStatusResult {
  if (!currentStorage || currentStorage.preset === "none") {
    return {
      hasCurrentStorage: false,
      currentStorageGb: 0,
      formattedCurrentStorage: "None specified",
      status: "none",
      headline: "Buying new storage or comparing tiers",
      detail: `Use ${recommendedTier} as your target capacity when choosing your next device or drive.`,
      differenceGb: 0,
    };
  }

  const currentGb =
    currentStorage.preset === "custom"
      ? sanitizeNonNegativeNumber(currentStorage.customGb, 0, 100_000)
      : sanitizeNonNegativeNumber(Number(currentStorage.preset), 0, 100_000);

  const formattedCurrent = formatStorageGb(currentGb, {
    includeTilde: false,
    compactTb: true,
  });

  if (currentGb <= 0) {
    return {
      hasCurrentStorage: false,
      currentStorageGb: 0,
      formattedCurrentStorage: "0 GB",
      status: "none",
      headline: "No existing storage capacity entered",
      detail: `We recommend starting with ${recommendedTier} for your planned usage.`,
      differenceGb: 0,
    };
  }

  const diffFromPlanned = currentGb - summary.totalPlannedCapacityGb;

  if (currentGb < summary.estimatedContentGb) {
    const shortfall = formatStorageGb(
      summary.estimatedContentGb - currentGb,
      { includeTilde: true, compactTb: true }
    );
    return {
      hasCurrentStorage: true,
      currentStorageGb: currentGb,
      formattedCurrentStorage: formattedCurrent,
      status: "upgrade_recommended",
      headline: "You're likely to run out — consider upgrading",
      detail: `Your current ${formattedCurrent} storage is smaller than your estimated content alone (${summary.formattedContent}, short by ${shortfall}). Upgrading to ${recommendedTier} is recommended.`,
      differenceGb: diffFromPlanned,
    };
  }

  if (currentGb < summary.totalPlannedCapacityGb) {
    return {
      hasCurrentStorage: true,
      currentStorageGb: currentGb,
      formattedCurrentStorage: formattedCurrent,
      status: "tight",
      headline: "Your current storage is likely to feel tight",
      detail: `Your estimated content (${summary.formattedContent}) fits inside ${formattedCurrent}, but leaves less than our recommended headroom (${summary.formattedTotalPlanned} total planned). Consider ${recommendedTier} for a more comfortable buffer.`,
      differenceGb: diffFromPlanned,
    };
  }

  const spare = formatStorageGb(currentGb - summary.estimatedContentGb, {
    includeTilde: true,
    compactTb: true,
  });

  return {
    hasCurrentStorage: true,
    currentStorageGb: currentGb,
    formattedCurrentStorage: formattedCurrent,
    status: "enough",
    headline: "You currently have enough storage",
    detail: `Your ${formattedCurrent} storage covers your estimated content (${summary.formattedContent}) plus recommended headroom, leaving ${spare} above your projected files.`,
    differenceGb: diffFromPlanned,
  };
}
