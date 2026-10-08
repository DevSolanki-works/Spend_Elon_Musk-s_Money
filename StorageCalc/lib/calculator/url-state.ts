import { DEFAULT_CALCULATOR_PROFILE } from "./assumptions.ts";
import { sanitizeNonNegativeNumber } from "./format.ts";
import type {
  AppSizePresetId,
  CalculatorInputProfile,
  CurrentStoragePreset,
  DocumentSizePresetId,
  GameSizePresetId,
  OtherFilesPresetId,
  PhotoTypePresetId,
  PurposeId,
  StorageCategoryId,
  TimeHorizonPreset,
  UsageHabitId,
  VideoFpsOption,
  VideoQualityPresetId,
  VolumeLevelId,
} from "./types.ts";

const VALID_PURPOSES: Set<PurposeId> = new Set([
  "phone",
  "laptop",
  "gaming",
  "photography",
  "video",
  "cloud",
  "other",
]);

const VALID_HABITS: Set<UsageHabitId> = new Set([
  "light",
  "everyday",
  "heavy",
  "creator",
]);

const VALID_VOLUMES: Set<VolumeLevelId> = new Set([
  "low",
  "medium",
  "high",
  "very_high",
]);

const VALID_CATEGORIES: Set<StorageCategoryId> = new Set([
  "photos",
  "videos",
  "games",
  "apps",
  "documents",
  "other",
]);

const VALID_PHOTO_TYPES: Set<PhotoTypePresetId> = new Set([
  "typical_phone",
  "high_res_phone",
  "dslr_jpeg",
  "raw",
  "custom",
]);

const VALID_VIDEO_QUALITIES: Set<VideoQualityPresetId> = new Set([
  "720p",
  "1080p",
  "4k",
  "8k",
]);

const VALID_GAME_SIZES: Set<GameSizePresetId> = new Set([
  "small",
  "medium",
  "large",
  "very_large",
  "custom",
]);

const VALID_APP_SIZES: Set<Exclude<AppSizePresetId, "dont_know">> = new Set([
  "small",
  "typical",
  "large",
  "custom",
]);

const VALID_DOC_SIZES: Set<DocumentSizePresetId> = new Set([
  "mostly_small",
  "mixed",
  "large",
  "custom",
]);

const VALID_OTHER_PRESETS: Set<OtherFilesPresetId> = new Set([
  "light",
  "moderate",
  "heavy",
  "custom",
]);

const VALID_HORIZONS: Set<TimeHorizonPreset> = new Set([
  "1",
  "2",
  "3",
  "5",
  "custom",
]);

const VALID_CURRENT_STORAGE: Set<CurrentStoragePreset> = new Set([
  "none",
  "64",
  "128",
  "256",
  "512",
  "1000",
  "2000",
  "4000",
  "custom",
]);

/**
 * Serializes a CalculatorInputProfile into compact URL query parameters.
 */
