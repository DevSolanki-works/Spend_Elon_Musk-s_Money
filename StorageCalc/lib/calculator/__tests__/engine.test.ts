import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateStorageReality } from "../engine.ts";
import {
  ALL_METHODOLOGY_ASSUMPTIONS,
  buildProfileFromSimpleChoices,
  DEFAULT_CALCULATOR_PROFILE,
  HEADROOM_ASSUMPTIONS,
  PHOTO_ASSUMPTIONS,
  STORAGE_UNIT_CONVERSION,
  VIDEO_ASSUMPTIONS,
} from "../assumptions.ts";
import type {
  TimeHorizonPreset,
  UsageHabitId,
  VolumeLevelId,
} from "../types.ts";
import { MB_PER_MINUTE_PER_MBPS } from "../calculations.ts";
import { formatStorageGb, formatStorageRangeGb } from "../format.ts";
import {
  parseProfileFromSearchParams,
  serializeProfileToSearchParams,
} from "../url-state.ts";

describe("Storage Reality Calculation Engine & Methodology Audit", () => {
  it("1. handles no categories selected safely", () => {
    const result = calculateStorageReality({
      selectedCategories: [],
    });

    assert.equal(result.hasSelectedCategories, false);
    assert.equal(result.totalEstimatedStorage.estimatedContentGb, 0);
    assert.equal(result.totalEstimatedStorage.recommendedHeadroomGb, 0);
    assert.equal(result.totalEstimatedStorage.totalPlannedCapacityGb, 0);
    assert.equal(result.recommendedStorage.tier, "128 GB");
    assert.ok(
      result.categoryBreakdown.every(
        (cat) => !cat.selected && cat.estimatedGb === 0
      )
    );
  });

  it("2. calculates Photos only accurately including current + monthly over horizon and low/high range", () => {
    // 2,000 current + 100/month over 3 years (36 months) = 5,600 photos
    // Using typical_phone (3.5 MB/photo, range 2.2-5.0 MB) => 19.6 GB (range 12.32-28.0 GB)
    const result = calculateStorageReality({
      selectedCategories: ["photos"],
      timeHorizon: { preset: "3", customYears: 3 },
      photoProfile: {
        currentPhotoCount: 2000,
        monthlyNewPhotos: 100,
        photoType: "typical_phone",
        customFileSizeMb: 5,
        durationMode: "inherit",
        customDurationYears: 3,
      },
    });

    const totalPhotos = 2000 + 100 * 12 * 3;
    const expectedGb =
      (totalPhotos * PHOTO_ASSUMPTIONS.typical_phone.typicalMbPerPhoto) /
      STORAGE_UNIT_CONVERSION.MB_PER_GB;
    const expectedLowGb =
      (totalPhotos * PHOTO_ASSUMPTIONS.typical_phone.lowMbPerPhoto) /
      STORAGE_UNIT_CONVERSION.MB_PER_GB;
    const expectedHighGb =
      (totalPhotos * PHOTO_ASSUMPTIONS.typical_phone.highMbPerPhoto) /
      STORAGE_UNIT_CONVERSION.MB_PER_GB;

    const photoItem = result.categoryBreakdown.find(
      (c) => c.categoryId === "photos"
    );
    assert.ok(photoItem);
    assert.equal(photoItem.selected, true);
    assert.equal(photoItem.estimatedGb, expectedGb);
    assert.equal(photoItem.lowGb, expectedLowGb);
    assert.equal(photoItem.highGb, expectedHighGb);
    assert.equal(result.totalEstimatedStorage.estimatedContentGb, expectedGb);
    assert.equal(result.totalEstimatedStorage.lowContentGb, expectedLowGb);
    assert.equal(result.totalEstimatedStorage.highContentGb, expectedHighGb);
    assert.equal(photoItem.shareOfContentPercent, 100);
  });

  it("3. verifies exact video bitrate conversion (1 Mbps = 7.5 MB/min) and preset video calculations", () => {
    // Verify mathematical identity: 1 Mbps = (1 / 8) MB/s * 60 s/min = 7.5 MB/min
    assert.equal(MB_PER_MINUTE_PER_MBPS, 7.5);
    assert.equal((1 / 8) * 60, MB_PER_MINUTE_PER_MBPS);

    // Verify 1080p 30fps (12 Mbps = 90 MB/min) and 60fps (18 Mbps = 135 MB/min)
    assert.equal(
      VIDEO_ASSUMPTIONS["1080p"].approxBitrateMbps30Fps *
        MB_PER_MINUTE_PER_MBPS,
      VIDEO_ASSUMPTIONS["1080p"].mbPerMinute30Fps
    );
    assert.equal(
      VIDEO_ASSUMPTIONS["1080p"].approxBitrateMbps60Fps *
        MB_PER_MINUTE_PER_MBPS,
      VIDEO_ASSUMPTIONS["1080p"].mbPerMinute60Fps
    );

    // 30 mins/month over 2 years = 720 mins at 4k 60fps
    const resultPreset = calculateStorageReality({
      selectedCategories: ["videos"],
      timeHorizon: { preset: "2", customYears: 2 },
      videoProfile: {
        monthlyMinutes: 30,
        currentVideoLibraryGb: 10,
        quality: "4k",
        fps: 60,
        useCustomBitrate: false,
        customBitrateMbps: 40,
      },
    });

    const expectedPresetGb =
      10 + (30 * 24 * VIDEO_ASSUMPTIONS["4k"].mbPerMinute60Fps) / 1000;
    assert.equal(
      resultPreset.totalEstimatedStorage.estimatedContentGb,
      expectedPresetGb
    );

    // Custom bitrate: 40 Mbps = 300 MB/min. Over 12 months * 10 min/mo = 120 mins => 36 GB
    const resultCustom = calculateStorageReality({
      selectedCategories: ["videos"],
      timeHorizon: { preset: "1", customYears: 1 },
      videoProfile: {
        monthlyMinutes: 10,
        currentVideoLibraryGb: 0,
        quality: "1080p",
        fps: 30,
        useCustomBitrate: true,
        customBitrateMbps: 40,
      },
    });

    assert.equal(resultCustom.totalEstimatedStorage.estimatedContentGb, 36);
  });

  it("4. calculates Mixed categories, sums shares, and computes uncertainty range bounds", () => {
    const result = calculateStorageReality({
      selectedCategories: [
        "photos",
        "videos",
        "games",
        "apps",
        "documents",
        "other",
      ],
      timeHorizon: { preset: "3", customYears: 3 },
      photoProfile: {
        currentPhotoCount: 4000,
        monthlyNewPhotos: 200,
        photoType: "high_res_phone",
        customFileSizeMb: 8,
        durationMode: "inherit",
        customDurationYears: 3,
      },
      videoProfile: {
        monthlyMinutes: 20,
        currentVideoLibraryGb: 20,
        quality: "4k",
        fps: 30,
        useCustomBitrate: false,
        customBitrateMbps: 30,
      },
      gamesProfile: {
        gameCount: 3,
        sizePreset: "large",
        customGameSizeGb: 55,
      },
      appsProfile: {
        useDefaultEstimate: true,
        appCount: 60,
        sizePreset: "typical",
        customAppSizeMb: 450,
      },
      documentsProfile: {
        fileCount: 2000,
        sizePreset: "mixed",
        customFileSizeMb: 3.5,
      },
      otherProfile: {
        preset: "light",
        currentGb: 15,
        monthlyGrowthGb: 0.4,
      },
    });

    const activeItems = result.categoryBreakdown.filter((c) => c.selected);
    assert.equal(activeItems.length, 6);
    assert.ok(activeItems.every((c) => c.estimatedGb > 0));
    assert.ok(
      activeItems.every((c) => c.lowGb <= c.estimatedGb && c.highGb >= c.estimatedGb)
    );

    const sumOfCategories = activeItems.reduce(
      (acc, item) => acc + item.estimatedGb,
      0
    );
    const sumOfLow = activeItems.reduce((acc, item) => acc + item.lowGb, 0);
    const sumOfHigh = activeItems.reduce((acc, item) => acc + item.highGb, 0);

    assert.equal(
      Math.round(result.totalEstimatedStorage.estimatedContentGb * 100),
      Math.round(sumOfCategories * 100)
    );
    assert.equal(
      Math.round(result.totalEstimatedStorage.lowContentGb * 100),
      Math.round(sumOfLow * 100)
    );
    assert.equal(
      Math.round(result.totalEstimatedStorage.highContentGb * 100),
      Math.round(sumOfHigh * 100)
    );
    assert.equal(result.totalEstimatedStorage.hasSignificantUncertainty, true);
  });

  it("5. scales time-dependent categories across different time horizons", () => {
    const profile1Year = calculateStorageReality({
      selectedCategories: ["photos", "videos"],
      timeHorizon: { preset: "1", customYears: 1 },
      photoProfile: {
        currentPhotoCount: 0,
        monthlyNewPhotos: 200,
        photoType: "typical_phone",
        customFileSizeMb: 3.5,
        durationMode: "inherit",
        customDurationYears: 1,
      },
      videoProfile: {
        monthlyMinutes: 30,
        currentVideoLibraryGb: 0,
        quality: "1080p",
        fps: 30,
        useCustomBitrate: false,
        customBitrateMbps: 20,
      },
    });

    const profile5Years = calculateStorageReality({
      selectedCategories: ["photos", "videos"],
      timeHorizon: { preset: "5", customYears: 5 },
      photoProfile: {
        currentPhotoCount: 0,
        monthlyNewPhotos: 200,
        photoType: "typical_phone",
        customFileSizeMb: 3.5,
        durationMode: "inherit",
        customDurationYears: 5,
      },
      videoProfile: {
        monthlyMinutes: 30,
        currentVideoLibraryGb: 0,
        quality: "1080p",
        fps: 30,
        useCustomBitrate: false,
        customBitrateMbps: 20,
      },
    });

    assert.equal(
      Math.round(profile5Years.totalEstimatedStorage.estimatedContentGb * 100),
      Math.round(
        profile1Year.totalEstimatedStorage.estimatedContentGb * 5 * 100
      )
    );
  });

  it("6. maps usage across different storage tiers (128 GB to 4 TB)", () => {
    // Small usage -> 128 GB
    const smallRes = calculateStorageReality({
      selectedCategories: ["documents"],
      documentsProfile: {
        fileCount: 500,
        sizePreset: "mostly_small",
        customFileSizeMb: 1,
      },
    });
    assert.equal(smallRes.recommendedStorage.tier, "128 GB");

    // ~150 GB content + 30 GB headroom = 180 GB -> 256 GB
    const medRes = calculateStorageReality({
      selectedCategories: ["games"],
      gamesProfile: {
        gameCount: 3,
        sizePreset: "custom",
        customGameSizeGb: 50,
      },
    });
    assert.equal(medRes.recommendedStorage.tier, "256 GB");

    // ~330 GB content + 66 GB headroom = 396 GB -> 512 GB
    const largeRes = calculateStorageReality({
      selectedCategories: ["games"],
      gamesProfile: {
        gameCount: 6,
        sizePreset: "large",
        customGameSizeGb: 55,
      },
    });
    assert.equal(largeRes.recommendedStorage.tier, "512 GB");

    // ~600 GB content + 120 GB headroom = 720 GB -> 1 TB
    const tbRes = calculateStorageReality({
      selectedCategories: ["games"],
      gamesProfile: {
        gameCount: 6,
        sizePreset: "very_large",
        customGameSizeGb: 100,
      },
    });
    assert.equal(tbRes.recommendedStorage.tier, "1 TB");
  });

  it("7. evaluates current storage below requirement (upgrade_recommended & tight)", () => {
    // 300 GB content + 60 GB headroom = 360 GB planned
    // Current storage 128 GB (< 300 GB content) -> upgrade_recommended
    const belowContent = calculateStorageReality({
      selectedCategories: ["games"],
      gamesProfile: {
        gameCount: 3,
        sizePreset: "very_large",
        customGameSizeGb: 100,
      },
      currentStorage: {
        preset: "128",
        customGb: 128,
      },
    });
    assert.equal(
      belowContent.currentStorageStatus.status,
      "upgrade_recommended"
    );

    // Current storage 220 GB with 200 GB content (240 GB planned) -> tight
    const tightStorage = calculateStorageReality({
      selectedCategories: ["games"],
      gamesProfile: {
        gameCount: 2,
        sizePreset: "very_large",
        customGameSizeGb: 100,
      },
      currentStorage: {
        preset: "custom",
        customGb: 220,
      },
    });
    assert.equal(tightStorage.currentStorageStatus.status, "tight");
  });

  it("8. evaluates current storage above requirement (enough)", () => {
    const enoughStorage = calculateStorageReality({
      selectedCategories: ["games"],
      gamesProfile: {
        gameCount: 2,
        sizePreset: "large",
        customGameSizeGb: 55,
      },
      currentStorage: {
        preset: "512",
        customGb: 512,
      },
    });

    assert.equal(enoughStorage.currentStorageStatus.status, "enough");
    assert.ok(enoughStorage.currentStorageStatus.differenceGb > 0);
  });

  it("9. handles very large values and negative/NaN edge cases without breaking", () => {
    const huge = calculateStorageReality({
      selectedCategories: ["videos", "games"],
      timeHorizon: { preset: "custom", customYears: 10 },
      videoProfile: {
        monthlyMinutes: 1000,
        currentVideoLibraryGb: 5000,
        quality: "8k",
        fps: 60,
        useCustomBitrate: false,
        customBitrateMbps: 100,
      },
      gamesProfile: {
        gameCount: 50,
        sizePreset: "very_large",
        customGameSizeGb: 100,
      },
    });

    assert.ok(Number.isFinite(huge.totalEstimatedStorage.totalPlannedCapacityGb));
    assert.equal(huge.recommendedStorage.exceedsStandardTiers, true);
    assert.equal(huge.recommendedStorage.tier, "8 TB+");

    // Malformed / negative / NaN values
    const malformed = calculateStorageReality({
      selectedCategories: ["photos", "games"],
      photoProfile: {
        currentPhotoCount: -500,
        monthlyNewPhotos: Number.NaN,
        photoType: "typical_phone",
        customFileSizeMb: -10,
        durationMode: "inherit",
        customDurationYears: -3,
      },
      gamesProfile: {
        gameCount: Number.POSITIVE_INFINITY,
        sizePreset: "medium",
        customGameSizeGb: -20,
      },
    });

    assert.ok(
      Number.isFinite(malformed.totalEstimatedStorage.estimatedContentGb)
    );
    assert.ok(malformed.totalEstimatedStorage.estimatedContentGb >= 0);
  });

  it("10. handles zero values when categories are selected", () => {
    const zeroResult = calculateStorageReality({
      selectedCategories: ["photos", "videos", "games"],
      photoProfile: {
        currentPhotoCount: 0,
        monthlyNewPhotos: 0,
        photoType: "typical_phone",
        customFileSizeMb: 0,
        durationMode: "inherit",
        customDurationYears: 3,
      },
      videoProfile: {
        monthlyMinutes: 0,
        currentVideoLibraryGb: 0,
        quality: "1080p",
        fps: 30,
        useCustomBitrate: false,
        customBitrateMbps: 0,
      },
      gamesProfile: {
        gameCount: 0,
        sizePreset: "medium",
        customGameSizeGb: 0,
      },
    });

    assert.equal(zeroResult.totalEstimatedStorage.estimatedContentGb, 0);
    assert.equal(
      zeroResult.totalEstimatedStorage.recommendedHeadroomGb,
      HEADROOM_ASSUMPTIONS.minimumHeadroomGb
    );
    assert.equal(zeroResult.recommendedStorage.tier, "128 GB");
  });

  it("11. enforces practical 20% headroom calculation (content + headroom = planned capacity)", () => {
    // 200 GB content => 20% headroom = 40 GB => 240 GB total planned
    const res = calculateStorageReality({
      selectedCategories: ["games"],
      gamesProfile: {
        gameCount: 2,
        sizePreset: "very_large",
        customGameSizeGb: 100,
      },
    });

    assert.equal(res.totalEstimatedStorage.estimatedContentGb, 200);
    assert.equal(res.totalEstimatedStorage.recommendedHeadroomGb, 40);
    assert.equal(res.totalEstimatedStorage.totalPlannedCapacityGb, 240);
  });

  it("12. recommends the next tier up when content fits a tier but headroom overflows it", () => {
    // 230 GB content fits inside 256 GB mathematically,
    // but + 20% headroom (46 GB) = 276 GB planned capacity -> must recommend 512 GB
    // and mark 256 GB as "Tight" and 128 GB as "Too small"!
    const res = calculateStorageReality({
      selectedCategories: ["games"],
      gamesProfile: {
        gameCount: 1,
        sizePreset: "custom",
        customGameSizeGb: 230,
      },
    });

    assert.equal(res.recommendedStorage.tier, "512 GB");

    const tier128 = res.tierComparisons.find((t) => t.tier === "128 GB");
    const tier256 = res.tierComparisons.find((t) => t.tier === "256 GB");
    const tier512 = res.tierComparisons.find((t) => t.tier === "512 GB");
    const tier1tb = res.tierComparisons.find((t) => t.tier === "1 TB");

    assert.equal(tier128?.status, "too_small");
    assert.equal(tier256?.status, "tight");
    assert.equal(tier512?.status, "recommended");
    assert.equal(tier1tb?.status, "plenty_of_room");
  });

  it("13. roundtrips profile state (including purpose, habit, volume, and 4 TB current storage) through URL search params", () => {
    const customProfile = {
      ...buildProfileFromSimpleChoices("photography", "heavy", "high"),
      currentStorage: { preset: "4000" as const, customGb: 4000 },
    };
    const params = serializeProfileToSearchParams(customProfile, "results");
    const parsed = parseProfileFromSearchParams(params);

    assert.ok(parsed);
    assert.equal(parsed.stepId, "results");
    assert.equal(parsed.profile.purpose, "photography");
    assert.equal(parsed.profile.habit, "heavy");
    assert.equal(parsed.profile.volume, "high");
    assert.equal(parsed.profile.currentStorage.preset, "4000");
    assert.equal(parsed.profile.currentStorage.customGb, 4000);
    assert.deepEqual(
      parsed.profile.selectedCategories,
      customProfile.selectedCategories
    );
  });

  it("14. enforces decimal SI GB/TB unit conversions and formatting", () => {
    assert.equal(STORAGE_UNIT_CONVERSION.MB_PER_GB, 1000);
    assert.equal(STORAGE_UNIT_CONVERSION.GB_PER_TB, 1000);
    assert.ok(
      Math.abs(
        STORAGE_UNIT_CONVERSION.BINARY_GIB_TO_DECIMAL_GB_RATIO - 1.073741824
      ) < 1e-6
    );

    assert.equal(formatStorageGb(245), "~245 GB");
    assert.equal(formatStorageGb(1000), "~1 TB (1,000 GB)");
    assert.equal(formatStorageGb(1000, { compactTb: true }), "~1 TB");
    assert.equal(formatStorageGb(1550, { compactTb: true }), "~1.6 TB");
    assert.equal(formatStorageRangeGb(180, 260), "~180–260 GB");
    assert.equal(formatStorageRangeGb(1100, 1400), "~1.1–1.4 TB");
  });

  it("15. includes complete methodology metadata (rationale, source, confidence) on all assumptions", () => {
    assert.ok(ALL_METHODOLOGY_ASSUMPTIONS.length >= 20);
    for (const row of ALL_METHODOLOGY_ASSUMPTIONS) {
      assert.ok(row.id.length > 0);
      assert.ok(row.label.length > 0);
      assert.ok(row.rationale.length > 10);
      assert.ok(row.sourceName.length > 0);
      assert.ok(["high", "medium", "low"].includes(row.confidence));
    }

    const result = calculateStorageReality(DEFAULT_CALCULATOR_PROFILE);
    assert.ok(result.assumptions.length >= 5);
    for (const used of result.assumptions) {
      assert.ok(used.rationale.length > 10);
      assert.ok(used.sourceName.length > 0);
      assert.ok(["high", "medium", "low"].includes(used.confidence));
      assert.ok(used.unit.length > 0);
    }
  });

  it("16. CRITICAL: Phone recommendations NEVER exceed 1 TB across all 64 guided combinations", () => {
    const habits: UsageHabitId[] = [
      "light",
      "everyday",
      "heavy",
      "creator",
    ];
    const volumes: VolumeLevelId[] = [
      "low",
      "medium",
      "high",
      "very_high",
    ];
    const horizons: TimeHorizonPreset[] = ["1", "2", "3", "5"];
    const validPhoneTiers = new Set(["128 GB", "256 GB", "512 GB", "1 TB"]);

    for (const habit of habits) {
      for (const volume of volumes) {
        for (const preset of horizons) {
          const base = buildProfileFromSimpleChoices("phone", habit, volume);
          const profile = {
            ...base,
            timeHorizon: { preset, customYears: Number(preset) },
          };
          const result = calculateStorageReality(profile);

          assert.ok(
            validPhoneTiers.has(result.recommendedStorage.tier),
            `Phone recommendation for ${habit}/${volume}/${preset}yr was ${result.recommendedStorage.tier}, which is invalid for a phone`
          );
          assert.ok(
            result.tierComparisons.every((t) => validPhoneTiers.has(t.tier)),
            "Phone tierComparisons must only include realistic phone tiers (128 GB - 1 TB)"
          );
        }
      }
    }
  });

  it("17. validates Phone User A, B, C, and D real-world scenarios", () => {
    // Phone User A: light + low + 2 years -> 128 GB
    const userA = calculateStorageReality({
      ...buildProfileFromSimpleChoices("phone", "light", "low"),
      timeHorizon: { preset: "2", customYears: 2 },
    });
    assert.equal(userA.recommendedStorage.tier, "128 GB");

    // Phone User B: everyday + medium + 3 years -> 256 GB
    const userB = calculateStorageReality({
      ...buildProfileFromSimpleChoices("phone", "everyday", "medium"),
      timeHorizon: { preset: "3", customYears: 3 },
    });
    assert.equal(userB.recommendedStorage.tier, "256 GB");

    // Phone User C: heavy + high + 3 years -> 512 GB or 1 TB
    const userC = calculateStorageReality({
      ...buildProfileFromSimpleChoices("phone", "heavy", "high"),
      timeHorizon: { preset: "3", customYears: 3 },
    });
    assert.ok(["512 GB", "1 TB"].includes(userC.recommendedStorage.tier));

    // Phone User D: creator + very_high + 5 years -> 1 TB + exceedsPracticalDeviceCapacity + workflowGuidance
    const userD = calculateStorageReality({
      ...buildProfileFromSimpleChoices("phone", "creator", "very_high"),
      timeHorizon: { preset: "5", customYears: 5 },
    });
    assert.equal(userD.recommendedStorage.tier, "1 TB");
    assert.equal(
      userD.recommendedStorage.exceedsPracticalDeviceCapacity,
      true
    );
    assert.ok(
      userD.recommendedStorage.workflowGuidance &&
        userD.recommendedStorage.workflowGuidance.includes("1 TB")
    );
  });

  it("18. validates Laptop User A, B, C, and D real-world scenarios", () => {
    // Laptop User A: light + low + 3 years -> 256 GB
    const laptopA = calculateStorageReality({
      ...buildProfileFromSimpleChoices("laptop", "light", "low"),
      timeHorizon: { preset: "3", customYears: 3 },
    });
    assert.equal(laptopA.recommendedStorage.tier, "256 GB");

    // Laptop User B: everyday + medium + 3 years -> 512 GB
    const laptopB = calculateStorageReality({
      ...buildProfileFromSimpleChoices("laptop", "everyday", "medium"),
      timeHorizon: { preset: "3", customYears: 3 },
    });
    assert.equal(laptopB.recommendedStorage.tier, "512 GB");

    // Laptop User C: heavy + high + 3 years -> 1 TB or 2 TB
    const laptopC = calculateStorageReality({
      ...buildProfileFromSimpleChoices("laptop", "heavy", "high"),
      timeHorizon: { preset: "3", customYears: 3 },
    });
    assert.ok(["1 TB", "2 TB"].includes(laptopC.recommendedStorage.tier));

    // Laptop User D: creator + very_high + 5 years -> 4 TB
    const laptopD = calculateStorageReality({
      ...buildProfileFromSimpleChoices("laptop", "creator", "very_high"),
      timeHorizon: { preset: "5", customYears: 5 },
    });
    assert.equal(laptopD.recommendedStorage.tier, "4 TB");
  });

  it("19. validates Gamer A, B, and C real-world scenarios", () => {
    // Gamer A: casual / indie (light + low) -> 512 GB
    const gamerA = calculateStorageReality(
      buildProfileFromSimpleChoices("gaming", "light", "low")
    );
    assert.equal(gamerA.recommendedStorage.tier, "512 GB");

    // Gamer B: regular PC/console gamer (everyday + medium) -> 1 TB
    const gamerB = calculateStorageReality(
      buildProfileFromSimpleChoices("gaming", "everyday", "medium")
    );
    assert.equal(gamerB.recommendedStorage.tier, "1 TB");

    // Gamer C: heavy AAA gamer + clips (creator + very_high) -> 4 TB or 8 TB
    const gamerC = calculateStorageReality(
      buildProfileFromSimpleChoices("gaming", "creator", "very_high")
    );
    assert.ok(["4 TB", "8 TB"].includes(gamerC.recommendedStorage.tier));
  });

  it("20. validates Photographer A, B, C and Video Creator A, B, C and Cloud scenarios", () => {
    // Photographer A: casual JPEG (light + low + 2yr) -> 256 GB or 512 GB
    const photoA = calculateStorageReality({
      ...buildProfileFromSimpleChoices("photography", "light", "low"),
      timeHorizon: { preset: "2", customYears: 2 },
    });
    assert.ok(["256 GB", "512 GB"].includes(photoA.recommendedStorage.tier));

    // Photographer B: hobbyist RAW/JPEG (everyday + medium + 3yr) -> 1 TB or 2 TB
    const photoB = calculateStorageReality({
      ...buildProfileFromSimpleChoices("photography", "everyday", "medium"),
      timeHorizon: { preset: "3", customYears: 3 },
    });
    assert.ok(["1 TB", "2 TB"].includes(photoB.recommendedStorage.tier));

    // Photographer C: heavy RAW (creator + very_high + 5yr) -> 4 TB or 8 TB
    const photoC = calculateStorageReality({
      ...buildProfileFromSimpleChoices("photography", "creator", "very_high"),
      timeHorizon: { preset: "5", customYears: 5 },
    });
    assert.ok(["4 TB", "8 TB"].includes(photoC.recommendedStorage.tier));
    assert.ok(photoC.recommendedStorage.workflowGuidance);

    // Video A: casual 1080p/4K (light + low + 2yr) -> 512 GB or 1 TB
    const videoA = calculateStorageReality({
      ...buildProfileFromSimpleChoices("video", "light", "low"),
      timeHorizon: { preset: "2", customYears: 2 },
    });
    assert.ok(["512 GB", "1 TB"].includes(videoA.recommendedStorage.tier));

    // Video B: regular 4K creator (everyday + medium + 3yr) -> 1 TB or 2 TB
    const videoB = calculateStorageReality({
      ...buildProfileFromSimpleChoices("video", "everyday", "medium"),
      timeHorizon: { preset: "3", customYears: 3 },
    });
    assert.ok(["1 TB", "2 TB"].includes(videoB.recommendedStorage.tier));

    // Video C: heavy 4K60 creator (heavy + very_high + 3yr) -> 4 TB or 8 TB
    const videoC = calculateStorageReality({
      ...buildProfileFromSimpleChoices("video", "heavy", "very_high"),
      timeHorizon: { preset: "3", customYears: 3 },
    });
    assert.ok(["4 TB", "8 TB"].includes(videoC.recommendedStorage.tier));

    // Cloud storage: uses 12% buffer and recommends 128 GB - 256 GB for light plans
    const cloudLight = calculateStorageReality({
      ...buildProfileFromSimpleChoices("cloud", "light", "low"),
      timeHorizon: { preset: "3", customYears: 3 },
    });
    assert.ok(["128 GB", "256 GB"].includes(cloudLight.recommendedStorage.tier));
  });

  it("21. tapers multi-terabyte headroom above 2 TB so a 3 TB library recommends 4 TB instead of 8 TB", () => {
    // 3,000 GB content: first 2,000 GB gets 20% (400 GB), remaining 1,000 GB gets 10% (100 GB) = 500 GB headroom
    // Total planned = 3,500 GB -> fits in 4 TB!
    const res = calculateStorageReality({
      purpose: "video",
      selectedCategories: ["other"],
      timeHorizon: { preset: "1", customYears: 1 },
      otherProfile: {
        preset: "custom",
        currentGb: 3000,
        monthlyGrowthGb: 0,
      },
    });

    assert.equal(res.totalEstimatedStorage.estimatedContentGb, 3000);
    assert.equal(res.totalEstimatedStorage.recommendedHeadroomGb, 500);
    assert.equal(res.totalEstimatedStorage.totalPlannedCapacityGb, 3500);
    assert.equal(res.recommendedStorage.tier, "4 TB");
  });
});

