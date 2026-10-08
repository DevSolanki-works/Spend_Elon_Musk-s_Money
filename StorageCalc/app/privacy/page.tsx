import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for Storage Reality.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <section aria-labelledby="privacy-heading" className="py-12 sm:py-18">
      <Container size="narrow">
        <h1
          id="privacy-heading"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Privacy
        </h1>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-foreground-muted">
          <p>
            Storage Reality runs directly in your browser. Your calculator
            answers are not sent to a database or tied to an account.
          </p>
          <p>
            If you choose to share or bookmark your result, your answers are
            encoded in the page URL so you can reopen your plan anytime.
          </p>
        </div>
      </Container>
    </section>
  );
}
