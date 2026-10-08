import type {
  AppSizeAssumption,
  AppSizePresetId,
  AssumptionConfidence,
  AssumptionSourceType,
  CalculatorInputProfile,
  DocumentSizeAssumption,
  DocumentSizePresetId,
  GameSizeAssumption,
  GameSizePresetId,
  MethodologyAssumptionRow,
  OtherFilesAssumption,
  OtherFilesPresetId,
  PhotoPresetAssumption,
  PhotoTypePresetId,
  PurposeId,
  StorageCategoryId,
  StorageTierDefinition,
  UsageHabitId,
  VideoQualityAssumption,
  VideoQualityPresetId,
  VolumeLevelId,
} from "./types.ts";

/**
 * CENTRALIZED ASSUMPTIONS & METHODOLOGY CONFIGURATION MODEL
 *
 * IMPORTANT:
 * - All numerical storage baselines, ranges, headroom rules, and hardware tiers
 *   live in this single file.
 * - UI components must NEVER hardcode MB/GB per file or bitrate values.
 * - Every assumption includes explicit rationale, source/basis metadata, and
 *   confidence levels so both the calculator UI and the public `/methodology`
 *   page stay 100% synchronized.
 */

export const STORAGE_UNIT_CONVERSION = {
  /**
   * 1,000 MB = 1 GB (decimal gigabyte standard used by storage manufacturers
   * so user-facing estimates align directly with 128 GB / 256 GB / 512 GB tiers).
   */
  MB_PER_GB: 1000,
  GB_PER_TB: 1000,
  MONTHS_PER_YEAR: 12,
  /**
   * Binary vs Decimal reference factor: 1 GiB (1,073,741,824 bytes) ≈ 1.07374 GB (10^9 bytes).
   * A nominal 1,000 GB (1 TB) drive reports ~931 GiB in binary operating systems.
   */
  BINARY_GIB_TO_DECIMAL_GB_RATIO: 1.073741824,
} as const;

export const PHOTO_ASSUMPTIONS: Record<PhotoTypePresetId, PhotoPresetAssumption> = {
  typical_phone: {
    id: "typical_phone",
    label: "Typical phone photos",
    value: 3.5,
    low: 2.2,
    high: 5.0,
    unit: "MB / photo",
    description:
      "Standard 12 MP–24 MP smartphone photos saved in high-efficiency formats (HEIC/HEIF or standard JPEG), including occasional Live Photos.",
    whatItRepresents:
      "Standard 12 MP–24 MP smartphone photos saved in high-efficiency formats (HEIC/JPEG), including occasional Live Photos or bursts.",
    whyItExists:
      "Most modern smartphones default to compressed HEIC or JPEG formats that balance visual quality with modest file sizes.",
    rationale:
      "Apple and Android smartphones default to HEIF/HEIC or compressed JPEG (~2–5 MB per shot for 12 MP–24 MP images). Adding occasional Live Photos (which bundle a ~3-second MOV clip) brings a realistic mixed library average to ~3.5 MB.",
    sourceName: "Apple Support — Camera Formats & ProRAW Size Comparison",
    sourceUrl: "https://support.apple.com/en-us/102652",
    sourceType: "manufacturer_docs",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "Everyday smartphone users capturing daily moments.",
    isProvisional: true,
    typicalMbPerPhoto: 3.5,
    lowMbPerPhoto: 2.2,
    highMbPerPhoto: 5.0,
  },
  high_res_phone: {
    id: "high_res_phone",
    label: "High-resolution phone photos",
    value: 8.0,
    low: 5.5,
    high: 12.0,
    unit: "MB / photo",
    description:
      "24 MP–48 MP high-resolution smartphone captures, frequent Live Photos, portrait depth maps, or lightly compressed JPEGs.",
    whatItRepresents:
      "24 MP–48 MP high-resolution smartphone captures, frequent Live Photos, portrait depth data, or lightly compressed JPEGs.",
    whyItExists:
      "Flagship phones shooting at 24 MP or 48 MP produce noticeably larger files than standard 12 MP defaults.",
    rationale:
      "High-resolution 24 MP and 48 MP HEIF/JPEG modes on modern flagship smartphones retain more fine detail and texture data, typically ranging from 5.5 MB to 12 MB depending on lighting, HDR merging, and Live Photo usage.",
    sourceName: "Apple Support — 24 MP & 48 MP Camera Capture Specifications",
    sourceUrl: "https://support.apple.com/en-us/102652",
    sourceType: "manufacturer_docs",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "Enthusiast mobile photographers using high-MP modes.",
    isProvisional: true,
    typicalMbPerPhoto: 8.0,
    lowMbPerPhoto: 5.5,
    highMbPerPhoto: 12.0,
  },
  dslr_jpeg: {
    id: "dslr_jpeg",
    label: "DSLR / mirrorless JPEG",
    value: 14.0,
    low: 9.0,
    high: 20.0,
    unit: "MB / photo",
    description:
      "Fine or Extra-Fine JPEGs captured on 24 MP–33 MP dedicated mirrorless or DSLR cameras.",
    whatItRepresents:
      "Fine/extra-fine JPEGs exported or shot directly on 24 MP–33 MP dedicated cameras.",
    whyItExists:
      "Dedicated camera sensors with low JPEG compression create larger files than typical phone defaults.",
    rationale:
      "Dedicated 24 MP–33 MP APS-C and full-frame cameras use lower JPEG compression ratios (Fine/Extra-Fine) than smartphones, producing 9–20 MB files depending on ISO noise and scene detail.",
    sourceName: "Camera Manufacturer Specifications (24 MP–33 MP Fine JPEG)",
    sourceUrl: "https://cam.start.canon/en/C003/manual/html/UG-09_Reference_0100.html",
    sourceType: "manufacturer_docs",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "Hobbyist and travel photographers shooting camera JPEGs.",
    isProvisional: true,
    typicalMbPerPhoto: 14.0,
    lowMbPerPhoto: 9.0,
    highMbPerPhoto: 20.0,
  },
  raw: {
    id: "raw",
    label: "RAW photos",
    value: 35.0,
    low: 25.0,
    high: 75.0,
    unit: "MB / photo",
    description:
      "Uncompressed or losslessly compressed RAW files (ProRAW, CR3, ARW, NEF, DNG) across 12 MP–48 MP sensors.",
    whatItRepresents:
      "Uncompressed or losslessly compressed RAW files (ProRAW, CR3, ARW, NEF, DNG) retaining full sensor data.",
    whyItExists:
      "RAW files store unprocessed sensor data for editing and consume 8x–15x more space than standard phone photos.",
    rationale:
      "Apple's official ProRAW documentation states that a 12 MP ProRAW file is ~25 MB and a 48 MP ProRAW file is ~75 MB, while 24 MP–33 MP lossless compressed mirrorless RAWs average ~30–45 MB. We use 35 MB as the typical planning baseline with a 25–75 MB range to span 12 MP–48 MP RAW workflows.",
    sourceName: "Apple Support — About Apple ProRAW (25 MB at 12 MP, 75 MB at 48 MP)",
    sourceUrl: "https://support.apple.com/en-us/102652",
    sourceType: "manufacturer_docs",
    confidence: "high",
    kind: "range",
    appliesToUserType: "Photographers and creators editing RAW/ProRAW files.",
    isProvisional: true,
    typicalMbPerPhoto: 35.0,
    lowMbPerPhoto: 25.0,
    highMbPerPhoto: 75.0,
  },
  custom: {
    id: "custom",
    label: "Custom average file size",
    value: 5.0,
    low: 4.25,
    high: 5.75,
    unit: "MB / photo",
    description:
      "User-specified average megabytes per photo with a +/-15% natural scene variance band.",
    whatItRepresents:
      "User-specified average megabytes per photo with a +/-15% natural scene variance band.",
    whyItExists:
      "Allows users who already know their camera's average output size to enter it directly.",
    rationale:
      "Applies the user's exact MB/photo input directly while modeling a +/-15% range for natural scene-to-scene compression differences.",
    sourceName: "User-Provided Input Override",
    sourceType: "planning_heuristic",
    confidence: "high",
    kind: "average",
    appliesToUserType: "Users with known file size averages.",
    isProvisional: false,
    typicalMbPerPhoto: 5.0,
    lowMbPerPhoto: 4.25,
    highMbPerPhoto: 5.75,
  },
};

export const VIDEO_ASSUMPTIONS: Record<
  VideoQualityPresetId,
  VideoQualityAssumption
