import {
  APP_ASSUMPTIONS,
  DOCUMENT_ASSUMPTIONS,
  GAME_ASSUMPTIONS,
  OTHER_FILES_ASSUMPTIONS,
  PHOTO_ASSUMPTIONS,
  STORAGE_UNIT_CONVERSION,
  VIDEO_ASSUMPTIONS,
} from "./assumptions.ts";
import {
  formatStorageGb,
  formatStorageRangeGb,
  formatYearsLabel,
  sanitizeNonNegativeNumber,
} from "./format.ts";
import type {
  AppsProfileInput,
  CategoryBreakdownItem,
  DocumentsProfileInput,
  GamesProfileInput,
  OtherFilesProfileInput,
  PhotoProfileInput,
  TimeHorizonInput,
  VideoProfileInput,
} from "./types.ts";

/**
 * Exact mathematical conversion between video bitrate (Mbps) and storage rate (MB/min):
 * 1 Mbps (megabit per second) = (1 / 8) MB/s = 0.125 MB/s = 7.5 MB per minute.
 */
export const MB_PER_MINUTE_PER_MBPS = 7.5;

export function resolveEffectiveTimeHorizonYears(
  timeHorizon: TimeHorizonInput
): number {
  if (!timeHorizon) return 3;
  if (timeHorizon.preset === "custom") {
    const custom = sanitizeNonNegativeNumber(timeHorizon.customYears, 3, 25);
    return custom > 0 ? custom : 1;
  }
  const parsed = Number(timeHorizon.preset);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
}

export function resolvePhotoDurationYears(
  photoProfile: PhotoProfileInput,
  globalYears: number
): number {
  if (!photoProfile || photoProfile.durationMode === "inherit") {
    return globalYears;
  }
  if (photoProfile.durationMode === "custom") {
    const custom = sanitizeNonNegativeNumber(
      photoProfile.customDurationYears,
      globalYears,
      25
    );
    return custom > 0 ? custom : globalYears;
  }
  const parsed = Number(photoProfile.durationMode);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : globalYears;
}

export function calculatePhotosCategory(
  profile: PhotoProfileInput,
  selected: boolean,
  globalYears: number
): Omit<CategoryBreakdownItem, "shareOfContentPercent"> {
  const years = resolvePhotoDurationYears(profile, globalYears);
  const currentCount = sanitizeNonNegativeNumber(
    profile?.currentPhotoCount,
    0,
    2_000_000
  );
  const monthlyNew = sanitizeNonNegativeNumber(
    profile?.monthlyNewPhotos,
    0,
    100_000
  );

  const presetKey =
    profile?.photoType && PHOTO_ASSUMPTIONS[profile.photoType]
      ? profile.photoType
      : "typical_phone";
  const assumption = PHOTO_ASSUMPTIONS[presetKey];

  const isCustom = presetKey === "custom";
  const typicalMb = isCustom
    ? sanitizeNonNegativeNumber(
        profile?.customFileSizeMb,
        assumption.typicalMbPerPhoto,
        500
      )
    : assumption.typicalMbPerPhoto;
  const lowMb = isCustom ? typicalMb * 0.85 : assumption.lowMbPerPhoto;
  const highMb = isCustom ? typicalMb * 1.15 : assumption.highMbPerPhoto;

  const totalPhotos =
    currentCount + monthlyNew * STORAGE_UNIT_CONVERSION.MONTHS_PER_YEAR * years;

  const estimatedGb = selected
    ? (totalPhotos * typicalMb) / STORAGE_UNIT_CONVERSION.MB_PER_GB
    : 0;
  const lowGb = selected
    ? (totalPhotos * lowMb) / STORAGE_UNIT_CONVERSION.MB_PER_GB
    : 0;
  const highGb = selected
    ? (totalPhotos * highMb) / STORAGE_UNIT_CONVERSION.MB_PER_GB
    : 0;

  return {
    categoryId: "photos",
    label: "Photos",
    selected,
    estimatedGb,
    lowGb,
    highGb,
    formattedEstimate: formatStorageGb(estimatedGb),
    formattedRange:
      highGb - lowGb >= 3 ? formatStorageRangeGb(lowGb, highGb) : null,
    summaryLine: selected
      ? `${currentCount.toLocaleString("en-US")} current + ${monthlyNew.toLocaleString(
          "en-US"
        )}/mo over ${formatYearsLabel(years)} (${assumption.label})`
      : "Not included in your plan",
    assumptionUsed: {
      categoryId: "photos",
      title: `Photo estimate (${assumption.label})`,
      valueSummary: isCustom
        ? `~${typicalMb} MB per photo (custom)`
        : `~${typicalMb} MB per photo (typical range ${lowMb}–${highMb} MB)`,
      explanation: `${assumption.whatItRepresents} Calculated across ${Math.round(
        totalPhotos
      ).toLocaleString("en-US")} total photos over ${formatYearsLabel(years)}.`,
      rationale: assumption.rationale,
      sourceName: assumption.sourceName,
      sourceUrl: assumption.sourceUrl,
      sourceType: assumption.sourceType,
      confidence: assumption.confidence,
      unit: assumption.unit,
      low: lowMb,
      high: highMb,
      kind: assumption.kind,
      isProvisional: assumption.isProvisional,
    },
  };
}

