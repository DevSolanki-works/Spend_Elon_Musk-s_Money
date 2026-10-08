export type StorageCategoryId =
  | "photos"
  | "videos"
  | "games"
  | "apps"
  | "documents"
  | "other";

export type StorageTierCapacity =
  | "64 GB"
  | "128 GB"
  | "256 GB"
  | "512 GB"
  | "1 TB"
  | "2 TB"
  | "4 TB"
  | "8 TB"
  | "8 TB+";

export interface StorageCategoryMeta {
  id: StorageCategoryId;
  name: string;
  shortLabel: string;
  description: string;
  keyFactors: string[];
  exampleFormats: string[];
  accentColorClass: string;
  barColorClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
}

// ==========================================
// CENTRALIZED ASSUMPTION METADATA TYPES
// ==========================================

export type AssumptionKind = "average" | "range" | "preset" | "policy";

export type AssumptionConfidence = "high" | "medium" | "low";

export type AssumptionSourceType =
  | "manufacturer_docs"
  | "technical_standard"
  | "platform_guidelines"
  | "planning_heuristic";

export interface AssumptionMetadata {
  id: string;
  label: string;
  /**
   * Primary typical value or baseline number for quick inspection.
   */
  value: number;
  /**
   * Optional lower bound of the realistic planning range.
   */
  low?: number;
  /**
   * Optional upper bound of the realistic planning range.
   */
  high?: number;
  /**
   * Unit for value/low/high (e.g., "MB / photo", "MB / min", "GB / game", "MB / app", "% of content").
   */
  unit: string;
  /**
   * Plain-English description of what this assumption represents.
   */
  description: string;
  whatItRepresents: string;
  whyItExists: string;
  /**
   * Technical rationale explaining how this number/range was chosen and why it varies.
   */
  rationale: string;
  /**
   * Name of the external reference, specification, or empirical basis.
   */
  sourceName: string;
  /**
   * Public URL to the external documentation or standard where applicable.
   */
  sourceUrl?: string;
  /**
   * Classification of the underlying source or methodology basis.
   */
  sourceType: AssumptionSourceType;
  /**
   * Confidence level in this assumption ("high" | "medium" | "low").
   */
  confidence: AssumptionConfidence;
  kind: AssumptionKind;
  appliesToUserType: string;
  /**
   * Marks numerical defaults that remain planning estimates rather than universal constants.
   */
  isProvisional: boolean;
}

export type PhotoTypePresetId =
  | "typical_phone"
  | "high_res_phone"
  | "dslr_jpeg"
  | "raw"
  | "custom";

export interface PhotoPresetAssumption extends AssumptionMetadata {
  id: PhotoTypePresetId;
  typicalMbPerPhoto: number;
  lowMbPerPhoto: number;
  highMbPerPhoto: number;
}

export type VideoQualityPresetId = "720p" | "1080p" | "4k" | "8k";
export type VideoFpsOption = 30 | 60;

export interface VideoQualityAssumption extends AssumptionMetadata {
  id: VideoQualityPresetId;
  mbPerMinute30Fps: number;
  mbPerMinute60Fps: number;
  approxBitrateMbps30Fps: number;
  approxBitrateMbps60Fps: number;
  lowFactor: number;
  highFactor: number;
}

export type GameSizePresetId =
  | "small"
  | "medium"
  | "large"
  | "very_large"
  | "custom";

export interface GameSizeAssumption extends AssumptionMetadata {
  id: GameSizePresetId;
  typicalGbPerGame: number;
  lowGbPerGame: number;
  highGbPerGame: number;
}

export type AppSizePresetId =
  | "small"
  | "typical"
  | "large"
  | "dont_know"
  | "custom";

export interface AppSizeAssumption extends AssumptionMetadata {
  id: AppSizePresetId;
  typicalMbPerApp: number;
  lowMbPerApp: number;
  highMbPerApp: number;
  defaultAppCount?: number;
}

export type DocumentSizePresetId =
  | "mostly_small"
  | "mixed"
  | "large"
  | "custom";

export interface DocumentSizeAssumption extends AssumptionMetadata {
  id: DocumentSizePresetId;
  typicalMbPerFile: number;
  lowMbPerFile: number;
  highMbPerFile: number;
}

export type OtherFilesPresetId = "light" | "moderate" | "heavy" | "custom";

export interface OtherFilesAssumption extends AssumptionMetadata {
  id: OtherFilesPresetId;
  typicalInitialGb: number;
  typicalMonthlyGb: number;
  lowFactor: number;
  highFactor: number;
}

export interface StorageTierDefinition {
  id: string;
  label: StorageTierCapacity;
  nominalGb: number;
  shortDescription: string;
  showInStandardComparison: boolean;
}

// ==========================================
// CALCULATOR INPUT PROFILE TYPES
// ==========================================

export type TimeHorizonPreset = "1" | "2" | "3" | "5" | "custom";

export interface PhotoProfileInput {
  currentPhotoCount: number;
  monthlyNewPhotos: number;
  photoType: PhotoTypePresetId;
  customFileSizeMb: number;
  /**
   * Optional category-level override for how long the user plans to keep adding photos.
   * When "inherit", uses the calculator's top-level timeHorizon.
   */
  durationMode: "inherit" | "1" | "2" | "3" | "5" | "custom";
  customDurationYears: number;
}

export interface VideoProfileInput {
  monthlyMinutes: number;
  currentVideoLibraryGb: number;
  quality: VideoQualityPresetId;
  fps: VideoFpsOption;
  useCustomBitrate: boolean;
  customBitrateMbps: number;
}

export interface GamesProfileInput {
  gameCount: number;
  sizePreset: GameSizePresetId;
  customGameSizeGb: number;
}