> = {
  "720p": {
    id: "720p",
    label: "720p HD",
    value: 45,
    low: 36,
    high: 56,
    unit: "MB / min (30 fps)",
    description:
      "Compressed 720p HD video (~45 MB/min at 30 fps / ~6 Mbps, ~68 MB/min at 60 fps / ~9 Mbps).",
    whatItRepresents:
      "Compressed 720p HD video clips, messaging video saves, and compact screen recordings.",
    whyItExists:
      "Provides a baseline for lightweight video clips or older/compact recording profiles.",
    rationale:
      "Using Storage = Bitrate × Duration (where 1 Mbps = 7.5 MB/min), 6 Mbps at 720p30 equals 45 MB/min. This matches Apple iOS 720p HD camera documentation (~40–45 MB/min) and Google/YouTube 720p SDR encoding guidelines (5–7.5 Mbps at 30 fps, 7.5–9.5 Mbps at 60 fps).",
    sourceName: "Apple iOS Camera Settings & Google YouTube Encoding Specifications",
    sourceUrl: "https://support.google.com/youtube/answer/1722171",
    sourceType: "platform_guidelines",
    confidence: "high",
    kind: "range",
    appliesToUserType: "Users storing compressed clips or basic HD recordings.",
    isProvisional: false,
    mbPerMinute30Fps: 45,
    mbPerMinute60Fps: 68,
    approxBitrateMbps30Fps: 6,
    approxBitrateMbps60Fps: 9,
    lowFactor: 0.8,
    highFactor: 1.25,
  },
  "1080p": {
    id: "1080p",
    label: "1080p Full HD",
    value: 90,
    low: 65,
    high: 130,
    unit: "MB / min (30 fps)",
    description:
      "Standard 1080p Full HD video (~90 MB/min at 30 fps / ~12 Mbps, ~135 MB/min at 60 fps / ~18 Mbps).",
    whatItRepresents:
      "Standard 1080p Full HD video recorded using modern HEVC (H.265) or H.264 compression.",
    whyItExists:
      "1080p remains the default recording resolution on many phones, webcams, and everyday cameras.",
    rationale:
      "Apple iOS documents 1080p30 at ~65 MB/min in High Efficiency (HEVC) and ~130 MB/min in Most Compatible (H.264), while 1080p60 uses ~90–100 MB/min (HEVC) to ~175 MB/min (H.264). YouTube recommends 8–15 Mbps (60–112 MB/min) for 1080p SDR/HDR. We set 90 MB/min (12 Mbps) for 30 fps with a 65–130 MB/min range, and 135 MB/min (18 Mbps) for 60 fps.",
    sourceName: "Apple iPhone Video Recording Rates & YouTube Encoding Bitrates",
    sourceUrl: "https://support.apple.com/en-us/102270",
    sourceType: "manufacturer_docs",
    confidence: "high",
    kind: "range",
    appliesToUserType: "General users recording family, travel, or everyday clips.",
    isProvisional: false,
    mbPerMinute30Fps: 90,
    mbPerMinute60Fps: 135,
    approxBitrateMbps30Fps: 12,
    approxBitrateMbps60Fps: 18,
    lowFactor: 0.72,
    highFactor: 1.45,
  },
  "4k": {
    id: "4k",
    label: "4K Ultra HD",
    value: 240,
    low: 170,
    high: 324,
    unit: "MB / min (30 fps)",
    description:
      "4K UHD video (~240 MB/min at 30 fps / ~32 Mbps, ~400 MB/min at 60 fps / ~53.3 Mbps).",
    whatItRepresents:
      "4K UHD video recorded on modern smartphones, action cameras, or mirrorless cameras using HEVC (H.265).",
    whyItExists:
      "4K video is one of the fastest storage consumers on modern phones and creator drives.",
    rationale:
      "Apple iOS documents 4K30 HEVC at ~170–190 MB/min and 4K60 HEVC at ~400 MB/min (53.3 Mbps), while Android flagships, action cameras, and YouTube 4K SDR encoding guidelines use 35–45 Mbps (262–337 MB/min) at 30 fps and 53–68 Mbps at 60 fps. Our 240 MB/min (30 fps, range 170–324 MB/min) and 400 MB/min (60 fps) baselines align directly with both specifications.",
    sourceName: "Apple iOS 4K HEVC Rates & Google YouTube 4K Bitrate Guidelines",
    sourceUrl: "https://support.google.com/youtube/answer/1722171",
    sourceType: "manufacturer_docs",
    confidence: "high",
    kind: "range",
    appliesToUserType: "Smartphone creators, parents, travelers, and videographers.",
    isProvisional: false,
    mbPerMinute30Fps: 240,
    mbPerMinute60Fps: 400,
    approxBitrateMbps30Fps: 32,
    approxBitrateMbps60Fps: 53.3,
    lowFactor: 0.71,
    highFactor: 1.35,
  },
  "8k": {
    id: "8k",
    label: "8K Ultra High Resolution",
    value: 600,
    low: 510,
    high: 780,
    unit: "MB / min (30 fps)",
    description:
      "High-bitrate 8K video capture (~600 MB/min at 30 fps / ~80 Mbps, ~900 MB/min at 60 fps / ~120 Mbps).",
    whatItRepresents:
      "High-bitrate 8K video capture on flagship devices or cinema-oriented cameras.",
    whyItExists:
      "8K footage generates hundreds of megabytes per minute and rapidly fills sub-1TB drives.",
    rationale:
      "80 Mbps (600 MB/min) at 30 fps and 120 Mbps (900 MB/min) at 60 fps match the baseline of Google/YouTube's 8K encoding specification (80–160 Mbps at 30 fps, 120–240 Mbps at 60 fps) and Samsung Galaxy 8K HEVC capture rates (~600 MB/min).",
    sourceName: "Google YouTube 8K Encoding Specifications (80–160 Mbps)",
    sourceUrl: "https://support.google.com/youtube/answer/1722171",
    sourceType: "platform_guidelines",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "High-end video creators and 8K camera owners.",
    isProvisional: true,
    mbPerMinute30Fps: 600,
    mbPerMinute60Fps: 900,
    approxBitrateMbps30Fps: 80,
    approxBitrateMbps60Fps: 120,
    lowFactor: 0.85,
    highFactor: 1.3,
  },
};

