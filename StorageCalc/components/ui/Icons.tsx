import React from "react";
import type { StorageCategoryId } from "@/lib/calculator/types";

export type PurposeIconId =
  | "phone"
  | "laptop"
  | "gaming"
  | "photography"
  | "video"
  | "cloud"
  | "other";

interface IconProps {
  className?: string;
}

export function PurposeIcon({
  id,
  className = "h-5 w-5",
}: {
  id: PurposeIconId;
  className?: string;
}) {
  switch (id) {
    case "phone":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
          <path d="M10.5 5.5h3" />
          <circle cx="12" cy="18" r="0.8" fill="currentColor" />
        </svg>
      );
    case "laptop":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3.5" y="4.5" width="17" height="11.5" rx="1.8" />
          <path d="M2 19h20" />
        </svg>
      );
    case "gaming":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="2.5" y="6.5" width="19" height="11" rx="4.5" />
          <path d="M7 12h4" />
          <path d="M9 10v4" />
          <circle cx="15.5" cy="11" r="0.9" fill="currentColor" />
          <circle cx="17.5" cy="13" r="0.9" fill="currentColor" />
        </svg>
      );
    case "photography":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M4.5 7.5h3l1.5-2h6l1.5 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13" r="3.2" />
        </svg>
      );
    case "video":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="m16 10.5 5-2.5v8l-5-2.5v-3Z" />
        </svg>
      );
    case "cloud":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M6.5 18.5h11a4 4 0 0 0 .7-7.94A5.5 5.5 0 0 0 7.4 9.2 4.5 4.5 0 0 0 6.5 18.5Z" />
        </svg>
      );
    case "other":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3.5" y="5" width="17" height="14" rx="2" />
          <path d="M3.5 13h17" />
          <circle cx="7.5" cy="16" r="0.9" fill="currentColor" />
          <circle cx="11" cy="16" r="0.9" fill="currentColor" />
        </svg>
      );
  }
}

export function CategoryIcon({
  category,
  className = "h-4 w-4",
}: {
  category: StorageCategoryId;
  className?: string;
}) {
  switch (category) {
    case "photos":
      return <PurposeIcon id="photography" className={className} />;
    case "videos":
      return <PurposeIcon id="video" className={className} />;
    case "games":
      return <PurposeIcon id="gaming" className={className} />;
    case "apps":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "documents":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5l-5-5Z" />
          <path d="M14 3.5v5h5" />
          <path d="M9 13h6" />
          <path d="M9 16.5h4" />
        </svg>
      );
    case "other":
      return <PurposeIcon id="other" className={className} />;
  }
}

export function BrandMarkIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="6.5" rx="1.5" />
      <rect x="3" y="13.5" width="18" height="6.5" rx="1.5" />
      <circle cx="7" cy="7.25" r="0.9" fill="currentColor" />
      <circle cx="7" cy="16.75" r="0.9" fill="currentColor" />
      <path d="M11 7.25h6" />
      <path d="M11 16.75h4" />
    </svg>
  );
}