export function serializeProfileToSearchParams(
  profile: CalculatorInputProfile,
  stepId?: string
): URLSearchParams {
  const params = new URLSearchParams();

  if (profile.purpose && VALID_PURPOSES.has(profile.purpose)) {
    params.set("p", profile.purpose);
  }
  if (profile.habit && VALID_HABITS.has(profile.habit)) {
    params.set("hb", profile.habit);
  }
  if (profile.volume && VALID_VOLUMES.has(profile.volume)) {
    params.set("vl", profile.volume);
  }

  params.set("cats", profile.selectedCategories.join(","));
  if (stepId) {
    params.set("step", stepId);
  }

  // Time horizon & current storage
  params.set("th", profile.timeHorizon.preset);
  if (profile.timeHorizon.preset === "custom") {
    params.set("thy", String(profile.timeHorizon.customYears));
  }

  params.set("cs", profile.currentStorage.preset);
  if (profile.currentStorage.preset === "custom") {
    params.set("csg", String(profile.currentStorage.customGb));
  }

  // Photos
  if (profile.selectedCategories.includes("photos")) {
    params.set("pc", String(profile.photoProfile.currentPhotoCount));
    params.set("pm", String(profile.photoProfile.monthlyNewPhotos));
    params.set("pt", profile.photoProfile.photoType);
    if (profile.photoProfile.photoType === "custom") {
      params.set("psz", String(profile.photoProfile.customFileSizeMb));
    }
    if (profile.photoProfile.durationMode !== "inherit") {
      params.set("pd", profile.photoProfile.durationMode);
      if (profile.photoProfile.durationMode === "custom") {
        params.set("pdy", String(profile.photoProfile.customDurationYears));
      }
    }
  }

  // Videos
  if (profile.selectedCategories.includes("videos")) {
    params.set("vm", String(profile.videoProfile.monthlyMinutes));
    params.set("ve", String(profile.videoProfile.currentVideoLibraryGb));
    params.set("vq", profile.videoProfile.quality);
    params.set("vf", String(profile.videoProfile.fps));
    if (profile.videoProfile.useCustomBitrate) {
      params.set("vcb", "1");
      params.set("vbr", String(profile.videoProfile.customBitrateMbps));
    }
  }

  // Games
  if (profile.selectedCategories.includes("games")) {
    params.set("gc", String(profile.gamesProfile.gameCount));
    params.set("gs", profile.gamesProfile.sizePreset);
    if (profile.gamesProfile.sizePreset === "custom") {
      params.set("gsz", String(profile.gamesProfile.customGameSizeGb));
    }
  }

  // Apps
  if (profile.selectedCategories.includes("apps")) {
    params.set("ad", profile.appsProfile.useDefaultEstimate ? "1" : "0");
    if (!profile.appsProfile.useDefaultEstimate) {
      params.set("ac", String(profile.appsProfile.appCount));
      params.set("as", profile.appsProfile.sizePreset);
      if (profile.appsProfile.sizePreset === "custom") {
        params.set("asz", String(profile.appsProfile.customAppSizeMb));
      }
    }
  }

  // Documents
  if (profile.selectedCategories.includes("documents")) {
    params.set("dc", String(profile.documentsProfile.fileCount));
    params.set("ds", profile.documentsProfile.sizePreset);
    if (profile.documentsProfile.sizePreset === "custom") {
      params.set("dsz", String(profile.documentsProfile.customFileSizeMb));
    }
  }

  // Other files
  if (profile.selectedCategories.includes("other")) {
    params.set("op", profile.otherProfile.preset);
    if (profile.otherProfile.preset === "custom") {
      params.set("oc", String(profile.otherProfile.currentGb));
      params.set("om", String(profile.otherProfile.monthlyGrowthGb));
    }
  }

  return params;
}

/**
 * Deserializes URLSearchParams into a validated CalculatorInputProfile.
 */
