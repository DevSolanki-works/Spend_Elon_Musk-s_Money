import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Storage Reality.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <section aria-labelledby="contact-heading" className="py-12 sm:py-18">
      <Container size="narrow">
        <h1
          id="contact-heading"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Contact
        </h1>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-foreground-muted">
          <p>
            Have feedback on our storage calculator or calculation methodology?
            We welcome questions and suggestions as we expand our storage tools.
          </p>
        </div>
      </Container>
    </section>
  );
}
