import Link from "next/link";
import { FOOTER_LINKS } from "@/lib/storage/navigation";
import { Container } from "@/components/ui/Container";
import { BrandMarkIcon } from "@/components/ui/Icons";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface/60 py-10 text-sm text-foreground-muted">
      <Container size="wide">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold text-foreground hover:opacity-80"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border-subtle bg-surface text-foreground">
                <BrandMarkIcon className="h-3.5 w-3.5" />
              </span>
              <span>Storage Reality</span>
            </Link>
            <p className="mt-1.5 text-xs text-foreground-subtle">
              Practical storage capacity planning for phones, laptops, gaming, camera libraries, and cloud backups.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