export function parseProfileFromSearchParams(
  params: URLSearchParams
): { profile: CalculatorInputProfile; stepId: string | null } | null {
  if (!params.has("cats") && !params.has("step") && !params.has("p")) {
    return null;
  }

  const base = structuredClone(DEFAULT_CALCULATOR_PROFILE);

  const rawPurpose = (params.get("p") ?? params.get("purpose")) as PurposeId | null;
  if (rawPurpose && VALID_PURPOSES.has(rawPurpose)) {
    base.purpose = rawPurpose;
  }

  const rawHabit = params.get("hb") as UsageHabitId | null;
  if (rawHabit && VALID_HABITS.has(rawHabit)) {
    base.habit = rawHabit;
  }

  const rawVol = params.get("vl") as VolumeLevelId | null;
  if (rawVol && VALID_VOLUMES.has(rawVol)) {
    base.volume = rawVol;
  }

  if (params.has("cats")) {
    const rawCats = params.get("cats") ?? "";
    const parsedCats = rawCats
      .split(",")
      .map((s) => s.trim() as StorageCategoryId)
      .filter((s) => VALID_CATEGORIES.has(s));
    base.selectedCategories = Array.from(new Set(parsedCats));
  }

  const th = params.get("th") as TimeHorizonPreset | null;
  if (th && VALID_HORIZONS.has(th)) {
    base.timeHorizon.preset = th;
  }
  if (params.has("thy")) {
    base.timeHorizon.customYears = sanitizeNonNegativeNumber(
      params.get("thy"),
      3,
      25
    );
  }

  const cs = params.get("cs") as CurrentStoragePreset | null;
  if (cs && VALID_CURRENT_STORAGE.has(cs)) {
    base.currentStorage.preset = cs;
    if (cs !== "none" && cs !== "custom") {
      base.currentStorage.customGb = Number(cs);
    }
  }
  if (params.has("csg")) {
    base.currentStorage.customGb = sanitizeNonNegativeNumber(
      params.get("csg"),
      256,
      100_000
    );
  }

  // Photos
  if (params.has("pc")) {
    base.photoProfile.currentPhotoCount = sanitizeNonNegativeNumber(
      params.get("pc"),
      base.photoProfile.currentPhotoCount,
      50_000_000
    );
  }
  if (params.has("pm")) {
    base.photoProfile.monthlyNewPhotos = sanitizeNonNegativeNumber(
      params.get("pm"),
      base.photoProfile.monthlyNewPhotos,
      5_000_000
    );
  }
  const pt = params.get("pt") as PhotoTypePresetId | null;
  if (pt && VALID_PHOTO_TYPES.has(pt)) {
    base.photoProfile.photoType = pt;
  }
  if (params.has("psz")) {
    base.photoProfile.customFileSizeMb = sanitizeNonNegativeNumber(
      params.get("psz"),
      5,
      5_000
    );
  }
  const pd = params.get("pd");
  if (
    pd === "inherit" ||
    pd === "1" ||
    pd === "2" ||
    pd === "3" ||
    pd === "5" ||
    pd === "custom"
  ) {
    base.photoProfile.durationMode = pd;
  }
  if (params.has("pdy")) {
    base.photoProfile.customDurationYears = sanitizeNonNegativeNumber(
      params.get("pdy"),
      3,
      50
    );
  }

  // Videos
  if (params.has("vm")) {
    base.videoProfile.monthlyMinutes = sanitizeNonNegativeNumber(
      params.get("vm"),
      base.videoProfile.monthlyMinutes,
      50_000
    );
  }
  if (params.has("ve")) {
    base.videoProfile.currentVideoLibraryGb = sanitizeNonNegativeNumber(
      params.get("ve"),
      base.videoProfile.currentVideoLibraryGb,
      1_000_000
    );
  }
  const vq = params.get("vq") as VideoQualityPresetId | null;
  if (vq && VALID_VIDEO_QUALITIES.has(vq)) {
    base.videoProfile.quality = vq;
  }
  const vf = Number(params.get("vf")) as VideoFpsOption;
  if (vf === 30 || vf === 60) {
    base.videoProfile.fps = vf;
  }
  if (params.get("vcb") === "1") {
    base.videoProfile.useCustomBitrate = true;
  }
  if (params.has("vbr")) {
    base.videoProfile.customBitrateMbps = sanitizeNonNegativeNumber(
      params.get("vbr"),
      30,
      2_000
    );
  }

  // Games
  if (params.has("gc")) {
    base.gamesProfile.gameCount = sanitizeNonNegativeNumber(
      params.get("gc"),
      base.gamesProfile.gameCount,
      100_000
    );
  }
  const gs = params.get("gs") as GameSizePresetId | null;
  if (gs && VALID_GAME_SIZES.has(gs)) {
    base.gamesProfile.sizePreset = gs;
  }
  if (params.has("gsz")) {
    base.gamesProfile.customGameSizeGb = sanitizeNonNegativeNumber(
      params.get("gsz"),
      35,
      2_000
    );
  }

  // Apps
  if (params.has("ad")) {
    base.appsProfile.useDefaultEstimate = params.get("ad") !== "0";
  }
  if (params.has("ac")) {
    base.appsProfile.appCount = sanitizeNonNegativeNumber(
      params.get("ac"),
      base.appsProfile.appCount,
      50_000
    );
  }
  const asPreset = params.get("as") as Exclude<AppSizePresetId, "dont_know"> | null;
  if (asPreset && VALID_APP_SIZES.has(asPreset)) {
    base.appsProfile.sizePreset = asPreset;
  }
  if (params.has("asz")) {
    base.appsProfile.customAppSizeMb = sanitizeNonNegativeNumber(
      params.get("asz"),
      450,
      100_000
    );
  }

  // Documents
  if (params.has("dc")) {
    base.documentsProfile.fileCount = sanitizeNonNegativeNumber(
      params.get("dc"),
      base.documentsProfile.fileCount,
      50_000_000
    );
  }
  const ds = params.get("ds") as DocumentSizePresetId | null;
  if (ds && VALID_DOC_SIZES.has(ds)) {
    base.documentsProfile.sizePreset = ds;
  }
  if (params.has("dsz")) {
    base.documentsProfile.customFileSizeMb = sanitizeNonNegativeNumber(
      params.get("dsz"),
      3.5,
      50_000
    );
  }

  // Other
  const op = params.get("op") as OtherFilesPresetId | null;
  if (op && VALID_OTHER_PRESETS.has(op)) {
    base.otherProfile.preset = op;
  }
  if (params.has("oc")) {
    base.otherProfile.currentGb = sanitizeNonNegativeNumber(
      params.get("oc"),
      15,
      1_000_000
    );
  }
  if (params.has("om")) {
    base.otherProfile.monthlyGrowthGb = sanitizeNonNegativeNumber(
      params.get("om"),
      0.4,
      100_000
    );
  }

  return {
    profile: base,
    stepId: params.get("step"),
  };
}
