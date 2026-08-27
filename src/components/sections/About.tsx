import { bio, doctor } from "@/content/doctor";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 py-16 sm:py-24">
      <Container className="grid grid-cols-1 gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading eyebrow="About" title="A patient-centric approach to lung health" />
          <dl className="space-y-4 font-mono text-sm text-ink/75">
            <div>
              <dt className="text-teal-500">Qualifications</dt>
              <dd>{doctor.credentials}</dd>
            </div>
            <div>
              <dt className="text-teal-500">Experience</dt>
              <dd>{doctor.experienceYears}+ years</dd>
            </div>
            <div>
              <dt className="text-teal-500">Affiliation</dt>
              <dd>{doctor.hospital}</dd>
            </div>
            <div>
              <dt className="text-teal-500">Languages</dt>
              <dd>{doctor.languages.join(", ")}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-5 text-base leading-relaxed text-ink/85 sm:text-[1.05rem]">
          {bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </Container>
    </section>
  );
}