export function calculateVideosCategory(
  profile: VideoProfileInput,
  selected: boolean,
  globalYears: number
): Omit<CategoryBreakdownItem, "shareOfContentPercent"> {
  const monthlyMinutes = sanitizeNonNegativeNumber(
    profile?.monthlyMinutes,
    0,
    43_200
  );
  const currentLibraryGb = sanitizeNonNegativeNumber(
    profile?.currentVideoLibraryGb,
    0,
    100_000
  );

  const qualityKey =
    profile?.quality && VIDEO_ASSUMPTIONS[profile.quality]
      ? profile.quality
      : "1080p";
  const assumption = VIDEO_ASSUMPTIONS[qualityKey];
  const fps = profile?.fps === 60 ? 60 : 30;
  const useCustomBitrate = Boolean(profile?.useCustomBitrate);

  const customMbps = sanitizeNonNegativeNumber(
    profile?.customBitrateMbps,
    25,
    1_500
  );

  const mbPerMin = useCustomBitrate
    ? customMbps * MB_PER_MINUTE_PER_MBPS
    : fps === 60
    ? assumption.mbPerMinute60Fps
    : assumption.mbPerMinute30Fps;

  const lowFactor = useCustomBitrate ? 0.9 : assumption.lowFactor;
  const highFactor = useCustomBitrate ? 1.1 : assumption.highFactor;

  const totalMinutes =
    monthlyMinutes * STORAGE_UNIT_CONVERSION.MONTHS_PER_YEAR * globalYears;
  const recordedGb =
    (totalMinutes * mbPerMin) / STORAGE_UNIT_CONVERSION.MB_PER_GB;

  const estimatedGb = selected ? currentLibraryGb + recordedGb : 0;
  const lowGb = selected ? currentLibraryGb + recordedGb * lowFactor : 0;
  const highGb = selected ? currentLibraryGb + recordedGb * highFactor : 0;

  const approxMbps = useCustomBitrate
    ? customMbps
    : fps === 60
    ? assumption.approxBitrateMbps60Fps
    : assumption.approxBitrateMbps30Fps;

  const lowMbPerMin = Math.round(mbPerMin * lowFactor);
  const highMbPerMin = Math.round(mbPerMin * highFactor);

  return {
    categoryId: "videos",
    label: "Videos",
    selected,
    estimatedGb,
    lowGb,
    highGb,
    formattedEstimate: formatStorageGb(estimatedGb),
    formattedRange:
      highGb - lowGb >= 5 ? formatStorageRangeGb(lowGb, highGb) : null,
    summaryLine: selected
      ? `${monthlyMinutes.toLocaleString("en-US")} min/mo at ${
          useCustomBitrate
            ? `${customMbps} Mbps custom bitrate`
            : `${assumption.label} (${fps} fps)`
        }${
          currentLibraryGb > 0
            ? ` + ${Math.round(currentLibraryGb)} GB existing`
            : ""
        }`
      : "Not included in your plan",
    assumptionUsed: {
      categoryId: "videos",
      title: useCustomBitrate
        ? "Video bitrate (Custom override)"
        : `Video bitrate (${assumption.label} · ${fps} fps)`,
      valueSummary: useCustomBitrate
        ? `~${Math.round(mbPerMin)} MB/min (${customMbps} Mbps custom)`
        : `~${Math.round(mbPerMin)} MB/min (~${approxMbps} Mbps, range ${lowMbPerMin}–${highMbPerMin} MB/min)`,
      explanation: useCustomBitrate
        ? `Custom bitrate of ${customMbps} Mbps (× 7.5 = ${Math.round(
            mbPerMin
          )} MB/min) applied to ${Math.round(totalMinutes).toLocaleString(
            "en-US"
          )} recorded minutes over ${formatYearsLabel(globalYears)}.`
        : `${assumption.whatItRepresents} Applied to ${Math.round(
            totalMinutes
          ).toLocaleString("en-US")} recorded minutes over ${formatYearsLabel(
            globalYears
          )}.`,
      rationale: useCustomBitrate
        ? "Uses the exact mathematical relationship Storage = Bitrate × Duration (1 Mbps = 0.125 MB/s = 7.5 MB/minute)."
        : assumption.rationale,
      sourceName: useCustomBitrate
        ? "Bitrate-to-Storage Formula (1 Mbps = 7.5 MB/min)"
        : assumption.sourceName,
      sourceUrl: useCustomBitrate ? undefined : assumption.sourceUrl,
      sourceType: useCustomBitrate
        ? "technical_standard"
        : assumption.sourceType,
      confidence: useCustomBitrate ? "high" : assumption.confidence,
      unit: "MB / min",
      low: lowMbPerMin,
      high: highMbPerMin,
      kind: useCustomBitrate ? "average" : assumption.kind,
      isProvisional: useCustomBitrate ? false : assumption.isProvisional,
    },
  };
}

