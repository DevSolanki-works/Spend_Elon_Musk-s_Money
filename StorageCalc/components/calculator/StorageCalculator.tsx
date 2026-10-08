"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_CALCULATOR_PROFILE,
  buildProfileFromSimpleChoices,
} from "@/lib/calculator/assumptions";
import { calculateStorageReality } from "@/lib/calculator/engine";
import {
  parseProfileFromSearchParams,
  serializeProfileToSearchParams,
} from "@/lib/calculator/url-state";
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
} from "@/lib/calculator/types";
import { Button } from "@/components/ui/Button";
import { CategoryIcon, PurposeIcon } from "@/components/ui/Icons";
import { ResultScreen } from "./ResultScreen";

export type { PurposeId, UsageHabitId, VolumeLevelId };

interface OptionCardItem<T extends string> {
  id: T;
  title: string;
  description: string;
}

const PURPOSE_OPTIONS: OptionCardItem<PurposeId>[] = [
  {
    id: "phone",
    title: "Phone",
    description: "Apps, photos, videos, and everyday files",
  },
  {
    id: "laptop",
    title: "Laptop",
    description: "Programs, documents, media, and projects",
  },
  {
    id: "gaming",
    title: "Gaming",
    description: "Console, PC, or handheld game library",
  },
  {
    id: "photography",
    title: "Photography",
    description: "Camera or phone photo library and archives",
  },
  {
    id: "video",
    title: "Video",
    description: "Recording 1080p, 4K, or high-bitrate footage",
  },
  {
    id: "cloud",
    title: "Cloud storage",
    description: "Backup for photos, videos, and personal files",
  },
  {
    id: "other",
    title: "Other",
    description: "External drive, SD card, or custom mix",
  },
];

function getHabitQuestion(purpose: PurposeId): {
  question: string;
  subtitle: string;
  options: OptionCardItem<UsageHabitId>[];
} {
  switch (purpose) {
    case "phone":
      return {
        question: "How do you usually use your phone?",
        subtitle: "Pick the description that feels closest to your habits.",
        options: [
          {
            id: "light",
            title: "Light storage",
            description: "Essential apps, messaging, and occasional photos",
          },
          {
            id: "everyday",
            title: "Everyday",
            description: "Social apps, regular photos, and casual 4K/HD clips",
          },
          {
            id: "heavy",
            title: "Heavy media",
            description: "High-res camera shots, frequent 4K video, and many apps",
          },
          {
            id: "creator",
            title: "Mobile creator",
            description: "Frequent 4K 60fps video, ProRAW/high-MP photos, and editing apps",
          },
        ],
      };
    case "laptop":
      return {
        question: "How do you usually use your laptop?",
        subtitle: "Choose the workload that best matches your day-to-day.",
        options: [
          {
            id: "light",
            title: "Student, office & browsing",
            description: "Documents, web apps, and a modest personal photo library",
          },
          {
            id: "everyday",
            title: "Everyday work, media & a few games",
            description: "Office apps, personal photos/videos, and 2–3 installed games",
          },
          {
            id: "heavy",
            title: "Developer, creator & large local files",
            description: "Heavy software suites, local backups/VMs, and high-res media",
          },
          {
            id: "creator",
            title: "4K video editing, games & archives",
            description: "Large 4K project timelines, AAA games, and local media archives",
          },
        ],
      };
    case "gaming":
      return {
        question: "What kind of games do you usually play?",
        subtitle: "Modern game installs range from a few gigabytes to over 100 GB each.",
        options: [
          {
            id: "light",
            title: "Casual, indie & older titles",
            description: "Smaller 3D, indie, strategy, or retro games (~15–20 GB each)",
          },
          {
            id: "everyday",
            title: "Regular modern gamer",
            description: "Mainstream PC or console releases (~50–60 GB each)",
          },
          {
            id: "heavy",
            title: "Large AAA library",
            description: "Open-world RPGs, shooters, and sims (~80–120 GB each)",
          },
          {
            id: "creator",
            title: "AAA library + mods & 4K captures",
            description: "Blockbuster installs plus recorded gameplay clips and mod packs",
          },
        ],
      };
    case "photography":
      return {
        question: "What kind of photos do you mostly store?",
        subtitle: "Camera settings and formats determine how fast your archive grows.",
        options: [
          {
            id: "light",
            title: "Casual, travel & camera JPEGs",
            description: "Mirrorless/DSLR JPEGs and high-res travel photography",
          },
          {
            id: "everyday",
            title: "Enthusiast hybrid (RAW + JPEG)",
            description: "Regular uncompressed RAW or ProRAW shoots plus 4K clips",
          },
          {
            id: "heavy",
            title: "Heavy RAW workflow",
            description: "High-volume RAW editing catalogs and multi-year archives",
          },
          {
            id: "creator",
            title: "Pro / event RAW + 4K hybrid",
            description: "Large client or studio shoots with RAW bursts and 4K60 video",
          },
        ],
      };
    case "video":
      return {
        question: "What kind of video do you usually record or edit?",
        subtitle: "Resolution, frame rate, and scratch files drive creator storage needs.",
        options: [
          {
            id: "light",
            title: "Casual 1080p & social clips",
            description: "Everyday Full HD recordings and short-form social edits",
          },
          {
            id: "everyday",
            title: "Regular 4K creator",
            description: "Sharp 4K 30fps footage for YouTube, travel, or client projects",
          },
          {
            id: "heavy",
            title: "Heavy 4K 60fps workflow",
            description: "High-frame-rate 4K production with RAW thumbnails and assets",
          },
          {
            id: "creator",
            title: "Multi-cam / long-form 4K60 studio",
            description: "High-volume production footage, render caches, and master archives",
          },
        ],
      };
    case "cloud":
      return {
        question: "What do you want to back up to the cloud?",
        subtitle: "Cloud plans store your photos, videos, and files—not installed apps or games.",
        options: [
          {
            id: "light",
            title: "Documents & essential photos",
            description: "Important PDFs, work files, and a light phone photo backup",
          },
          {
            id: "everyday",
            title: "Personal photos & 4K phone videos",
            description: "Automatic camera-roll sync and everyday device backups",
          },
          {
            id: "heavy",
            title: "Family library & multi-device backups",
            description: "Shared family photo/video library plus tablet and computer folders",
          },
          {
            id: "creator",
            title: "Offsite RAW & 4K creator archive",
            description: "Cloud backup for camera RAW libraries and video project deliverables",
          },
        ],
      };
    case "other":
      return {
        question: "What are you planning to store on this drive?",
        subtitle: "Pick the closest match for your files.",
        options: [
          {
            id: "light",
            title: "Documents & occasional photos",
            description: "Important personal files and a modest photo library",
          },
          {
            id: "everyday",
            title: "Personal photos & home videos",
            description: "Years of phone photos, 4K clips, and everyday folders",
          },
          {
            id: "heavy",
            title: "Full device backups & large media",
            description: "Large photo/video libraries and computer backups",
          },
          {
            id: "creator",
            title: "Creator archive",
            description: "RAW photos, 4K footage, and large project folders",
          },
        ],
      };
  }
}