export const GAME_ASSUMPTIONS: Record<GameSizePresetId, GameSizeAssumption> = {
  small: {
    id: "small",
    label: "Small",
    value: 3,
    low: 1.5,
    high: 6,
    unit: "GB / game",
    description:
      "Casual mobile games, 2D indie titles, retro games, or lightweight puzzle/strategy installs (~3 GB typical, 1.5–6 GB range).",
    whatItRepresents:
      "Casual mobile games, 2D indie titles, retro games, or lightweight puzzle/strategy installs (~3 GB typical, 1–6 GB range).",
    whyItExists:
      "Many mobile and indie gamers keep dozens of smaller titles that individually use only a few gigabytes.",
    rationale:
      "Casual mobile titles and 2D PC/Switch indie games typically occupy 1 GB to 6 GB after post-install asset downloads. Because there is no single universal game size, we use a wide 1.5–6 GB range.",
    sourceName: "Steam, Nintendo eShop & Mobile App Store Install Disclosures",
    sourceUrl: "https://store.steampowered.com/",
    sourceType: "planning_heuristic",
    confidence: "low",
    kind: "range",
    appliesToUserType: "Mobile gamers and 2D indie game fans.",
    isProvisional: true,
    typicalGbPerGame: 3,
    lowGbPerGame: 1.5,
    highGbPerGame: 6,
  },
  medium: {
    id: "medium",
    label: "Medium",
    value: 18,
    low: 10,
    high: 28,
    unit: "GB / game",
    description:
      "Standard 3D games, AA console/PC releases, or content-rich mobile RPGs (~18 GB typical, 10–28 GB range).",
    whatItRepresents:
      "Standard 3D games, AA console/PC releases, or content-rich mobile RPGs (~18 GB typical, 10–28 GB range).",
    whyItExists:
      "Represents a balanced middle ground for handhelds (like Steam Deck/Switch), tablets, and mixed libraries.",
    rationale:
      "Mid-sized 3D PC/console games, handheld titles, and large mobile 3D games (which download 10–25 GB of in-app resource packs) cluster between 10 GB and 28 GB.",
    sourceName: "Steam & Handheld Console Library Footprint Benchmarks",
    sourceUrl: "https://store.steampowered.com/",
    sourceType: "planning_heuristic",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "Mixed-genre gamers across handhelds, phones, or laptops.",
    isProvisional: true,
    typicalGbPerGame: 18,
    lowGbPerGame: 10,
    highGbPerGame: 28,
  },
  large: {
    id: "large",
    label: "Large",
    value: 55,
    low: 35,
    high: 75,
    unit: "GB / game",
    description:
      "Modern AAA single-player and multiplayer games with detailed 3D assets (~55 GB typical, 35–75 GB range).",
    whatItRepresents:
      "Modern AAA single-player and multiplayer games with detailed 3D assets (~55 GB typical, 35–75 GB range).",
    whyItExists:
      "Mainstream modern PC and console releases routinely require 40 GB to 75 GB per title.",
    rationale:
      "Current-generation PS5, Xbox Series X|S, and PC AAA releases commonly require 35–75 GB of SSD space due to high-resolution geometry, shaders, and multi-language audio.",
    sourceName: "PC (Steam) & Console AAA System Requirement Disclosures",
    sourceUrl: "https://store.steampowered.com/",
    sourceType: "planning_heuristic",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "PC and console gamers playing modern mainstream releases.",
    isProvisional: true,
    typicalGbPerGame: 55,
    lowGbPerGame: 35,
    highGbPerGame: 75,
  },
  very_large: {
    id: "very_large",
    label: "Very large",
    value: 100,
    low: 75,
    high: 135,
    unit: "GB / game",
    description:
      "Flagship open-world games, flight/racing sims, and live-service shooters with 4K textures (~100 GB typical, 75–135 GB range).",
    whatItRepresents:
      "Flagship open-world games, sims, and live-service shooters with 4K texture packs and seasonal updates (~100 GB typical, 75–135 GB range).",
    whyItExists:
      "Just two or three massive AAA installs can consume 250 GB+ of SSD capacity.",
    rationale:
      "Blockbuster open-world RPGs and live-service shooters with 4K texture packs and cumulative DLC expansions routinely occupy 75 GB to 135+ GB per title on PC and console SSDs.",
    sourceName: "Flagship PC/Console AAA Storage Requirements",
    sourceUrl: "https://store.steampowered.com/",
    sourceType: "planning_heuristic",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "Enthusiast PC/console gamers installing flagship AAA titles.",
    isProvisional: true,
    typicalGbPerGame: 100,
    lowGbPerGame: 75,
    highGbPerGame: 135,
  },
  custom: {
    id: "custom",
    label: "Custom",
    value: 35,
    low: 30,
    high: 40,
    unit: "GB / game",
    description:
      "User-specified average gigabytes per installed game with a +/-15% variance band.",
    whatItRepresents:
      "User-specified average gigabytes per installed game with a +/-15% variance band.",
    whyItExists:
      "Lets gamers enter a specific average install size for their library.",
    rationale:
      "Uses the user's manual GB/game figure directly with a +/-15% variance band for patches and DLC.",
    sourceName: "User-Provided Input Override",
    sourceType: "planning_heuristic",
    confidence: "high",
    kind: "average",
    appliesToUserType: "Gamers with known install footprints.",
    isProvisional: false,
    typicalGbPerGame: 35,
    lowGbPerGame: 30,
    highGbPerGame: 40,
  },
};

export const APP_ASSUMPTIONS: Record<AppSizePresetId, AppSizeAssumption> = {
  small: {
    id: "small",
    label: "Light / utility apps",
    value: 180,
    low: 110,
    high: 260,
    unit: "MB / app",
    description:
      "Banking, weather, notes, authenticators, and lightweight utilities including local cache (~180 MB per app).",
    whatItRepresents:
      "Banking, weather, notes, authenticators, and lightweight everyday utilities including modest cache (~180 MB per app).",
    whyItExists:
      "Utility-focused app libraries take far less space than media-heavy social or creative apps.",
    rationale:
      "Estimates total installed footprint (App binary + Documents & Data cache), not just initial App Store/Play Store download size. Lightweight utilities average ~110–260 MB once unpacked with local state.",
    sourceName: "iOS & Android Installed App + Documents & Data Footprint",
    sourceUrl: "https://support.apple.com/en-us/108429",
    sourceType: "planning_heuristic",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "Minimalist users with mostly utility and productivity apps.",
    isProvisional: true,
    typicalMbPerApp: 180,
    lowMbPerApp: 110,
    highMbPerApp: 260,
  },
  typical: {
    id: "typical",
    label: "Typical everyday mix",
    value: 450,
    low: 300,
    high: 650,
    unit: "MB / app",
    description:
      "Social media, messaging, navigation, shopping, and streaming apps including accumulated local cache (~450 MB per app).",
    whatItRepresents:
      "A normal mix of social media, messaging, navigation, shopping, and streaming apps including local cache (~450 MB per app).",
    whyItExists:
      "Social and messaging apps accumulate local media caches that grow well beyond their initial download size.",
    rationale:
      "While many mobile apps download as 80–200 MB packages, iOS and Android 'Documents & Data' caches in messaging, social feeds, maps, and browsers routinely push the average installed footprint across an everyday app library to 300–650 MB per app.",
    sourceName: "Apple Support — iPhone/iPad App & Cache Storage Management",
    sourceUrl: "https://support.apple.com/en-us/108429",
    sourceType: "planning_heuristic",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "Most smartphone, tablet, and everyday laptop users.",
    isProvisional: true,
    typicalMbPerApp: 450,
    lowMbPerApp: 300,
    highMbPerApp: 650,
  },
  large: {
    id: "large",
    label: "Heavy / creative & media apps",
    value: 1100,
    low: 750,
    high: 1500,
    unit: "MB / app",
    description:
      "Creative software suites, offline music/podcast caches, productivity suites, or developer tools (~1,100 MB / 1.1 GB per app).",
    whatItRepresents:
      "Creative software suites, offline music/podcast caches, productivity suites, or developer tools (~1,100 MB / 1.1 GB per app).",
    whyItExists:
      "Offline media apps and desktop/tablet creative tools store large local asset libraries and caches.",
    rationale:
      "Creative apps (brushes, lut packs, local scratch caches), offline audio/video streaming apps, and desktop productivity suites frequently average 0.75–1.5 GB per application.",
    sourceName: "Desktop & Tablet Creative/Media Application Footprint Model",
    sourceUrl: "https://support.apple.com/en-us/108429",
    sourceType: "planning_heuristic",
    confidence: "low",
    kind: "range",
    appliesToUserType: "Power users, commuters with offline media, and creators.",
    isProvisional: true,
    typicalMbPerApp: 1100,
    lowMbPerApp: 750,
    highMbPerApp: 1500,
  },
  dont_know: {
    id: "dont_know",
    label: "I don't know (Use typical default)",
    value: 27,
    low: 18,
    high: 39,
    unit: "GB total (60 apps)",
    description:
      "Default baseline assuming ~60 everyday apps at ~450 MB each (~27 GB total installed app & cache footprint, 18–39 GB range).",
    whatItRepresents:
      "Default baseline assuming ~60 everyday apps at ~450 MB each (~27 GB total app & cache footprint).",
    whyItExists:
      "Most people do not count their installed apps; this provides a sensible default without guesswork.",
    rationale:
      "Combines a typical 60-app smartphone/tablet library with the 450 MB/app installed-plus-cache baseline (~27 GB typical, 18–39 GB range) so users who skip counting apps still get a realistic allocation.",
    sourceName: "Storage Reality Default Everyday App Library Heuristic",
    sourceUrl: "https://support.apple.com/en-us/108429",
    sourceType: "planning_heuristic",
    confidence: "medium",
    kind: "preset",
    appliesToUserType: "Users who want a reasonable everyday app estimate automatically.",
    isProvisional: true,
    typicalMbPerApp: 450,
    lowMbPerApp: 300,
    highMbPerApp: 650,
    defaultAppCount: 60,
  },
  custom: {
    id: "custom",
    label: "Custom app size",
    value: 500,
    low: 425,
    high: 575,
    unit: "MB / app",
    description:
      "User-specified average megabytes per installed app (including local data/cache).",
    whatItRepresents:
      "User-specified average megabytes per installed app (including local data/cache).",
    whyItExists: "Allows manual control over average app footprint.",
    rationale:
      "Applies the user's custom MB/app value with a +/-15% cache growth band.",
    sourceName: "User-Provided Input Override",
    sourceType: "planning_heuristic",
    confidence: "high",
    kind: "average",
    appliesToUserType: "Users with specific app storage measurements.",
    isProvisional: false,
    typicalMbPerApp: 500,
    lowMbPerApp: 425,
    highMbPerApp: 575,
  },
};

export const DOCUMENT_ASSUMPTIONS: Record<
  DocumentSizePresetId,
  DocumentSizeAssumption
