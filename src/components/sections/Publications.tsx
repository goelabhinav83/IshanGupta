import { publications } from "@/content/doctor";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Publications() {
  return (
    <section id="publications" className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Publications" title="Research & case reports" />

        <ol className="space-y-6">
          {publications.map((pub, i) => (
            <li key={i} className="border-b border-teal-900/10 pb-6 last:border-b-0 last:pb-0">
              <p className="text-base font-medium leading-snug text-ink">{pub.title}</p>
              {(pub.authors || pub.journal) && (
                <p className="mt-2 font-mono text-xs leading-relaxed text-teal-500">
                  {[pub.authors, pub.journal, pub.volume && `Vol. ${pub.volume}`, pub.issue && `Issue ${pub.issue}`, pub.pages, pub.year]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
