import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for Storage Reality.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <section aria-labelledby="terms-heading" className="py-12 sm:py-18">
      <Container size="narrow">
        <h1
          id="terms-heading"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Terms of Use
        </h1>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-foreground-muted">
          <p>
            Storage Reality provides informational storage estimates based on
            typical file-size ranges and usage patterns. Real-world storage
            requirements vary depending on device settings, software updates,
            and usage changes over time.
          </p>
        </div>
      </Container>
    </section>
  );
}