> = {
  mostly_small: {
    id: "mostly_small",
    label: "Mostly small documents",
    value: 0.8,
    low: 0.4,
    high: 1.5,
    unit: "MB / file",
    description:
      "Word documents, spreadsheets, receipts, notes, EPub books, and text-heavy PDFs (~0.8 MB per file).",
    whatItRepresents:
      "Word documents, spreadsheets, receipts, notes, and text-heavy PDFs (~0.8 MB per file).",
    whyItExists:
      "Text and office documents are tiny individually, even when thousands are stored locally.",
    rationale:
      "While plain text files and simple .docx files are often 50–300 KB, real-world personal document folders include PDF statements, receipts, and spreadsheets with embedded charts, bringing the collection average to ~0.4–1.5 MB per file.",
    sourceName: "Storage Reality Mixed Document Collection Model",
    sourceType: "planning_heuristic",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "Students, writers, and general office users.",
    isProvisional: true,
    typicalMbPerFile: 0.8,
    lowMbPerFile: 0.4,
    highMbPerFile: 1.5,
  },
  mixed: {
    id: "mixed",
    label: "Mixed files",
    value: 3.5,
    low: 2.0,
    high: 5.5,
    unit: "MB / file",
    description:
      "A mixed collection of PDFs, slide decks with images, scanned documents, spreadsheets, and occasional ZIP archives (~3.5 MB per file).",
    whatItRepresents:
      "A blend of PDFs, slide decks with images, scanned documents, spreadsheets, and occasional ZIP archives (~3.5 MB per file).",
    whyItExists:
      "Slide presentations and illustrated PDFs pull the average file size up compared to plain text docs.",
    rationale:
      "Models a realistic 'My Documents' or cloud-synced work folder where lightweight text documents sit alongside 10–30 MB PowerPoint/Keynote decks, multi-page scanned PDFs, and compressed archives.",
    sourceName: "Storage Reality Mixed File Collection Model",
    sourceType: "planning_heuristic",
    confidence: "medium",
    kind: "range",
    appliesToUserType: "Professionals and everyday users storing work & personal files.",
    isProvisional: true,
    typicalMbPerFile: 3.5,
    lowMbPerFile: 2.0,
    highMbPerFile: 5.5,
  },
  large: {
    id: "large",
    label: "Large files",
    value: 15.0,
    low: 9.0,
    high: 24.0,
    unit: "MB / file",
    description:
      "Media-rich presentations, high-res scans, design handouts, textbooks, datasets, and compressed project folders (~15 MB per file).",
    whatItRepresents:
      "Media-rich presentations, high-res scans, design handouts, datasets, and compressed project folders (~15 MB per file).",
    whyItExists:
      "Heavy decks, PDF books, and archived project deliverables consume significantly more space per file.",
    rationale:
      "Designed for users whose document folders are dominated by illustrated PDFs, academic textbooks, pitch decks with embedded media, and design/project exports.",
    sourceName: "Storage Reality Heavy Document & Project Collection Model",
    sourceType: "planning_heuristic",
    confidence: "low",
    kind: "range",
    appliesToUserType: "Researchers, designers, and power users with heavy document libraries.",
    isProvisional: true,
    typicalMbPerFile: 15.0,
    lowMbPerFile: 9.0,
    highMbPerFile: 24.0,
  },
  custom: {
    id: "custom",
    label: "Custom average file size",
    value: 5.0,
    low: 4.25,
    high: 5.75,
    unit: "MB / file",
    description: "User-specified average megabytes per document/file.",
    whatItRepresents: "User-specified average megabytes per document/file.",
    whyItExists: "Supports custom document library sizing.",
    rationale: "Applies the user's custom MB/file input with a +/-15% variance band.",
    sourceName: "User-Provided Input Override",
    sourceType: "planning_heuristic",
    confidence: "high",
    kind: "average",
    appliesToUserType: "Users with known average file sizes.",
    isProvisional: false,
    typicalMbPerFile: 5.0,
    lowMbPerFile: 4.25,
    highMbPerFile: 5.75,
  },
};

export const OTHER_FILES_ASSUMPTIONS: Record<
  OtherFilesPresetId,
  OtherFilesAssumption
> = {
  light: {
    id: "light",
    label: "Small extra buffer (~15 GB)",
    value: 15,
    low: 12,
    high: 19,
    unit: "GB initial (+0.4 GB/mo)",
    description:
      "Occasional downloaded movies/podcasts for travel, a few ZIP archives, or miscellaneous downloads (~15 GB initial + ~0.4 GB/month).",
    whatItRepresents:
      "Occasional downloaded movies/podcasts for travel, a few ZIP archives, or miscellaneous downloads (~15 GB initial + ~5 GB/year).",
    whyItExists:
      "Covers miscellaneous downloads that don't fit neatly into photos, videos, games, or office documents.",
    rationale:
      "Accounts for a handful of offline Netflix/YouTube downloads, podcast episodes, and browser 'Downloads' folder clutter over time.",
    sourceName: "Storage Reality Offline Media & Downloads Heuristic",
    sourceType: "planning_heuristic",
    confidence: "low",
    kind: "preset",
    appliesToUserType: "Everyday users keeping a few offline downloads.",
    isProvisional: true,
    typicalInitialGb: 15,
    typicalMonthlyGb: 0.4,
    lowFactor: 0.8,
    highFactor: 1.25,
  },
  moderate: {
    id: "moderate",
    label: "Moderate archive or offline media (~50 GB)",
    value: 50,
    low: 40,
    high: 62.5,
    unit: "GB initial (+1.0 GB/mo)",
    description:
      "Offline music/movie libraries, local device backups, or hobby project folders (~50 GB initial + ~1.0 GB/month).",
    whatItRepresents:
      "Offline music/movie libraries, local device backups, or hobby project folders (~50 GB initial + ~12 GB/year).",
    whyItExists:
      "Many users keep local music collections, offline series, or laptop folders alongside their main categories.",
    rationale:
      "Models a moderate offline music/video library or a single local mobile device backup stored on a laptop or external drive.",
    sourceName: "Storage Reality Offline Media & Archive Heuristic",
    sourceType: "planning_heuristic",
    confidence: "low",
    kind: "preset",
    appliesToUserType: "Users with offline media collections or local project archives.",
    isProvisional: true,
    typicalInitialGb: 50,
    typicalMonthlyGb: 1.0,
    lowFactor: 0.8,
    highFactor: 1.25,
  },
  heavy: {
    id: "heavy",
    label: "Large backups, VMs, or project files (~150 GB)",
    value: 150,
    low: 127.5,
    high: 187.5,
    unit: "GB initial (+2.5 GB/mo)",
    description:
      "Full device backups, virtual machines, audio production libraries, or large archive datasets (~150 GB initial + ~2.5 GB/month).",
    whatItRepresents:
      "Full device backups, virtual machines, audio production libraries, or large archive datasets (~150 GB initial + ~30 GB/year).",
    whyItExists:
      "Accounts for heavy local storage use cases such as local backups or creative asset packs.",
    rationale:
      "Designed for desktop/laptop users storing virtual machine images, sample libraries, or multi-device local backups.",
    sourceName: "Storage Reality Power-User Archive Heuristic",
    sourceType: "planning_heuristic",
    confidence: "low",
    kind: "preset",
    appliesToUserType: "Power users, developers, and creators storing heavy archives.",
    isProvisional: true,
    typicalInitialGb: 150,
    typicalMonthlyGb: 2.5,
    lowFactor: 0.85,
    highFactor: 1.25,
  },
  custom: {
    id: "custom",
    label: "Custom amount",
    value: 25,
    low: 22.5,
    high: 27.5,
    unit: "GB",
    description:
      "User-entered current gigabytes and monthly growth in gigabytes for miscellaneous files.",
    whatItRepresents:
      "User-entered current gigabytes and monthly growth in gigabytes for miscellaneous files.",
    whyItExists:
      "Lets users directly enter a known GB figure for backups, archives, or other data.",
    rationale:
      "Applies the user's custom initial GB and monthly GB growth rate directly with a +/-10% band.",
    sourceName: "User-Provided Input Override",
    sourceType: "planning_heuristic",
    confidence: "high",
    kind: "average",
    appliesToUserType: "Users with a specific GB allowance in mind.",
    isProvisional: false,
    typicalInitialGb: 25,
    typicalMonthlyGb: 0,
    lowFactor: 0.9,
    highFactor: 1.1,
  },
};

