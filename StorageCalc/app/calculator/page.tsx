import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { StorageCalculator } from "@/components/calculator/StorageCalculator";

export const metadata: Metadata = {
  title: {
    absolute: "Storage Calculator — How Much Storage Do You Need?",
  },
  description:
    "Answer a few simple questions to find out how much storage you actually need for your phone, laptop, games, photos, or video.",
  alternates: {
    canonical: "/calculator",
  },
};

export default function CalculatorPage() {
  return (
    <section
      aria-labelledby="calculator-page-heading"
      className="py-8 sm:py-12"
    >
      <Container size="default">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h1
              id="calculator-page-heading"
              className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
            >
              Storage Reality Calculator
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Estimate your real storage needs in four quick steps.
            </p>
          </div>
          <Link
            href="/methodology"
            className="text-xs font-medium text-foreground-muted hover:text-foreground"
          >
            How this model works &rarr;
          </Link>
        </div>

        <StorageCalculator />
      </Container>
    </section>
  );
}