export function calculateGamesCategory(
  profile: GamesProfileInput,
  selected: boolean
): Omit<CategoryBreakdownItem, "shareOfContentPercent"> {
  const gameCount = sanitizeNonNegativeNumber(profile?.gameCount, 0, 2_000);
  const presetKey =
    profile?.sizePreset && GAME_ASSUMPTIONS[profile.sizePreset]
      ? profile.sizePreset
      : "medium";
  const assumption = GAME_ASSUMPTIONS[presetKey];

  const isCustom = presetKey === "custom";
  const typicalGb = isCustom
    ? sanitizeNonNegativeNumber(
        profile?.customGameSizeGb,
        assumption.typicalGbPerGame,
        500
      )
    : assumption.typicalGbPerGame;
  const lowGbPerGame = isCustom ? typicalGb * 0.85 : assumption.lowGbPerGame;
  const highGbPerGame = isCustom ? typicalGb * 1.15 : assumption.highGbPerGame;

  const estimatedGb = selected ? gameCount * typicalGb : 0;
  const lowGb = selected ? gameCount * lowGbPerGame : 0;
  const highGb = selected ? gameCount * highGbPerGame : 0;

  return {
    categoryId: "games",
    label: "Games",
    selected,
    estimatedGb,
    lowGb,
    highGb,
    formattedEstimate: formatStorageGb(estimatedGb),
    formattedRange:
      highGb - lowGb >= 5 ? formatStorageRangeGb(lowGb, highGb) : null,
    summaryLine: selected
      ? `${gameCount.toLocaleString("en-US")} installed ${
          gameCount === 1 ? "game" : "games"
        } (${assumption.label} size profile)`
      : "Not included in your plan",
    assumptionUsed: {
      categoryId: "games",
      title: `Game size estimate (${assumption.label})`,
      valueSummary: isCustom
        ? `~${typicalGb} GB per game (custom)`
        : `~${typicalGb} GB per game (range ${lowGbPerGame}–${highGbPerGame} GB)`,
      explanation: `${assumption.whatItRepresents} Game install sizes vary significantly by genre, texture packs, and updates.`,
      rationale: assumption.rationale,
      sourceName: assumption.sourceName,
      sourceUrl: assumption.sourceUrl,
      sourceType: assumption.sourceType,
      confidence: assumption.confidence,
      unit: assumption.unit,
      low: lowGbPerGame,
      high: highGbPerGame,
      kind: assumption.kind,
      isProvisional: assumption.isProvisional,
    },
  };
}

