import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how Storage Reality helps you figure out how much digital storage you actually need.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <section aria-labelledby="about-heading" className="py-12 sm:py-18">
      <Container size="narrow">
        <h1
          id="about-heading"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          About Storage Reality
        </h1>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground-muted">
          <p>
            Storage Reality helps you figure out how much storage you actually
            need when buying a phone, laptop, SSD, SD card, or cloud plan.
          </p>
          <p>
            You shouldn&apos;t have to understand megabytes, bitrates, codecs,
            or storage overhead just to decide between 128 GB, 256 GB, 512 GB,
            and 1 TB. You answer a few normal questions about how you use your
            device, and the calculator handles the math behind the scenes.
          </p>
          <p>
            For anyone who wants to inspect the exact file-size ranges, headroom
            rules, and external sources we use, everything is documented openly
            on our{" "}
            <Link
              href="/methodology"
              className="font-medium text-accent-primary hover:underline"
            >
              calculation methodology
            </Link>{" "}
            page.
          </p>
        </div>

        <div className="mt-8">
          <ButtonLink href="/calculator" variant="primary" size="md">
            Calculate my storage
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