export const HEADROOM_ASSUMPTIONS = {
  id: "headroom_policy",
  label: "Practical Free-Space & System Headroom",
  value: 20,
  low: 12,
  high: 20,
  unit: "% of content (min 16 GB)",
  description:
    "Adds max(16 GB, 20% of estimated content up to 2 TB, then +10% on volume above 2 TB) for local devices, or max(8 GB, 12% of content) for cloud storage.",
  whatItRepresents:
    "A 20% capacity buffer added to estimated content (with a minimum 16 GB baseline reserve for system files, temporary caches, and updates, and tapered to +10% above 2 TB so multi-terabyte archives are not over-inflated). Cloud storage plans use a lighter 12% buffer (min 8 GB).",
  whyItExists:
    "Filling a device or drive to 100% leaves no room for operating system updates, temporary app caches, or unexpected usage spikes, and usable formatted capacity is smaller than advertised nominal capacity.",
  rationale:
    "This is a practical storage planning policy rather than a hard physical law. It accounts for three real-world factors: (1) ~7% difference between advertised decimal GB and binary OS GiB, (2) operating system footprint and temporary space needed to unpack major OS/game updates, and (3) maintaining 15–20% free working space so flash storage/SSDs avoid write-amplification slowdowns and 'Storage Almost Full' warnings. Above 2,000 GB, incremental headroom tapers to 10% because OS/system overhead does not scale linearly with multi-terabyte media archives.",
  sourceName: "Storage Reality Planning Policy & Apple Decimal vs Binary Capacity Docs",
  sourceUrl: "https://support.apple.com/en-us/102119",
  sourceType: "planning_heuristic" as AssumptionSourceType,
  confidence: "high" as AssumptionConfidence,
  kind: "policy" as const,
  appliesToUserType: "All storage plans.",
  isProvisional: false,
  /**
   * Multiplier applied to estimated content up to taperedThresholdGb (0.20 => adds 20% of content as headroom).
   */
  contentBufferRatio: 0.2,
  /**
   * Threshold in GB above which incremental headroom tapers so multi-terabyte estimates are not over-inflated.
   */
  taperedThresholdGb: 2000,
  /**
   * Marginal buffer ratio applied to content volume exceeding taperedThresholdGb.
   */
  taperedBufferRatio: 0.1,
  /**
   * Lighter buffer ratio for cloud backup plans (which do not require OS swap space or binary-vs-decimal formatting reserve).
   */
  cloudBufferRatio: 0.12,
  /**
   * Minimum headroom in GB for cloud backup plans.
   */
  cloudMinimumHeadroomGb: 8,
  /**
   * Minimum headroom in GB whenever at least one category is active or a device is planned,
   * accounting for basic system/OS footprint and update breathing room.
   */
  minimumHeadroomGb: 16,
  /**
   * Threshold ratio of (highContentGb - lowContentGb) / estimatedContentGb above which
   * the UI highlights a range alongside the single estimate.
   */
  significantUncertaintyRatio: 0.2,
} as const;

export const STORAGE_TIERS: StorageTierDefinition[] = [
  {
    id: "64gb",
    label: "64 GB",
    nominalGb: 64,
    shortDescription: "Entry-level budget devices or secondary SD cards",
    showInStandardComparison: false,
  },
  {
    id: "128gb",
    label: "128 GB",
    nominalGb: 128,
    shortDescription: "Base tier on many smartphones and light tablets",
    showInStandardComparison: true,
  },
  {
    id: "256gb",
    label: "256 GB",
    nominalGb: 256,
    shortDescription: "Balanced everyday tier for phones and entry laptops",
    showInStandardComparison: true,
  },
  {
    id: "512gb",
    label: "512 GB",
    nominalGb: 512,
    shortDescription: "Comfortable capacity for creators, gamers, and laptops",
    showInStandardComparison: true,
  },
  {
    id: "1tb",
    label: "1 TB",
    nominalGb: 1000,
    shortDescription: "High-capacity tier for 4K video, large games, and workstations",
    showInStandardComparison: true,
  },
  {
    id: "2tb",
    label: "2 TB",
    nominalGb: 2000,
    shortDescription: "Enthusiast SSD/drive capacity for large media & game libraries",
    showInStandardComparison: true,
  },
  {
    id: "4tb",
    label: "4 TB",
    nominalGb: 4000,
    shortDescription: "Dedicated creator archive, desktop SSD, or external backup drive",
    showInStandardComparison: true,
  },
  {
    id: "8tb",
    label: "8 TB",
    nominalGb: 8000,
    shortDescription: "High-volume studio archive, NAS volume, or master backup drive",
    showInStandardComparison: false,
  },
];

/**
 * Flat, structured catalog of all non-custom assumptions used by the calculator,
 * exported for the public `/methodology` page and audit tests.
 */
export const ALL_METHODOLOGY_ASSUMPTIONS: MethodologyAssumptionRow[] = [
  // Photos
  ...(["typical_phone", "high_res_phone", "dslr_jpeg", "raw"] as const).map(
    (key): MethodologyAssumptionRow => {
      const a = PHOTO_ASSUMPTIONS[key];
      return {
        id: `photo_${a.id}`,
        categoryLabel: "Photos",
        categoryId: "photos",
        label: a.label,
        typicalDisplay: `${a.typicalMbPerPhoto} MB`,
        rangeDisplay: `${a.lowMbPerPhoto}–${a.highMbPerPhoto} MB`,
        unit: a.unit,
        description: a.description,
        rationale: a.rationale,
        sourceName: a.sourceName,
        sourceUrl: a.sourceUrl,
        sourceType: a.sourceType,
        confidence: a.confidence,
        isProvisional: a.isProvisional,
      };
    }
  ),
  // Videos
  ...(["720p", "1080p", "4k", "8k"] as const).map(
    (key): MethodologyAssumptionRow => {
      const a = VIDEO_ASSUMPTIONS[key];
      const low30 = Math.round(a.mbPerMinute30Fps * a.lowFactor);
      const high30 = Math.round(a.mbPerMinute30Fps * a.highFactor);
      return {
        id: `video_${a.id}`,
        categoryLabel: "Videos",
        categoryId: "videos",
        label: `${a.label} (30 fps / 60 fps)`,
        typicalDisplay: `${a.mbPerMinute30Fps} / ${a.mbPerMinute60Fps} MB/min`,
        rangeDisplay: `${low30}–${high30} MB/min (30 fps)`,
        unit: `${a.approxBitrateMbps30Fps} / ${a.approxBitrateMbps60Fps} Mbps`,
        description: a.description,
        rationale: a.rationale,
        sourceName: a.sourceName,
        sourceUrl: a.sourceUrl,
        sourceType: a.sourceType,
        confidence: a.confidence,
        isProvisional: a.isProvisional,
      };
    }
  ),
  // Games
  ...(["small", "medium", "large", "very_large"] as const).map(
    (key): MethodologyAssumptionRow => {
      const a = GAME_ASSUMPTIONS[key];
      return {
        id: `game_${a.id}`,
        categoryLabel: "Games",
        categoryId: "games",
        label: `${a.label} games`,
        typicalDisplay: `${a.typicalGbPerGame} GB`,
        rangeDisplay: `${a.lowGbPerGame}–${a.highGbPerGame} GB`,
        unit: a.unit,
        description: a.description,
        rationale: a.rationale,
        sourceName: a.sourceName,
        sourceUrl: a.sourceUrl,
        sourceType: a.sourceType,
        confidence: a.confidence,
        isProvisional: a.isProvisional,
      };
    }
  ),
  // Apps
  ...(["small", "typical", "large", "dont_know"] as const).map(
    (key): MethodologyAssumptionRow => {
      const a = APP_ASSUMPTIONS[key];
      const isDef = key === "dont_know";
      return {
        id: `app_${a.id}`,
        categoryLabel: "Apps",
        categoryId: "apps",
        label: a.label,
        typicalDisplay: isDef
          ? `${a.value} GB (${a.defaultAppCount} apps)`
          : `${a.typicalMbPerApp} MB`,
        rangeDisplay: isDef
          ? `${a.low}–${a.high} GB`
          : `${a.lowMbPerApp}–${a.highMbPerApp} MB`,
        unit: a.unit,
        description: a.description,
        rationale: a.rationale,
        sourceName: a.sourceName,
        sourceUrl: a.sourceUrl,
        sourceType: a.sourceType,
        confidence: a.confidence,
        isProvisional: a.isProvisional,
      };
    }
  ),
  // Documents
  ...(["mostly_small", "mixed", "large"] as const).map(
    (key): MethodologyAssumptionRow => {
      const a = DOCUMENT_ASSUMPTIONS[key];
      return {
        id: `doc_${a.id}`,
        categoryLabel: "Documents",
        categoryId: "documents",
        label: a.label,
        typicalDisplay: `${a.typicalMbPerFile} MB`,
        rangeDisplay: `${a.lowMbPerFile}–${a.highMbPerFile} MB`,
        unit: a.unit,
        description: a.description,
        rationale: a.rationale,
        sourceName: a.sourceName,
        sourceUrl: a.sourceUrl,
        sourceType: a.sourceType,
        confidence: a.confidence,
        isProvisional: a.isProvisional,
      };
    }
  ),
  // Other files
  ...(["light", "moderate", "heavy"] as const).map(
    (key): MethodologyAssumptionRow => {
      const a = OTHER_FILES_ASSUMPTIONS[key];
      return {
        id: `other_${a.id}`,
        categoryLabel: "Other Files",
        categoryId: "other",
        label: a.label,
        typicalDisplay: `${a.typicalInitialGb} GB + ${a.typicalMonthlyGb} GB/mo`,
        rangeDisplay: `${Math.round(a.typicalInitialGb * a.lowFactor)}–${Math.round(
          a.typicalInitialGb * a.highFactor
        )} GB initial`,
        unit: a.unit,
        description: a.description,
        rationale: a.rationale,
        sourceName: a.sourceName,
        sourceUrl: a.sourceUrl,
        sourceType: a.sourceType,
        confidence: a.confidence,
        isProvisional: a.isProvisional,
      };
    }
  ),
  // Headroom & Units
  {
    id: HEADROOM_ASSUMPTIONS.id,
    categoryLabel: "Headroom Policy",
    categoryId: "headroom",
    label: HEADROOM_ASSUMPTIONS.label,
    typicalDisplay: "+20% of content",
    rangeDisplay: "Min 16 GB floor (tapered >2 TB)",
    unit: HEADROOM_ASSUMPTIONS.unit,
    description: HEADROOM_ASSUMPTIONS.description,
    rationale: HEADROOM_ASSUMPTIONS.rationale,
    sourceName: HEADROOM_ASSUMPTIONS.sourceName,
    sourceUrl: HEADROOM_ASSUMPTIONS.sourceUrl,
    sourceType: HEADROOM_ASSUMPTIONS.sourceType,
    confidence: HEADROOM_ASSUMPTIONS.confidence,
    isProvisional: HEADROOM_ASSUMPTIONS.isProvisional,
  },
  {
    id: "decimal_storage_units",
    categoryLabel: "Storage Units",
    categoryId: "units",
    label: "Decimal SI Capacity Standard",
    typicalDisplay: "1 GB = 1,000 MB",
    rangeDisplay: "1 TB = 1,000 GB",
    unit: "SI Base-10",
    description:
      "Hardware manufacturers advertise storage in decimal SI units (1 GB = 10^9 bytes, 1 TB = 10^12 bytes).",
    rationale:
      "All consumer SSDs, HDDs, SD cards, and smartphones are sold in decimal gigabytes/terabytes. Using 1,000 MB = 1 GB and 1,000 GB = 1 TB keeps calculator totals directly aligned with advertised 128 GB, 256 GB, 512 GB, and 1 TB hardware tiers.",
    sourceName: "NIST / IEC 60027-2 Binary vs Decimal Prefix Standard",
    sourceUrl: "https://physics.nist.gov/cuu/Units/binary.html",
    sourceType: "technical_standard",
    confidence: "high",
    isProvisional: false,
  },
];