export function calculateAppsCategory(
  profile: AppsProfileInput,
  selected: boolean
): Omit<CategoryBreakdownItem, "shareOfContentPercent"> {
  const useDefault = Boolean(profile?.useDefaultEstimate);

  if (useDefault) {
    const defAssumption = APP_ASSUMPTIONS.dont_know;
    const count = defAssumption.defaultAppCount ?? 60;
    const estimatedGb = selected
      ? (count * defAssumption.typicalMbPerApp) /
        STORAGE_UNIT_CONVERSION.MB_PER_GB
      : 0;
    const lowGb = selected
      ? (count * defAssumption.lowMbPerApp) / STORAGE_UNIT_CONVERSION.MB_PER_GB
      : 0;
    const highGb = selected
      ? (count * defAssumption.highMbPerApp) / STORAGE_UNIT_CONVERSION.MB_PER_GB
      : 0;

    return {
      categoryId: "apps",
      label: "Apps",
      selected,
      estimatedGb,
      lowGb,
      highGb,
      formattedEstimate: formatStorageGb(estimatedGb),
      formattedRange:
        highGb - lowGb >= 3 ? formatStorageRangeGb(lowGb, highGb) : null,
      summaryLine: selected
        ? `Default everyday app profile (~${count} apps + caches)`
        : "Not included in your plan",
      assumptionUsed: {
        categoryId: "apps",
        title: "App estimate (Default everyday baseline)",
        valueSummary: `~${count} apps at ~${defAssumption.typicalMbPerApp} MB each (~${Math.round(
          estimatedGb
        )} GB total, range ${Math.round(lowGb)}–${Math.round(highGb)} GB)`,
        explanation: defAssumption.whatItRepresents,
        rationale: defAssumption.rationale,
        sourceName: defAssumption.sourceName,
        sourceUrl: defAssumption.sourceUrl,
        sourceType: defAssumption.sourceType,
        confidence: defAssumption.confidence,
        unit: defAssumption.unit,
        low: lowGb,
        high: highGb,
        kind: defAssumption.kind,
        isProvisional: defAssumption.isProvisional,
      },
    };
  }

  const appCount = sanitizeNonNegativeNumber(profile?.appCount, 0, 2_000);
  const presetKey =
    profile?.sizePreset && APP_ASSUMPTIONS[profile.sizePreset]
      ? profile.sizePreset
      : "typical";
  const assumption = APP_ASSUMPTIONS[presetKey];
  const isCustom = presetKey === "custom";

  const typicalMb = isCustom
    ? sanitizeNonNegativeNumber(
        profile?.customAppSizeMb,
        assumption.typicalMbPerApp,
        25_000
      )
    : assumption.typicalMbPerApp;
  const lowMb = isCustom ? typicalMb * 0.85 : assumption.lowMbPerApp;
  const highMb = isCustom ? typicalMb * 1.15 : assumption.highMbPerApp;

  const estimatedGb = selected
    ? (appCount * typicalMb) / STORAGE_UNIT_CONVERSION.MB_PER_GB
    : 0;
  const lowGb = selected
    ? (appCount * lowMb) / STORAGE_UNIT_CONVERSION.MB_PER_GB
    : 0;
  const highGb = selected
    ? (appCount * highMb) / STORAGE_UNIT_CONVERSION.MB_PER_GB
    : 0;

  return {
    categoryId: "apps",
    label: "Apps",
    selected,
    estimatedGb,
    lowGb,
    highGb,
    formattedEstimate: formatStorageGb(estimatedGb),
    formattedRange:
      highGb - lowGb >= 3 ? formatStorageRangeGb(lowGb, highGb) : null,
    summaryLine: selected
      ? `${appCount.toLocaleString("en-US")} apps (${assumption.label})`
      : "Not included in your plan",
    assumptionUsed: {
      categoryId: "apps",
      title: `App estimate (${assumption.label})`,
      valueSummary: isCustom
        ? `~${typicalMb} MB per app (custom)`
        : `~${typicalMb} MB per app (range ${lowMb}–${highMb} MB)`,
      explanation: assumption.whatItRepresents,
      rationale: assumption.rationale,
      sourceName: assumption.sourceName,
      sourceUrl: assumption.sourceUrl,
      sourceType: assumption.sourceType,
      confidence: assumption.confidence,
      unit: assumption.unit,
      low: lowMb,
      high: highMb,
      kind: assumption.kind,
      isProvisional: assumption.isProvisional,
    },
  };
}