function getVolumeQuestion(purpose: PurposeId): {
  question: string;
  subtitle: string;
  options: OptionCardItem<VolumeLevelId>[];
} {
  switch (purpose) {
    case "gaming":
      return {
        question: "How many games do you keep installed at the same time?",
        subtitle: "Count the games you want ready to play without uninstalling.",
        options: [
          {
            id: "low",
            title: "5 to 8 games",
            description: "A focused rotation of current favorites",
          },
          {
            id: "medium",
            title: "8 to 12 games",
            description: "A solid library of multiplayer and single-player titles",
          },
          {
            id: "high",
            title: "14 to 20 games",
            description: "A large collection installed and ready at all times",
          },
          {
            id: "very_high",
            title: "20 to 30+ games",
            description: "I rarely uninstall games from my drive",
          },
        ],
      };
    case "photography":
      return {
        question: "How large is your photo library and monthly shooting volume?",
        subtitle: "We combine your existing archive with new shots over time.",
        options: [
          {
            id: "low",
            title: "Modest library",
            description: "~4,000–5,000 existing photos + ~150–200 new shots a month",
          },
          {
            id: "medium",
            title: "Active hobbyist",
            description: "~6,500–8,000 existing photos + ~250–300 new shots a month",
          },
          {
            id: "high",
            title: "Frequent shoots",
            description: "~12,000–18,000 existing photos + ~400–600 new shots a month",
          },
          {
            id: "very_high",
            title: "High-volume archive",
            description: "20,000+ existing photos + 600–1,300+ new shots a month",
          },
        ],
      };
    case "video":
      return {
        question: "How much video footage do you keep and record each month?",
        subtitle: "Include finished videos and raw clips you keep on your drives.",
        options: [
          {
            id: "low",
            title: "Light monthly filming",
            description: "~30–35 minutes of new footage a month + modest existing archive",
          },
          {
            id: "medium",
            title: "Regular creator schedule",
            description: "~1 hour of new footage a month + growing project library",
          },
          {
            id: "high",
            title: "Frequent production",
            description: "~2 to 3 hours of new footage a month + large existing archive",
          },
          {
            id: "very_high",
            title: "Heavy studio volume",
            description: "3 to 6+ hours of new footage every month",
          },
        ],
      };
    case "laptop":
      return {
        question: "How much media and files do you keep stored on your laptop?",
        subtitle: "Include offline photos, videos, downloads, and local projects.",
        options: [
          {
            id: "low",
            title: "Lean local storage",
            description: "Mostly cloud/streaming with a compact local file collection",
          },
          {
            id: "medium",
            title: "Balanced local library",
            description: "A normal collection of photos, downloads, apps, and docs",
          },
          {
            id: "high",
            title: "Large local collection",
            description: "Lots of offline media, 4K clips, or several large games",
          },
          {
            id: "very_high",
            title: "Everything stays local",
            description: "Multi-year media libraries, local backups, and large projects",
          },
        ],
      };
    case "phone":
      return {
        question: "How much photos and video do you keep on your phone?",
        subtitle: "Camera-roll photos and 4K video clips are the main drivers of phone storage.",
        options: [
          {
            id: "low",
            title: "A light camera roll",
            description: "Around 1,000 photos and occasional short video clips",
          },
          {
            id: "medium",
            title: "Normal everyday camera roll",
            description: "A few thousand photos and ~10–15 minutes of video a month",
          },
          {
            id: "high",
            title: "Large on-device library",
            description: "5,000+ photos and ~20–25 minutes of 4K video a month",
          },
          {
            id: "very_high",
            title: "Years of un-deleted media",
            description: "10,000+ photos and 30–60 minutes of 4K video every month",
          },
        ],
      };
    case "cloud":
    case "other":
      return {
        question: "How much new photos, video, and files do you add?",
        subtitle: "We project your current backup plus monthly additions over time.",
        options: [
          {
            id: "low",
            title: "A little",
            description: "A few photos a week and occasional short videos",
          },
          {
            id: "medium",
            title: "A normal amount",
            description: "Regular weekly photos and ~10–15 minutes of video a month",
          },
          {
            id: "high",
            title: "Quite a lot",
            description: "Daily photos and ~25–45 minutes of 4K video a month",
          },
          {
            id: "very_high",
            title: "High-volume archive",
            description: "Hundreds of photos and 1–2 hours of 4K video a month",
          },
        ],
      };
  }
}