export const DEFAULT_CALCULATOR_PROFILE: CalculatorInputProfile = {
  purpose: "phone",
  habit: "everyday",
  volume: "medium",
  selectedCategories: ["photos", "videos", "apps"],
  photoProfile: {
    currentPhotoCount: 2500,
    monthlyNewPhotos: 120,
    photoType: "typical_phone",
    customFileSizeMb: 5,
    durationMode: "inherit",
    customDurationYears: 3,
  },
  videoProfile: {
    monthlyMinutes: 10,
    currentVideoLibraryGb: 10,
    quality: "4k",
    fps: 30,
    useCustomBitrate: false,
    customBitrateMbps: 30,
  },
  gamesProfile: {
    gameCount: 4,
    sizePreset: "medium",
    customGameSizeGb: 35,
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
  otherProfile: {
    preset: "light",
    currentGb: 15,
    monthlyGrowthGb: 0.4,
  },
  timeHorizon: {
    preset: "3",
    customYears: 3,
  },
  currentStorage: {
    preset: "none",
    customGb: 256,
  },
};

/**
 * Centralized, non-compounding mapping from conversational simple choices
 * (purpose, habit, volume) to a complete CalculatorInputProfile.
 *
 * Calibrated against real-world device & workflow scenarios so that:
 * - Phone users get realistic 128 GB / 256 GB / 512 GB / 1 TB recommendations
 * - Laptop users get 256 GB / 512 GB / 1 TB / 2 TB / 4 TB recommendations
 * - Gaming users get 512 GB–1 TB (casual), 1–2 TB (regular), 2–4 TB+ (large AAA)
 * - Photography users get 256–512 GB (casual), 1–2 TB (enthusiast), 2–4 TB+ (RAW-heavy)
 * - Video creators get 512 GB–1 TB (casual), 1–4 TB (regular 4K), 4 TB+ (heavy 4K60/multi-cam)
 * - Cloud users get realistic cloud backup estimates without OS/game bloat
 */
export function buildProfileFromSimpleChoices(
  purpose: PurposeId,
  habit: UsageHabitId,
  volume: VolumeLevelId,
  baseProfile: CalculatorInputProfile = DEFAULT_CALCULATOR_PROFILE
): CalculatorInputProfile {
  const next = structuredClone(baseProfile);
  next.purpose = purpose;
  next.habit = habit;
  next.volume = volume;

  const volIndex: Record<VolumeLevelId, number> = {
    low: 0,
    medium: 1,
    high: 2,
    very_high: 3,
  };
  const v = volIndex[volume] ?? 1;

  if (purpose === "phone") {
    next.selectedCategories = ["photos", "videos", "apps"];
    if (habit === "light") {
      next.photoProfile.currentPhotoCount = [800, 1500, 3200, 7500][v];
      next.photoProfile.monthlyNewPhotos = [35, 55, 80, 110][v];
      next.photoProfile.photoType = "typical_phone";
      next.videoProfile.monthlyMinutes = [3, 5, 8, 12][v];
      next.videoProfile.currentVideoLibraryGb = [2, 4, 12, 35][v];
      next.videoProfile.quality = "1080p";
      next.videoProfile.fps = 30;
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [35, 45, 55, 65][v];
      next.appsProfile.sizePreset = v === 0 ? "small" : "typical";
    } else if (habit === "everyday") {
      next.photoProfile.currentPhotoCount = [1200, 2500, 5000, 9500][v];
      next.photoProfile.monthlyNewPhotos = [80, 120, 165, 220][v];
      next.photoProfile.photoType = "typical_phone";
      next.videoProfile.monthlyMinutes = [6, 10, 15, 22][v];
      next.videoProfile.currentVideoLibraryGb = [5, 10, 22, 45][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 30;
      next.appsProfile.useDefaultEstimate = v === 1;
      next.appsProfile.appCount = [45, 60, 75, 90][v];
      next.appsProfile.sizePreset = "typical";
    } else if (habit === "heavy") {
      next.photoProfile.currentPhotoCount = [2800, 4500, 6000, 10000][v];
      next.photoProfile.monthlyNewPhotos = [140, 200, 240, 300][v];
      next.photoProfile.photoType = "high_res_phone";
      next.videoProfile.monthlyMinutes = [14, 20, 24, 32][v];
      next.videoProfile.currentVideoLibraryGb = [12, 20, 30, 55][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 30;
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [65, 75, 80, 95][v];
      next.appsProfile.sizePreset = "typical";
    } else {
      // creator
      next.photoProfile.currentPhotoCount = [4000, 6000, 9000, 14000][v];
      next.photoProfile.monthlyNewPhotos = [180, 250, 340, 450][v];
      next.photoProfile.photoType = v >= 2 ? "raw" : "high_res_phone";
      next.videoProfile.monthlyMinutes = [20, 30, 42, 60][v];
      next.videoProfile.currentVideoLibraryGb = [20, 35, 65, 110][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 60;
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [45, 55, 65, 75][v];
      next.appsProfile.sizePreset = "large";
    }
    return next;
  }

  if (purpose === "laptop") {
    if (habit === "light") {
      next.selectedCategories = ["photos", "apps", "documents", "other"];
      next.photoProfile.currentPhotoCount = [1000, 2200, 4500, 8000][v];
      next.photoProfile.monthlyNewPhotos = [30, 60, 100, 140][v];
      next.photoProfile.photoType = "typical_phone";
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [25, 35, 45, 55][v];
      next.appsProfile.sizePreset = "large";
      next.documentsProfile.fileCount = [1500, 3000, 5500, 9000][v];
      next.documentsProfile.sizePreset = "mixed";
      next.otherProfile.preset = v >= 2 ? "moderate" : "light";
    } else if (habit === "everyday") {
      next.selectedCategories = [
        "photos",
        "videos",
        "games",
        "apps",
        "documents",
        "other",
      ];
      next.photoProfile.currentPhotoCount = [2000, 3500, 6500, 11000][v];
      next.photoProfile.monthlyNewPhotos = [60, 100, 150, 220][v];
      next.photoProfile.photoType = "typical_phone";
      next.videoProfile.monthlyMinutes = [6, 10, 16, 24][v];
      next.videoProfile.currentVideoLibraryGb = [8, 15, 35, 70][v];
      next.videoProfile.quality = "1080p";
      next.videoProfile.fps = 30;
      next.gamesProfile.gameCount = [2, 3, 5, 7][v];
      next.gamesProfile.sizePreset = v >= 2 ? "large" : "medium";
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [35, 45, 55, 70][v];
      next.appsProfile.sizePreset = "large";
      next.documentsProfile.fileCount = [2000, 3000, 6000, 10000][v];
      next.documentsProfile.sizePreset = "mixed";
      next.otherProfile.preset = v === 0 ? "light" : v === 3 ? "heavy" : "moderate";
    } else if (habit === "heavy") {
      next.selectedCategories = [
        "photos",
        "videos",
        "apps",
        "documents",
        "other",
      ];
      next.photoProfile.currentPhotoCount = [3500, 5000, 9000, 15000][v];
      next.photoProfile.monthlyNewPhotos = [100, 150, 220, 300][v];
      next.photoProfile.photoType = "high_res_phone";
      next.videoProfile.monthlyMinutes = [14, 20, 32, 45][v];
      next.videoProfile.currentVideoLibraryGb = [25, 40, 95, 180][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 30;
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [50, 65, 80, 95][v];
      next.appsProfile.sizePreset = "large";
      next.documentsProfile.fileCount = [4000, 6000, 10000, 16000][v];
      next.documentsProfile.sizePreset = "large";
      next.otherProfile.preset = "heavy";
    } else {
      // creator (4K editing + games + local archives)
      next.selectedCategories = [
        "photos",
        "videos",
        "games",
        "apps",
        "documents",
        "other",
      ];
      next.photoProfile.currentPhotoCount = [3000, 5000, 8000, 11000][v];
      next.photoProfile.monthlyNewPhotos = [100, 150, 200, 260][v];
      next.photoProfile.photoType = v >= 2 ? "raw" : "high_res_phone";
      next.videoProfile.monthlyMinutes = [15, 25, 38, 52][v];
      next.videoProfile.currentVideoLibraryGb = [30, 60, 110, 180][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = v >= 2 ? 60 : 30;
      next.gamesProfile.gameCount = [2, 3, 5, 6][v];
      next.gamesProfile.sizePreset = "large";
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [45, 55, 65, 75][v];
      next.appsProfile.sizePreset = "large";
      next.documentsProfile.fileCount = [3000, 4500, 6500, 9000][v];
      next.documentsProfile.sizePreset = "large";
      next.otherProfile.preset = "heavy";
    }
    return next;
  }

  if (purpose === "gaming") {
    next.selectedCategories =
      habit === "creator"
        ? ["games", "videos", "apps", "other"]
        : ["games", "apps", "other"];

    if (habit === "light") {
      // Casual / indie / older titles -> 512 GB – 1 TB
      next.gamesProfile.gameCount = [8, 12, 18, 25][v];
      next.gamesProfile.sizePreset = "medium";
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [35, 35, 40, 45][v];
      next.appsProfile.sizePreset = "large";
      next.otherProfile.preset = v >= 2 ? "heavy" : "moderate";
    } else if (habit === "everyday") {
      // Regular modern gamer (5–10 modern games) -> 1 TB – 2 TB
      next.gamesProfile.gameCount = [7, 9, 14, 20][v];
      next.gamesProfile.sizePreset = "large";
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [40, 45, 50, 60][v];
      next.appsProfile.sizePreset = "large";
      next.otherProfile.preset = v >= 2 ? "heavy" : "moderate";
    } else if (habit === "heavy") {
      // Large AAA library -> 2 TB – 4 TB+
      next.gamesProfile.gameCount = [10, 13, 20, 28][v];
      next.gamesProfile.sizePreset = "very_large";
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [45, 50, 60, 70][v];
      next.appsProfile.sizePreset = "large";
      next.otherProfile.preset = "heavy";
    } else {
      // creator (Large AAA library + mods + 4K60 gameplay capture) -> 2 TB – 4 TB+
      next.gamesProfile.gameCount = [12, 16, 22, 32][v];
      next.gamesProfile.sizePreset = "very_large";
      next.videoProfile.monthlyMinutes = [25, 45, 75, 110][v];
      next.videoProfile.currentVideoLibraryGb = [40, 90, 180, 320][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 60;
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [50, 60, 70, 80][v];
      next.appsProfile.sizePreset = "large";
      next.otherProfile.preset = "heavy";
    }
    return next;
  }

  if (purpose === "photography") {
    next.selectedCategories = ["photos", "videos", "documents"];
    if (habit === "light") {
      // Casual / travel / JPEG -> 256 GB – 512 GB
      next.photoProfile.currentPhotoCount = [4000, 8000, 13000, 20000][v];
      next.photoProfile.monthlyNewPhotos = [150, 250, 380, 520][v];
      next.photoProfile.photoType = "dslr_jpeg";
      next.videoProfile.monthlyMinutes = [5, 10, 15, 22][v];
      next.videoProfile.currentVideoLibraryGb = [10, 15, 30, 50][v];
      next.videoProfile.quality = "1080p";
      next.videoProfile.fps = 30;
      next.documentsProfile.fileCount = [1000, 1500, 2500, 4000][v];
      next.documentsProfile.sizePreset = "large";
    } else if (habit === "everyday") {
      // Enthusiast / hybrid JPEG + RAW -> 1 TB – 2 TB
      next.photoProfile.currentPhotoCount = [5000, 6500, 12000, 19000][v];
      next.photoProfile.monthlyNewPhotos = [200, 250, 400, 580][v];
      next.photoProfile.photoType = "raw";
      next.videoProfile.monthlyMinutes = [10, 15, 24, 35][v];
      next.videoProfile.currentVideoLibraryGb = [15, 25, 50, 90][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 30;
      next.documentsProfile.fileCount = [2000, 2500, 3500, 5000][v];
      next.documentsProfile.sizePreset = "large";
    } else if (habit === "heavy") {
      // Heavy RAW workflow -> 2 TB – 4 TB+
      next.photoProfile.currentPhotoCount = [12000, 18000, 26000, 36000][v];
      next.photoProfile.monthlyNewPhotos = [420, 600, 800, 1050][v];
      next.photoProfile.photoType = "raw";
      next.videoProfile.monthlyMinutes = [15, 20, 30, 45][v];
      next.videoProfile.currentVideoLibraryGb = [30, 40, 75, 130][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 30;
      next.documentsProfile.fileCount = [3000, 4000, 5500, 7500][v];
      next.documentsProfile.sizePreset = "large";
    } else {
      // creator (Pro RAW + 4K60 hybrid studio archive) -> 4 TB – 8 TB
      next.photoProfile.currentPhotoCount = [15000, 22000, 32000, 45000][v];
      next.photoProfile.monthlyNewPhotos = [500, 750, 1000, 1300][v];
      next.photoProfile.photoType = "raw";
      next.videoProfile.monthlyMinutes = [20, 30, 45, 60][v];
      next.videoProfile.currentVideoLibraryGb = [40, 80, 140, 220][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 60;
      next.documentsProfile.fileCount = [4000, 5500, 7500, 10000][v];
      next.documentsProfile.sizePreset = "large";
    }
    return next;
  }

  if (purpose === "video") {
    next.selectedCategories = ["videos", "photos", "apps", "other"];
    if (habit === "light") {
      // Casual 1080p / short social clips -> 512 GB – 1 TB
      next.videoProfile.monthlyMinutes = [30, 55, 80, 110][v];
      next.videoProfile.currentVideoLibraryGb = [30, 60, 110, 180][v];
      next.videoProfile.quality = "1080p";
      next.videoProfile.fps = 60;
      next.photoProfile.currentPhotoCount = [1500, 2500, 4000, 6000][v];
      next.photoProfile.monthlyNewPhotos = [80, 120, 180, 250][v];
      next.photoProfile.photoType = "high_res_phone";
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [35, 40, 45, 55][v];
      next.appsProfile.sizePreset = "large";
      next.otherProfile.preset = "moderate";
    } else if (habit === "everyday") {
      // Regular 4K creator -> 1 TB – 4 TB
      next.videoProfile.monthlyMinutes = [35, 65, 110, 160][v];
      next.videoProfile.currentVideoLibraryGb = [60, 120, 250, 450][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 30;
      next.photoProfile.currentPhotoCount = [2500, 4000, 6500, 10000][v];
      next.photoProfile.monthlyNewPhotos = [120, 160, 240, 350][v];
      next.photoProfile.photoType = "high_res_phone";
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [45, 50, 55, 65][v];
      next.appsProfile.sizePreset = "large";
      next.otherProfile.preset = "heavy";
    } else if (habit === "heavy") {
      // Heavy 4K60 workflow -> 4 TB+
      next.videoProfile.monthlyMinutes = [85, 120, 180, 250][v];
      next.videoProfile.currentVideoLibraryGb = [200, 350, 600, 950][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 60;
      next.photoProfile.currentPhotoCount = [4000, 6000, 10000, 15000][v];
      next.photoProfile.monthlyNewPhotos = [180, 250, 380, 500][v];
      next.photoProfile.photoType = "raw";
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [55, 60, 70, 80][v];
      next.appsProfile.sizePreset = "large";
      next.otherProfile.preset = "heavy";
    } else {
      // creator (Multi-cam 4K60 / 8K master production archive) -> 4 TB – 8 TB+
      next.videoProfile.monthlyMinutes = [140, 200, 280, 380][v];
      next.videoProfile.currentVideoLibraryGb = [450, 750, 1200, 1800][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 60;
      next.photoProfile.currentPhotoCount = [6000, 10000, 16000, 24000][v];
      next.photoProfile.monthlyNewPhotos = [250, 400, 600, 850][v];
      next.photoProfile.photoType = "raw";
      next.appsProfile.useDefaultEstimate = false;
      next.appsProfile.appCount = [65, 70, 80, 95][v];
      next.appsProfile.sizePreset = "large";
      next.otherProfile.preset = "heavy";
    }
    return next;
  }

  if (purpose === "cloud") {
    // Cloud storage does NOT include installed OS/apps/games
    next.selectedCategories = ["photos", "videos", "documents", "other"];
    if (habit === "light") {
      next.photoProfile.currentPhotoCount = [1200, 2800, 6000, 11000][v];
      next.photoProfile.monthlyNewPhotos = [50, 90, 140, 200][v];
      next.photoProfile.photoType = "typical_phone";
      next.videoProfile.monthlyMinutes = [4, 8, 14, 22][v];
      next.videoProfile.currentVideoLibraryGb = [4, 10, 25, 50][v];
      next.videoProfile.quality = "1080p";
      next.videoProfile.fps = 30;
      next.documentsProfile.fileCount = [1000, 2500, 5000, 9000][v];
      next.documentsProfile.sizePreset = "mixed";
      next.otherProfile.preset = v >= 2 ? "moderate" : "light";
    } else if (habit === "everyday") {
      next.photoProfile.currentPhotoCount = [2500, 4500, 9000, 16000][v];
      next.photoProfile.monthlyNewPhotos = [100, 150, 240, 350][v];
      next.photoProfile.photoType = "typical_phone";
      next.videoProfile.monthlyMinutes = [10, 15, 25, 38][v];
      next.videoProfile.currentVideoLibraryGb = [12, 25, 55, 110][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 30;
      next.documentsProfile.fileCount = [2000, 3500, 7000, 12000][v];
      next.documentsProfile.sizePreset = "mixed";
      next.otherProfile.preset = v === 0 ? "light" : v === 3 ? "heavy" : "moderate";
    } else if (habit === "heavy") {
      next.photoProfile.currentPhotoCount = [6000, 10000, 18000, 28000][v];
      next.photoProfile.monthlyNewPhotos = [200, 300, 450, 650][v];
      next.photoProfile.photoType = "high_res_phone";
      next.videoProfile.monthlyMinutes = [20, 30, 45, 65][v];
      next.videoProfile.currentVideoLibraryGb = [35, 70, 140, 260][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 30;
      next.documentsProfile.fileCount = [4000, 7000, 12000, 20000][v];
      next.documentsProfile.sizePreset = "large";
      next.otherProfile.preset = "heavy";
    } else {
      // creator cloud backup
      next.photoProfile.currentPhotoCount = [10000, 16000, 26000, 40000][v];
      next.photoProfile.monthlyNewPhotos = [300, 450, 700, 1000][v];
      next.photoProfile.photoType = "raw";
      next.videoProfile.monthlyMinutes = [30, 50, 80, 120][v];
      next.videoProfile.currentVideoLibraryGb = [80, 160, 300, 550][v];
      next.videoProfile.quality = "4k";
      next.videoProfile.fps = 60;
      next.documentsProfile.fileCount = [6000, 10000, 16000, 25000][v];
      next.documentsProfile.sizePreset = "large";
      next.otherProfile.preset = "heavy";
    }
    return next;
  }

  // purpose === "other" (General mixed storage)
  const defaultCats: StorageCategoryId[] = [
    "photos",
    "videos",
    "apps",
    "documents",
    "other",
  ];
  next.selectedCategories = defaultCats;
  if (habit === "light") {
    next.photoProfile.currentPhotoCount = [1000, 2000, 4000, 7500][v];
    next.photoProfile.monthlyNewPhotos = [40, 70, 110, 160][v];
    next.photoProfile.photoType = "typical_phone";
    next.videoProfile.monthlyMinutes = [4, 8, 12, 18][v];
    next.videoProfile.currentVideoLibraryGb = [4, 8, 18, 35][v];
    next.videoProfile.quality = "1080p";
    next.videoProfile.fps = 30;
    next.appsProfile.useDefaultEstimate = true;
    next.documentsProfile.fileCount = [800, 1500, 3000, 6000][v];
    next.documentsProfile.sizePreset = "mixed";
    next.otherProfile.preset = "light";
  } else if (habit === "everyday") {
    next.photoProfile.currentPhotoCount = [2000, 3500, 6500, 11000][v];
    next.photoProfile.monthlyNewPhotos = [90, 140, 200, 280][v];
    next.photoProfile.photoType = "typical_phone";
    next.videoProfile.monthlyMinutes = [10, 16, 24, 36][v];
    next.videoProfile.currentVideoLibraryGb = [10, 20, 40, 80][v];
    next.videoProfile.quality = "4k";
    next.videoProfile.fps = 30;
    next.appsProfile.useDefaultEstimate = true;
    next.documentsProfile.fileCount = [1500, 2500, 5000, 9000][v];
    next.documentsProfile.sizePreset = "mixed";
    next.otherProfile.preset = "moderate";
  } else if (habit === "heavy") {
    next.photoProfile.currentPhotoCount = [4000, 7000, 12000, 20000][v];
    next.photoProfile.monthlyNewPhotos = [160, 240, 350, 500][v];
    next.photoProfile.photoType = "high_res_phone";
    next.videoProfile.monthlyMinutes = [18, 28, 42, 60][v];
    next.videoProfile.currentVideoLibraryGb = [25, 50, 100, 200][v];
    next.videoProfile.quality = "4k";
    next.videoProfile.fps = 30;
    next.appsProfile.useDefaultEstimate = false;
    next.appsProfile.appCount = [55, 70, 85, 100][v];
    next.appsProfile.sizePreset = "large";
    next.documentsProfile.fileCount = [3000, 5000, 9000, 15000][v];
    next.documentsProfile.sizePreset = "large";
    next.otherProfile.preset = "heavy";
  } else {
    next.photoProfile.currentPhotoCount = [7000, 12000, 20000, 32000][v];
    next.photoProfile.monthlyNewPhotos = [250, 380, 550, 800][v];
    next.photoProfile.photoType = "raw";
    next.videoProfile.monthlyMinutes = [30, 48, 72, 105][v];
    next.videoProfile.currentVideoLibraryGb = [60, 120, 240, 450][v];
    next.videoProfile.quality = "4k";
    next.videoProfile.fps = 60;
    next.appsProfile.useDefaultEstimate = false;
    next.appsProfile.appCount = [65, 80, 95, 110][v];
    next.appsProfile.sizePreset = "large";
    next.documentsProfile.fileCount = [5000, 8000, 14000, 22000][v];
    next.documentsProfile.sizePreset = "large";
    next.otherProfile.preset = "heavy";
  }

  return next;
}
