"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HEADER_NAV_LINKS } from "@/lib/storage/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BrandMarkIcon } from "@/components/ui/Icons";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-background/95 backdrop-blur-xs">
      <Container size="wide">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary rounded-xs"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle bg-surface text-foreground">
              <BrandMarkIcon className="h-4 w-4" />
            </span>
            <span>Storage Reality</span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden sm:flex sm:items-center sm:gap-6"
          >
            {HEADER_NAV_LINKS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary rounded-xs ${
                    isActive
                      ? "font-medium text-foreground"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <ButtonLink
              href="/calculator"
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Calculate
            </ButtonLink>

            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-primary-nav"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary sm:hidden cursor-pointer"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" x2="20" y1="7" y2="7" />
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="17" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </Container>

      {mobileMenuOpen && (
        <div
          id="mobile-primary-nav"
          className="border-t border-border-subtle bg-surface sm:hidden"
        >
          <Container size="wide" className="py-4">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {HEADER_NAV_LINKS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-md px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-surface-subtle font-medium text-foreground"
                        : "text-foreground-muted hover:bg-surface-subtle hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 pt-2 border-t border-border-subtle">
                <ButtonLink
                  href="/calculator"
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Calculate
                </ButtonLink>
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
