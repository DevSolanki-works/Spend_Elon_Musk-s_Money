import {
  DEFAULT_CALCULATOR_PROFILE,
  HEADROOM_ASSUMPTIONS,
} from "./assumptions.ts";
import {
  calculateAppsCategory,
  calculateDocumentsCategory,
  calculateGamesCategory,
  calculateOtherCategory,
  calculatePhotosCategory,
  calculateVideosCategory,
  resolveEffectiveTimeHorizonYears,
} from "./calculations.ts";
import { formatYearsLabel } from "./format.ts";
import {
  computeStorageEstimateSummary,
  evaluateCurrentStorageStatus,
  evaluateStorageTiers,
} from "./recommendations.ts";
import type {
  CalculationResult,
  CalculatorInputProfile,
  CategoryBreakdownItem,
  PurposeId,
  UsedAssumptionSummary,
} from "./types.ts";

const VALID_PURPOSES = new Set<PurposeId>([
  "phone",
  "laptop",
  "gaming",
  "photography",
  "video",
  "cloud",
  "other",
]);

/**
 * Core Storage Reality calculation engine.
 * Pure, deterministic, side-effect-free function that accepts a user profile
 * and returns a structured storage recommendation, breakdown, tier comparison,
 * and transparent list of assumptions used.
 */