export function calculateDocumentsCategory(
  profile: DocumentsProfileInput,
  selected: boolean
): Omit<CategoryBreakdownItem, "shareOfContentPercent"> {
  const fileCount = sanitizeNonNegativeNumber(
    profile?.fileCount,
    0,
    5_000_000
  );
  const presetKey =
    profile?.sizePreset && DOCUMENT_ASSUMPTIONS[profile.sizePreset]
      ? profile.sizePreset
      : "mixed";
  const assumption = DOCUMENT_ASSUMPTIONS[presetKey];
  const isCustom = presetKey === "custom";

  const typicalMb = isCustom
    ? sanitizeNonNegativeNumber(
        profile?.customFileSizeMb,
        assumption.typicalMbPerFile,
        2_000
      )
    : assumption.typicalMbPerFile;
  const lowMb = isCustom ? typicalMb * 0.85 : assumption.lowMbPerFile;
  const highMb = isCustom ? typicalMb * 1.15 : assumption.highMbPerFile;

  const estimatedGb = selected
    ? (fileCount * typicalMb) / STORAGE_UNIT_CONVERSION.MB_PER_GB
    : 0;
  const lowGb = selected
    ? (fileCount * lowMb) / STORAGE_UNIT_CONVERSION.MB_PER_GB
    : 0;
  const highGb = selected
    ? (fileCount * highMb) / STORAGE_UNIT_CONVERSION.MB_PER_GB
    : 0;

  return {
    categoryId: "documents",
    label: "Documents",
    selected,
    estimatedGb,
    lowGb,
    highGb,
    formattedEstimate: formatStorageGb(estimatedGb),
    formattedRange:
      highGb - lowGb >= 3 ? formatStorageRangeGb(lowGb, highGb) : null,
    summaryLine: selected
      ? `${fileCount.toLocaleString("en-US")} files (${assumption.label})`
      : "Not included in your plan",
    assumptionUsed: {
      categoryId: "documents",
      title: `Document estimate (${assumption.label})`,
      valueSummary: isCustom
        ? `~${typicalMb} MB per file (custom)`
        : `~${typicalMb} MB per file (range ${lowMb}–${highMb} MB)`,
      explanation: assumption.whatItRepresents,
      rationale: assumption.rationale,
      sourceName: assumption.sourceName,
      sourceUrl: assumption.sourceUrl,
      sourceType: assumption.sourceType,
      confidence: assumption.confidence,
      unit: assumption.unit,
      low: lowMb,
      high: highMb,
      kind: assumption.kind,
      isProvisional: assumption.isProvisional,
    },
  };
}

export function calculateOtherCategory(
  profile: OtherFilesProfileInput,
  selected: boolean,
  globalYears: number
): Omit<CategoryBreakdownItem, "shareOfContentPercent"> {
  const presetKey =
    profile?.preset && OTHER_FILES_ASSUMPTIONS[profile.preset]
      ? profile.preset
      : "light";
  const assumption = OTHER_FILES_ASSUMPTIONS[presetKey];
  const isCustom = presetKey === "custom";

  const initialGb = isCustom
    ? sanitizeNonNegativeNumber(profile?.currentGb, 0, 100_000)
    : assumption.typicalInitialGb;
  const monthlyGb = isCustom
    ? sanitizeNonNegativeNumber(profile?.monthlyGrowthGb, 0, 10_000)
    : assumption.typicalMonthlyGb;

  const rawTotalGb =
    initialGb + monthlyGb * STORAGE_UNIT_CONVERSION.MONTHS_PER_YEAR * globalYears;

  const estimatedGb = selected ? rawTotalGb : 0;
  const lowGb = selected ? rawTotalGb * assumption.lowFactor : 0;
  const highGb = selected ? rawTotalGb * assumption.highFactor : 0;

  return {
    categoryId: "other",
    label: "Other files",
    selected,
    estimatedGb,
    lowGb,
    highGb,
    formattedEstimate: formatStorageGb(estimatedGb),
    formattedRange:
      highGb - lowGb >= 5 ? formatStorageRangeGb(lowGb, highGb) : null,
    summaryLine: selected
      ? isCustom
        ? `${Math.round(initialGb)} GB current + ${monthlyGb} GB/mo over ${formatYearsLabel(
            globalYears
          )}`
        : `${assumption.label} over ${formatYearsLabel(globalYears)}`
      : "Not included in your plan",
    assumptionUsed: {
      categoryId: "other",
      title: `Other files (${assumption.label})`,
      valueSummary: `~${Math.round(initialGb)} GB initial + ~${monthlyGb} GB/month`,
      explanation: assumption.whatItRepresents,
      rationale: assumption.rationale,
      sourceName: assumption.sourceName,
      sourceUrl: assumption.sourceUrl,
      sourceType: assumption.sourceType,
      confidence: assumption.confidence,
      unit: assumption.unit,
      low: lowGb,
      high: highGb,
      kind: assumption.kind,
      isProvisional: assumption.isProvisional,
    },
  };
}