const SESSION_STORAGE_KEY = "storage_reality_calculator_state_v2";

const ALL_CATEGORY_OPTIONS: { id: StorageCategoryId; label: string }[] = [
  { id: "photos", label: "Photos" },
  { id: "videos", label: "Videos" },
  { id: "games", label: "Games" },
  { id: "apps", label: "Apps" },
  { id: "documents", label: "Documents" },
  { id: "other", label: "Other files" },
];

export function StorageCalculator() {
  const [purpose, setPurpose] = useState<PurposeId>("phone");
  const [habit, setHabit] = useState<UsageHabitId>("everyday");
  const [volume, setVolume] = useState<VolumeLevelId>("medium");
  const [profile, setProfile] = useState<CalculatorInputProfile>(() =>
    structuredClone(DEFAULT_CALCULATOR_PROFILE)
  );
  // Step 1: Purpose, Step 2: Habit, Step 3: Volume (+ optional Advanced), Step 4: Horizon, Step 5: Results
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Restore from URL query params if present
  useEffect(() => {
    function syncFromUrl() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const rawPurpose = urlParams.get("purpose") as PurposeId | null;
        const validPurposes: PurposeId[] = [
          "phone",
          "laptop",
          "gaming",
          "photography",
          "video",
          "cloud",
          "other",
        ];

        const parsed = parseProfileFromSearchParams(urlParams);
        if (parsed) {
          setProfile(parsed.profile);
          if (parsed.profile.purpose) setPurpose(parsed.profile.purpose);
          if (parsed.profile.habit) setHabit(parsed.profile.habit);
          if (parsed.profile.volume) setVolume(parsed.profile.volume);
          if (parsed.stepId === "results") {
            setStep(5);
          } else if (parsed.stepId === "step-2") {
            setStep(2);
          } else if (parsed.stepId === "step-3") {
            setStep(3);
          } else if (parsed.stepId === "step-4") {
            setStep(4);
          }
        } else if (rawPurpose && validPurposes.includes(rawPurpose)) {
          setPurpose(rawPurpose);
          setHabit("everyday");
          setVolume("medium");
          setProfile((prev) =>
            buildProfileFromSimpleChoices(rawPurpose, "everyday", "medium", prev)
          );
          setStep(2);
        } else {
          const savedRaw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
          if (savedRaw) {
            const savedParams = new URLSearchParams(savedRaw);
            const parsedSaved = parseProfileFromSearchParams(savedParams);
            if (parsedSaved) {
              setProfile(parsedSaved.profile);
              if (parsedSaved.profile.purpose) {
                setPurpose(parsedSaved.profile.purpose);
              }
              if (parsedSaved.profile.habit) {
                setHabit(parsedSaved.profile.habit);
              }
              if (parsedSaved.profile.volume) {
                setVolume(parsedSaved.profile.volume);
              }
              if (parsedSaved.stepId === "results") {
                setStep(5);
              }
            }
          }
        }
      } catch {
        // Ignore storage errors
      } finally {
        setHydrated(true);
      }
    }

    queueMicrotask(syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // Persist to sessionStorage / URL when on results or after hydration
  useEffect(() => {
    if (!hydrated) return;
    try {
      const stepLabel = step === 5 ? "results" : `step-${step}`;
      const params = serializeProfileToSearchParams(profile, stepLabel);
      const queryString = params.toString();
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, queryString);

      if (step === 5 || window.location.search.length > 0) {
        const newUrl = `${window.location.pathname}?${queryString}${window.location.hash}`;
        window.history.replaceState(null, "", newUrl);
      }
    } catch {
      // Ignore history errors
    }
  }, [profile, step, hydrated]);

  const result = useMemo(() => calculateStorageReality(profile), [profile]);

  function scrollToTop() {
    if (topRef.current) {
      const rect = topRef.current.getBoundingClientRect();
      if (rect.top < 0 || rect.top > 180) {
        topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function handleSelectPurpose(nextPurpose: PurposeId) {
    setPurpose(nextPurpose);
    setProfile((prev) =>
      buildProfileFromSimpleChoices(nextPurpose, habit, volume, prev)
    );
    setStep(2);
    scrollToTop();
  }

  function handleSelectHabit(nextHabit: UsageHabitId) {
    setHabit(nextHabit);
    setProfile((prev) =>
      buildProfileFromSimpleChoices(purpose, nextHabit, volume, prev)
    );
    setStep(3);
    scrollToTop();
  }

  function handleSelectVolume(nextVolume: VolumeLevelId) {
    setVolume(nextVolume);
    setProfile((prev) =>
      buildProfileFromSimpleChoices(purpose, habit, nextVolume, prev)
    );
  }

  function handleSelectHorizon(preset: TimeHorizonPreset) {
    setProfile((prev) => ({
      ...prev,
      timeHorizon: {
        preset,
        customYears: preset === "custom" ? prev.timeHorizon.customYears : Number(preset),
      },
    }));
  }

  function handleReset() {
    setPurpose("phone");
    setHabit("everyday");
    setVolume("medium");
    setAdvancedOpen(false);
    setProfile(structuredClone(DEFAULT_CALCULATOR_PROFILE));
    setStep(1);
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      // Ignore
    }
    scrollToTop();
  }

  function handleCopyShareLink() {
    try {
      const params = serializeProfileToSearchParams(profile, "results");
      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      navigator.clipboard?.writeText(shareUrl);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    } catch {
      // Ignore
    }
  }

  function toggleCategory(catId: StorageCategoryId) {
    setProfile((prev) => {
      const exists = prev.selectedCategories.includes(catId);
      const nextCats = exists
        ? prev.selectedCategories.filter((c) => c !== catId)
        : [...prev.selectedCategories, catId];
      return {
        ...prev,
        selectedCategories: nextCats,
      };
    });
  }

  const habitConfig = getHabitQuestion(purpose);
  const volumeConfig = getVolumeQuestion(purpose);
  const selectedPurposeOption =
    PURPOSE_OPTIONS.find((p) => p.id === purpose) ?? PURPOSE_OPTIONS[0];

  return (
    <div
      ref={topRef}
      className="scroll-mt-20 overflow-hidden rounded-xl border border-border-subtle bg-surface"
    >
      {/* Top Tool Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-subtle/60 px-5 py-3.5 sm:px-7">
        {step < 5 ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-foreground tabular-nums">
              Step {step} of 4
            </span>
            <span
              aria-hidden="true"
              className="flex items-center gap-1.5 text-xs"
            >
              {[1, 2, 3, 4].map((dot) => (
                <span
                  key={dot}
                  className={`inline-block h-1.5 w-5 rounded-full transition-colors ${
                    dot <= step ? "bg-accent-primary" : "bg-border-strong"
                  }`}
                />
              ))}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium text-foreground-muted">
            <PurposeIcon id={purpose} className="h-4 w-4 text-foreground" />
            <span className="font-semibold text-foreground">
              {selectedPurposeOption.title}
            </span>
            <span>&middot;</span>
            <span>Recommendation ready</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {step > 1 && step < 5 && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
              <PurposeIcon id={purpose} className="h-3.5 w-3.5 text-accent-primary" />
              <span>{selectedPurposeOption.title}</span>
            </span>
          )}

          {step > 1 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-foreground-muted hover:text-foreground cursor-pointer"
            >
              Start over
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {/* STEP 1: What are you choosing storage for? */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                What are you choosing storage for?
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                Pick what you&apos;re buying or planning for.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {PURPOSE_OPTIONS.map((item) => {
                const selected = purpose === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPurpose(item.id)}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-4 text-left transition-colors cursor-pointer ${
                      selected
                        ? "border-accent-primary bg-accent-soft/60"
                        : "border-border-subtle bg-background hover:border-border-strong"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                          selected
                            ? "border-accent-border bg-surface text-accent-primary"
                            : "border-border-subtle bg-surface text-foreground"
                        }`}
                      >
                        <PurposeIcon id={item.id} className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="block text-sm font-semibold text-foreground sm:text-base">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-foreground-muted">
                          {item.description}
                        </span>
                      </div>
                    </div>

                    <span
                      aria-hidden="true"
                      className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-accent-primary bg-accent-primary"
                          : "border-border-strong"
                      }`}
                    >
                      {selected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
              <p className="text-xs text-foreground-muted">
                Selected:{" "}
                <strong className="font-medium text-foreground">
                  {selectedPurposeOption.title}
                </strong>
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  handleSelectPurpose(purpose);
                }}
              >
                Continue &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Usage Habit */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {habitConfig.question}
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                {habitConfig.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {habitConfig.options.map((item) => {
                const selected = habit === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectHabit(item.id)}
                    className={`flex items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors cursor-pointer ${
                      selected
                        ? "border-accent-primary bg-accent-soft/60"
                        : "border-border-subtle bg-background hover:border-border-strong"
                    }`}
                  >
                    <div>
                      <span className="block text-sm font-semibold text-foreground sm:text-base">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-foreground-muted">
                        {item.description}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-accent-primary bg-accent-primary"
                          : "border-border-strong"
                      }`}
                    >
                      {selected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep(1);
                  scrollToTop();
                }}
              >
                &larr; Back
              </Button>
              <div className="flex items-center gap-4">
                <span className="hidden text-xs text-foreground-muted sm:inline">
                  Current estimate:{" "}
                  <strong className="font-semibold text-foreground tabular-nums">
                    {result.recommendedStorage.tier}
                  </strong>
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setStep(3);
                    scrollToTop();
                  }}
                >
                  Continue &rarr;
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Volume + Collapsible Advanced Settings */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {volumeConfig.question}
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                {volumeConfig.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {volumeConfig.options.map((item) => {
                const selected = volume === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      handleSelectVolume(item.id);
                      if (!advancedOpen) {
                        setStep(4);
                        scrollToTop();
                      }
                    }}
                    className={`flex items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors cursor-pointer ${
                      selected
                        ? "border-accent-primary bg-accent-soft/60"
                        : "border-border-subtle bg-background hover:border-border-strong"
                    }`}
                  >
                    <div>
                      <span className="block text-sm font-semibold text-foreground sm:text-base">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-foreground-muted">
                        {item.description}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-accent-primary bg-accent-primary"
                          : "border-border-strong"
                      }`}
                    >
                      {selected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Progressive Disclosure: Advanced Settings */}
            <div className="border-t border-border-subtle pt-4">
              <button
                type="button"
                aria-expanded={advancedOpen}
                onClick={() => setAdvancedOpen((prev) => !prev)}
                className="flex items-center gap-2 text-xs font-medium text-foreground-muted hover:text-foreground cursor-pointer"
              >
                <span>
                  {advancedOpen
                    ? "Hide advanced settings"
                    : "Customize exact numbers (Advanced settings)"}
                </span>
                <span className="text-[10px]">
                  {advancedOpen ? "▲" : "▼"}
                </span>
              </button>

              {advancedOpen && (
                <div className="mt-4 space-y-5 rounded-lg border border-border-subtle bg-background p-4 sm:p-5">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Included storage categories
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ALL_CATEGORY_OPTIONS.map((cat) => {
                        const active = profile.selectedCategories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                              active
                                ? "border-accent-primary bg-accent-soft text-accent-primary"
                                : "border-border-subtle bg-surface text-foreground-muted hover:text-foreground"
                            }`}
                          >
                            <CategoryIcon category={cat.id} className="h-3.5 w-3.5" />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                {/* Photos Advanced */}
                {profile.selectedCategories.includes("photos") && (
                  <div className="space-y-3 border-t border-border-subtle pt-4">
                    <p className="text-xs font-semibold text-foreground">
                      Photos
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <label className="block text-xs text-foreground-muted">
                        Current photos
                        <input
                          type="number"
                          min={0}
                          value={profile.photoProfile.currentPhotoCount}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              photoProfile: {
                                ...prev.photoProfile,
                                currentPhotoCount: Number(e.target.value) || 0,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm text-foreground"
                        />
                      </label>
                      <label className="block text-xs text-foreground-muted">
                        New photos / month
                        <input
                          type="number"
                          min={0}
                          value={profile.photoProfile.monthlyNewPhotos}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              photoProfile: {
                                ...prev.photoProfile,
                                monthlyNewPhotos: Number(e.target.value) || 0,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm text-foreground"
                        />
                      </label>
                      <label className="block text-xs text-foreground-muted">
                        Photo format
                        <select
                          value={profile.photoProfile.photoType}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              photoProfile: {
                                ...prev.photoProfile,
                                photoType: e.target.value as PhotoTypePresetId,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2.5 py-1.5 text-sm text-foreground"
                        >
                          <option value="typical_phone">
                            Typical phone (HEIC/JPEG)
                          </option>
                          <option value="high_res_phone">
                            High-res phone (24–48 MP)
                          </option>
                          <option value="dslr_jpeg">DSLR / mirrorless JPEG</option>
                          <option value="raw">RAW / ProRAW</option>
                          <option value="custom">Custom size (MB)</option>
                        </select>
                      </label>
                    </div>
                    {profile.photoProfile.photoType === "custom" && (
                      <label className="block max-w-xs text-xs text-foreground-muted">
                        Custom average photo size (MB)
                        <input
                          type="number"
                          min={0.1}
                          step={0.5}
                          value={profile.photoProfile.customFileSizeMb}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              photoProfile: {
                                ...prev.photoProfile,
                                customFileSizeMb: Number(e.target.value) || 1,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm text-foreground"
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* Videos Advanced */}
                {profile.selectedCategories.includes("videos") && (
                  <div className="space-y-3 border-t border-border-subtle pt-4">
                    <p className="text-xs font-semibold text-foreground">
                      Videos
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <label className="block text-xs text-foreground-muted">
                        Minutes / month
                        <input
                          type="number"
                          min={0}
                          value={profile.videoProfile.monthlyMinutes}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              videoProfile: {
                                ...prev.videoProfile,
                                monthlyMinutes: Number(e.target.value) || 0,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm text-foreground"
                        />
                      </label>
                      <label className="block text-xs text-foreground-muted">
                        Existing video (GB)
                        <input
                          type="number"
                          min={0}
                          value={profile.videoProfile.currentVideoLibraryGb}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              videoProfile: {
                                ...prev.videoProfile,
                                currentVideoLibraryGb:
                                  Number(e.target.value) || 0,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm text-foreground"
                        />
                      </label>
                      <label className="block text-xs text-foreground-muted">
                        Resolution
                        <select
                          value={profile.videoProfile.quality}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              videoProfile: {
                                ...prev.videoProfile,
                                quality: e.target.value as VideoQualityPresetId,
                                useCustomBitrate: false,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2.5 py-1.5 text-sm text-foreground"
                        >
                          <option value="720p">720p HD</option>
                          <option value="1080p">1080p Full HD</option>
                          <option value="4k">4K Ultra HD</option>
                          <option value="8k">8K</option>
                        </select>
                      </label>
                      <label className="block text-xs text-foreground-muted">
                        Frame rate
                        <select
                          value={profile.videoProfile.fps}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              videoProfile: {
                                ...prev.videoProfile,
                                fps: (Number(e.target.value) === 60
                                  ? 60
                                  : 30) as VideoFpsOption,
                                useCustomBitrate: false,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2.5 py-1.5 text-sm text-foreground"
                        >
                          <option value={30}>30 fps</option>
                          <option value={60}>60 fps</option>
                        </select>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <label className="inline-flex items-center gap-2 text-xs text-foreground-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.videoProfile.useCustomBitrate}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              videoProfile: {
                                ...prev.videoProfile,
                                useCustomBitrate: e.target.checked,
                              },
                            }))
                          }
                        />
                        <span>Use custom bitrate (Mbps)</span>
                      </label>
                      {profile.videoProfile.useCustomBitrate && (
                        <input
                          type="number"
                          min={1}
                          value={profile.videoProfile.customBitrateMbps}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              videoProfile: {
                                ...prev.videoProfile,
                                customBitrateMbps: Number(e.target.value) || 10,
                              },
                            }))
                          }
                          aria-label="Custom video bitrate in Mbps"
                          className="w-28 rounded-md border border-border-subtle bg-background px-2.5 py-1 font-mono text-xs text-foreground"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Games Advanced */}
                {profile.selectedCategories.includes("games") && (
                  <div className="space-y-3 border-t border-border-subtle pt-4">
                    <p className="text-xs font-semibold text-foreground">
                      Games
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block text-xs text-foreground-muted">
                        Installed games count
                        <input
                          type="number"
                          min={0}
                          max={2000}
                          value={profile.gamesProfile.gameCount}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              gamesProfile: {
                                ...prev.gamesProfile,
                                gameCount: Math.max(0, Number(e.target.value) || 0),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm text-foreground"
                        />
                      </label>
                      <label className="block text-xs text-foreground-muted">
                        Typical game size
                        <select
                          value={profile.gamesProfile.sizePreset}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              gamesProfile: {
                                ...prev.gamesProfile,
                                sizePreset: e.target.value as GameSizePresetId,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2.5 py-1.5 text-sm text-foreground"
                        >
                          <option value="small">Small (~3 GB)</option>
                          <option value="medium">Medium (~18 GB)</option>
                          <option value="large">Large (~55 GB)</option>
                          <option value="very_large">Very large (~100 GB)</option>
                          <option value="custom">Custom (GB)</option>
                        </select>
                      </label>
                    </div>
                    {profile.gamesProfile.sizePreset === "custom" && (
                      <label className="block max-w-xs text-xs text-foreground-muted">
                        Custom average game size (GB)
                        <input
                          type="number"
                          min={0.5}
                          max={500}
                          step={1}
                          value={profile.gamesProfile.customGameSizeGb}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              gamesProfile: {
                                ...prev.gamesProfile,
                                customGameSizeGb: Math.max(
                                  0.5,
                                  Number(e.target.value) || 35
                                ),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm text-foreground"
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* Apps & Documents Advanced */}
                {(profile.selectedCategories.includes("apps") ||
                  profile.selectedCategories.includes("documents")) && (
                  <div className="grid grid-cols-1 gap-4 border-t border-border-subtle pt-4 sm:grid-cols-2">
                    {profile.selectedCategories.includes("apps") && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">
                          Apps
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block text-xs text-foreground-muted">
                            App count
                            <input
                              type="number"
                              min={0}
                              max={2000}
                              value={profile.appsProfile.appCount}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  appsProfile: {
                                    ...prev.appsProfile,
                                    useDefaultEstimate: false,
                                    appCount: Math.max(
                                      0,
                                      Number(e.target.value) || 0
                                    ),
                                  },
                                }))
                              }
                              className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2.5 py-1.5 font-mono text-sm text-foreground"
                            />
                          </label>
                          <label className="block text-xs text-foreground-muted">
                            App profile
                            <select
                              value={profile.appsProfile.sizePreset}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  appsProfile: {
                                    ...prev.appsProfile,
                                    useDefaultEstimate: false,
                                    sizePreset: e.target.value as Exclude<
                                      AppSizePresetId,
                                      "dont_know"
                                    >,
                                  },
                                }))
                              }
                              className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2 py-1.5 text-sm text-foreground"
                            >
                              <option value="small">Light (~180 MB)</option>
                              <option value="typical">Typical (~450 MB)</option>
                              <option value="large">Heavy (~1.1 GB)</option>
                              <option value="custom">Custom (MB)</option>
                            </select>
                          </label>
                        </div>
                        {profile.appsProfile.sizePreset === "custom" && (
                          <label className="block text-xs text-foreground-muted">
                            Custom average app size (MB)
                            <input
                              type="number"
                              min={10}
                              max={25000}
                              value={profile.appsProfile.customAppSizeMb}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  appsProfile: {
                                    ...prev.appsProfile,
                                    useDefaultEstimate: false,
                                    customAppSizeMb: Math.max(
                                      10,
                                      Number(e.target.value) || 450
                                    ),
                                  },
                                }))
                              }
                              className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2.5 py-1.5 font-mono text-sm text-foreground"
                            />
                          </label>
                        )}
                      </div>
                    )}

                    {profile.selectedCategories.includes("documents") && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">
                          Documents
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block text-xs text-foreground-muted">
                            File count
                            <input
                              type="number"
                              min={0}
                              max={5000000}
                              value={profile.documentsProfile.fileCount}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  documentsProfile: {
                                    ...prev.documentsProfile,
                                    fileCount: Math.max(
                                      0,
                                      Number(e.target.value) || 0
                                    ),
                                  },
                                }))
                              }
                              className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2.5 py-1.5 font-mono text-sm text-foreground"
                            />
                          </label>
                          <label className="block text-xs text-foreground-muted">
                            File type mix
                            <select
                              value={profile.documentsProfile.sizePreset}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  documentsProfile: {
                                    ...prev.documentsProfile,
                                    sizePreset: e.target
                                      .value as DocumentSizePresetId,
                                  },
                                }))
                              }
                              className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2 py-1.5 text-sm text-foreground"
                            >
                              <option value="mostly_small">Mostly small (~0.8 MB)</option>
                              <option value="mixed">Mixed files (~3.5 MB)</option>
                              <option value="large">Large files (~15 MB)</option>
                              <option value="custom">Custom (MB)</option>
                            </select>
                          </label>
                        </div>
                        {profile.documentsProfile.sizePreset === "custom" && (
                          <label className="block text-xs text-foreground-muted">
                            Custom average file size (MB)
                            <input
                              type="number"
                              min={0.1}
                              max={2000}
                              step={0.5}
                              value={profile.documentsProfile.customFileSizeMb}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  documentsProfile: {
                                    ...prev.documentsProfile,
                                    customFileSizeMb: Math.max(
                                      0.1,
                                      Number(e.target.value) || 3.5
                                    ),
                                  },
                                }))
                              }
                              className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2.5 py-1.5 font-mono text-sm text-foreground"
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Other Files & Backups Advanced */}
                {profile.selectedCategories.includes("other") && (
                  <div className="space-y-3 border-t border-border-subtle pt-4">
                    <p className="text-xs font-semibold text-foreground">
                      Other files, downloads &amp; backups
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <label className="block text-xs text-foreground-muted">
                        Archive / downloads profile
                        <select
                          value={profile.otherProfile.preset}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              otherProfile: {
                                ...prev.otherProfile,
                                preset: e.target.value as OtherFilesPresetId,
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-border-subtle bg-background px-2.5 py-1.5 text-sm text-foreground"
                        >
                          <option value="light">Small buffer (~15 GB + 0.4 GB/mo)</option>
                          <option value="moderate">Moderate archive (~50 GB + 1 GB/mo)</option>
                          <option value="heavy">Large backups/VMs (~150 GB + 2.5 GB/mo)</option>
                          <option value="custom">Custom amount (GB)</option>
                        </select>
                      </label>
                      {profile.otherProfile.preset === "custom" && (
                        <>
                          <label className="block text-xs text-foreground-muted">
                            Current other files (GB)
                            <input
                              type="number"
                              min={0}
                              max={100000}
                              value={profile.otherProfile.currentGb}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  otherProfile: {
                                    ...prev.otherProfile,
                                    currentGb: Math.max(
                                      0,
                                      Number(e.target.value) || 0
                                    ),
                                  },
                                }))
                              }
                              className="mt-1 w-full rounded-md border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm text-foreground"
                            />
                          </label>
                          <label className="block text-xs text-foreground-muted">
                            Monthly growth (GB / month)
                            <input
                              type="number"
                              min={0}
                              max={10000}
                              step={0.5}
                              value={profile.otherProfile.monthlyGrowthGb}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  otherProfile: {
                                    ...prev.otherProfile,
                                    monthlyGrowthGb: Math.max(
                                      0,
                                      Number(e.target.value) || 0
                                    ),
                                  },
                                }))
                              }
                              className="mt-1 w-full rounded-md border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm text-foreground"
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep(2);
                  scrollToTop();
                }}
              >
                &larr; Back
              </Button>
              <div className="flex items-center gap-4">
                <span className="hidden text-xs text-foreground-muted sm:inline">
                  Current estimate:{" "}
                  <strong className="font-semibold text-foreground tabular-nums">
                    {result.recommendedStorage.tier}
                  </strong>
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setStep(4);
                    scrollToTop();
                  }}
                >
                  Continue &rarr;
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: How long do you want this storage to last? */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                How long do you want this storage to last?
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                Photos, videos, and files add up over the years you keep your
                device or drive.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {(
                [
                  {
                    id: "1",
                    title: "1 year",
                    description: "Short-term plan",
                  },
                  {
                    id: "2",
                    title: "2 years",
                    description: "Frequent upgrade cycle",
                  },
                  {
                    id: "3",
                    title: "3 years",
                    description: "Typical phone or laptop lifespan",
                  },
                  {
                    id: "5",
                    title: "5 years",
                    description: "Keeping it for the long haul",
                  },
                ] as const
              ).map((item) => {
                const selected = profile.timeHorizon.preset === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      handleSelectHorizon(item.id);
                      setStep(5);
                      scrollToTop();
                    }}
                    className={`flex items-center justify-between gap-4 rounded-lg border p-4 text-left transition-colors cursor-pointer ${
                      selected
                        ? "border-accent-primary bg-accent-soft/60"
                        : "border-border-subtle bg-background hover:border-border-strong"
                    }`}
                  >
                    <div>
                      <span className="block text-sm font-semibold text-foreground sm:text-base">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-foreground-muted">
                        {item.description}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-accent-primary bg-accent-primary"
                          : "border-border-strong"
                      }`}
                    >
                      {selected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Optional Custom Years */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSelectHorizon("custom")}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  profile.timeHorizon.preset === "custom"
                    ? "border-accent-primary bg-accent-soft text-accent-primary"
                    : "border-border-subtle bg-background text-foreground-muted hover:text-foreground"
                }`}
              >
                Custom years
              </button>
              {profile.timeHorizon.preset === "custom" && (
                <label className="inline-flex items-center gap-2 text-xs text-foreground-muted">
                  <span>Years (1–25):</span>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={profile.timeHorizon.customYears}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        timeHorizon: {
                          preset: "custom",
                          customYears: Math.min(
                            25,
                            Math.max(1, Number(e.target.value) || 3)
                          ),
                        },
                      }))
                    }
                    className="w-20 rounded-md border border-border-subtle bg-background px-2.5 py-1 font-mono text-sm text-foreground"
                  />
                </label>
              )}
            </div>

            {/* Optional Current Storage Comparison */}
            <details className="group border-t border-border-subtle pt-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-foreground-muted hover:text-foreground">
                <span>Compare with your current storage (optional)</span>
                <span className="text-[10px] transition-transform group-open:rotate-180">
                  &#9662;
                </span>
              </summary>
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: "none", label: "None" },
                      { id: "64", label: "64 GB" },
                      { id: "128", label: "128 GB" },
                      { id: "256", label: "256 GB" },
                      { id: "512", label: "512 GB" },
                      { id: "1000", label: "1 TB" },
                      { id: "2000", label: "2 TB" },
                      { id: "4000", label: "4 TB" },
                      { id: "custom", label: "Custom" },
                    ] as { id: CurrentStoragePreset; label: string }[]
                  ).map((tier) => {
                    const active = profile.currentStorage.preset === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            currentStorage: {
                              ...prev.currentStorage,
                              preset: tier.id,
                            },
                          }))
                        }
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                          active
                            ? "border-accent-primary bg-accent-soft text-accent-primary"
                            : "border-border-subtle bg-background text-foreground-muted hover:text-foreground"
                        }`}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>
                {profile.currentStorage.preset === "custom" && (
                  <label className="block max-w-xs text-xs text-foreground-muted">
                    Current storage capacity (GB)
                    <input
                      type="number"
                      min={1}
                      max={100000}
                      value={profile.currentStorage.customGb}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          currentStorage: {
                            preset: "custom",
                            customGb: Math.max(1, Number(e.target.value) || 256),
                          },
                        }))
                      }
                      className="mt-1 w-full rounded-md border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm text-foreground"
                    />
                  </label>
                )}
              </div>
            </details>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep(3);
                  scrollToTop();
                }}
              >
                &larr; Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setStep(5);
                  scrollToTop();
                }}
              >
                See recommendation &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: Result Screen */}
        {step === 5 && (
          <ResultScreen
            result={result}
            onEditAnswers={() => {
              setStep(1);
              scrollToTop();
            }}
            onOpenAdvanced={() => {
              setAdvancedOpen(true);
              setStep(3);
              scrollToTop();
            }}
            onReset={handleReset}
            onCopyShareLink={handleCopyShareLink}
            copiedShareLink={copiedShareLink}
          />
        )}
      </div>
    </div>
  );
}