export function calculateStorageReality(
  rawInput?: Partial<CalculatorInputProfile>
): CalculationResult {
  const resolvedPurpose: PurposeId =
    rawInput === undefined
      ? DEFAULT_CALCULATOR_PROFILE.purpose ?? "phone"
      : rawInput.purpose && VALID_PURPOSES.has(rawInput.purpose)
      ? rawInput.purpose
      : "other";

  const input: CalculatorInputProfile = {
    purpose: resolvedPurpose,
    habit: rawInput?.habit ?? DEFAULT_CALCULATOR_PROFILE.habit,
    volume: rawInput?.volume ?? DEFAULT_CALCULATOR_PROFILE.volume,
    selectedCategories: Array.isArray(rawInput?.selectedCategories)
      ? rawInput.selectedCategories
      : DEFAULT_CALCULATOR_PROFILE.selectedCategories,
    photoProfile: {
      ...DEFAULT_CALCULATOR_PROFILE.photoProfile,
      ...rawInput?.photoProfile,
    },
    videoProfile: {
      ...DEFAULT_CALCULATOR_PROFILE.videoProfile,
      ...rawInput?.videoProfile,
    },
    gamesProfile: {
      ...DEFAULT_CALCULATOR_PROFILE.gamesProfile,
      ...rawInput?.gamesProfile,
    },
    appsProfile: {
      ...DEFAULT_CALCULATOR_PROFILE.appsProfile,
      ...rawInput?.appsProfile,
    },
    documentsProfile: {
      ...DEFAULT_CALCULATOR_PROFILE.documentsProfile,
      ...rawInput?.documentsProfile,
    },
    otherProfile: {
      ...DEFAULT_CALCULATOR_PROFILE.otherProfile,
      ...rawInput?.otherProfile,
    },
    timeHorizon: {
      ...DEFAULT_CALCULATOR_PROFILE.timeHorizon,
      ...rawInput?.timeHorizon,
    },
    currentStorage: {
      ...DEFAULT_CALCULATOR_PROFILE.currentStorage,
      ...rawInput?.currentStorage,
    },
  };

  const selectedSet = new Set(input.selectedCategories);
  const hasSelectedCategories = selectedSet.size > 0;
  const effectiveYears = resolveEffectiveTimeHorizonYears(input.timeHorizon);

  const rawCategories = [
    calculatePhotosCategory(
      input.photoProfile,
      selectedSet.has("photos"),
      effectiveYears
    ),
    calculateVideosCategory(
      input.videoProfile,
      selectedSet.has("videos"),
      effectiveYears
    ),
    calculateGamesCategory(input.gamesProfile, selectedSet.has("games")),
    calculateAppsCategory(input.appsProfile, selectedSet.has("apps")),
    calculateDocumentsCategory(
      input.documentsProfile,
      selectedSet.has("documents")
    ),
    calculateOtherCategory(
      input.otherProfile,
      selectedSet.has("other"),
      effectiveYears
    ),
  ];

  const totalRawContentGb = rawCategories.reduce(
    (sum, item) => sum + (item.selected ? item.estimatedGb : 0),
    0
  );

  const categoryBreakdown: CategoryBreakdownItem[] = rawCategories.map(
    (item) => {
      const shareOfContentPercent =
        item.selected && totalRawContentGb > 0
          ? Math.round((item.estimatedGb / totalRawContentGb) * 100)
          : 0;

      return {
        ...item,
        shareOfContentPercent,
      };
    }
  );

  const totalEstimatedStorage = computeStorageEstimateSummary(
    categoryBreakdown,
    hasSelectedCategories,
    resolvedPurpose
  );

  const { recommendedStorage, tierComparisons } = evaluateStorageTiers(
    totalEstimatedStorage,
    effectiveYears,
    categoryBreakdown,
    resolvedPurpose
  );

  const currentStorageStatus = evaluateCurrentStorageStatus(
    input.currentStorage,
    totalEstimatedStorage,
    recommendedStorage.tier
  );

  const isCloud = resolvedPurpose === "cloud";
  const bufferPct = Math.round(
    (isCloud
      ? HEADROOM_ASSUMPTIONS.cloudBufferRatio
      : HEADROOM_ASSUMPTIONS.contentBufferRatio) * 100
  );
  const minFloorGb = isCloud
    ? HEADROOM_ASSUMPTIONS.cloudMinimumHeadroomGb
    : HEADROOM_ASSUMPTIONS.minimumHeadroomGb;

  // Compile transparent list of assumptions used in this calculation
  const assumptions: UsedAssumptionSummary[] = [
    ...categoryBreakdown
      .filter((c) => c.selected)
      .map((c) => c.assumptionUsed),
    {
      categoryId: "time_horizon",
      title: "Planned time horizon",
      valueSummary: `${formatYearsLabel(effectiveYears)} (${
        effectiveYears * 12
      } months)`,
      explanation:
        "Recurring monthly additions (such as new photos, recorded videos, and growing archives) are multiplied across this ownership period.",
      rationale:
        "Storage requirements compound over time. Multiplying monthly additions by 12 × years ensures your device or drive still fits your files at the end of its ownership lifecycle.",
      sourceName: "User-Selected Ownership Horizon",
      sourceType: "planning_heuristic",
      confidence: "high",
      unit: "years",
      kind: "policy",
      isProvisional: false,
    },
    {
      categoryId: "headroom",
      title: HEADROOM_ASSUMPTIONS.label,
      valueSummary: `${totalEstimatedStorage.formattedHeadroom} buffer (+${bufferPct}% of content, min ${minFloorGb} GB)`,
      explanation: HEADROOM_ASSUMPTIONS.whatItRepresents,
      rationale: HEADROOM_ASSUMPTIONS.rationale,
      sourceName: HEADROOM_ASSUMPTIONS.sourceName,
      sourceUrl: HEADROOM_ASSUMPTIONS.sourceUrl,
      sourceType: HEADROOM_ASSUMPTIONS.sourceType,
      confidence: HEADROOM_ASSUMPTIONS.confidence,
      unit: HEADROOM_ASSUMPTIONS.unit,
      low: minFloorGb,
      high: totalEstimatedStorage.recommendedHeadroomGb,
      kind: HEADROOM_ASSUMPTIONS.kind,
      isProvisional: HEADROOM_ASSUMPTIONS.isProvisional,
    },
  ];

  return {
    purpose: resolvedPurpose,
    hasSelectedCategories,
    effectiveTimeHorizonYears: effectiveYears,
    categoryBreakdown,
    totalEstimatedStorage,
    recommendedStorage,
    tierComparisons,
    currentStorageStatus,
    assumptions,
  };
}