export interface AppsProfileInput {
  useDefaultEstimate: boolean;
  appCount: number;
  sizePreset: Exclude<AppSizePresetId, "dont_know">;
  customAppSizeMb: number;
}

export interface DocumentsProfileInput {
  fileCount: number;
  sizePreset: DocumentSizePresetId;
  customFileSizeMb: number;
}

export interface OtherFilesProfileInput {
  preset: OtherFilesPresetId;
  currentGb: number;
  monthlyGrowthGb: number;
}

export type PurposeId =
  | "phone"
  | "laptop"
  | "gaming"
  | "photography"
  | "video"
  | "cloud"
  | "other";

export type UsageHabitId = "light" | "everyday" | "heavy" | "creator";

export type VolumeLevelId = "low" | "medium" | "high" | "very_high";

export type CurrentStoragePreset =
  | "none"
  | "64"
  | "128"
  | "256"
  | "512"
  | "1000"
  | "2000"
  | "4000"
  | "custom";

export interface CurrentStorageInput {
  preset: CurrentStoragePreset;
  customGb: number;
}

export interface TimeHorizonInput {
  preset: TimeHorizonPreset;
  customYears: number;
}

export interface CalculatorInputProfile {
  purpose?: PurposeId;
  habit?: UsageHabitId;
  volume?: VolumeLevelId;
  selectedCategories: StorageCategoryId[];
  photoProfile: PhotoProfileInput;
  videoProfile: VideoProfileInput;
  gamesProfile: GamesProfileInput;
  appsProfile: AppsProfileInput;
  documentsProfile: DocumentsProfileInput;
  otherProfile: OtherFilesProfileInput;
  timeHorizon: TimeHorizonInput;
  currentStorage: CurrentStorageInput;
}

// ==========================================
// CALCULATOR OUTPUT RESULT TYPES
// ==========================================

export interface CategoryBreakdownItem {
  categoryId: StorageCategoryId;
  label: string;
  selected: boolean;
  estimatedGb: number;
  lowGb: number;
  highGb: number;
  formattedEstimate: string;
  formattedRange: string | null;
  shareOfContentPercent: number;
  summaryLine: string;
  assumptionUsed: UsedAssumptionSummary;
}

export interface UsedAssumptionSummary {
  categoryId: StorageCategoryId | "headroom" | "time_horizon";
  title: string;
  valueSummary: string;
  explanation: string;
  rationale: string;
  sourceName: string;
  sourceUrl?: string;
  sourceType: AssumptionSourceType;
  confidence: AssumptionConfidence;
  unit: string;
  low?: number;
  high?: number;
  kind: AssumptionKind;
  isProvisional: boolean;
}

export interface MethodologyAssumptionRow {
  id: string;
  categoryLabel: string;
  categoryId: StorageCategoryId | "headroom" | "units";
  label: string;
  typicalDisplay: string;
  rangeDisplay: string;
  unit: string;
  description: string;
  rationale: string;
  sourceName: string;
  sourceUrl?: string;
  sourceType: AssumptionSourceType;
  confidence: AssumptionConfidence;
  isProvisional: boolean;
}

export type TierFitStatus =
  | "too_small"
  | "tight"
  | "recommended"
  | "plenty_of_room";

export interface TierComparisonItem {
  tier: StorageTierCapacity;
  nominalGb: number;
  status: TierFitStatus;
  statusLabel: string;
  description: string;
  isRecommended: boolean;
}

export type CurrentStorageStatusKind =
  | "none"
  | "enough"
  | "tight"
  | "upgrade_recommended";

export interface CurrentStorageStatusResult {
  hasCurrentStorage: boolean;
  currentStorageGb: number;
  formattedCurrentStorage: string;
  status: CurrentStorageStatusKind;
  headline: string;
  detail: string;
  differenceGb: number;
}

export interface StorageEstimateSummary {
  estimatedContentGb: number;
  lowContentGb: number;
  highContentGb: number;
  recommendedHeadroomGb: number;
  totalPlannedCapacityGb: number;
  lowPlannedCapacityGb: number;
  highPlannedCapacityGb: number;
  hasSignificantUncertainty: boolean;
  formattedContent: string;
  formattedContentRange: string;
  formattedHeadroom: string;
  formattedTotalPlanned: string;
  formattedTotalPlannedRange: string;
}

export interface CalculationResult {
  purpose: PurposeId;
  hasSelectedCategories: boolean;
  effectiveTimeHorizonYears: number;
  categoryBreakdown: CategoryBreakdownItem[];
  totalEstimatedStorage: StorageEstimateSummary;
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
  currentStorageStatus: CurrentStorageStatusResult;
  assumptions: UsedAssumptionSummary[];
}

// Legacy preview types kept for HeroStorageCard compatibility
export interface PreviewCategoryAllocation {
  categoryId: StorageCategoryId;
  label: string;
  sampleInputSummary: string;
  sampleDetail: string;
  sampleControlLabel: string;
  sampleControlValue: string;
  sampleSecondaryLabel: string;
  sampleSecondaryValue: string;
  sampleSliderPercent: number;
  estimatedGb: number;
  sharePercent: number;
}

export interface PreviewTierStatus {
  tier: StorageTierCapacity;
  usableLabel: string;
  status: "insufficient" | "tight" | "recommended" | "spacious";
  statusLabel: string;
}

export interface CalculatorPreviewState {
  profileName: string;
  deviceType: string;
  usagePeriod: string;
  recommendedTier: StorageTierCapacity;
  totalEstimatedGb: number;
  mediaAndFilesGb: number;
  systemOverheadGb: number;
  usableRecommendedGb: number;
  freeHeadroomGb: number;
  allocations: PreviewCategoryAllocation[];
  tierComparisons: PreviewTierStatus[];
}
