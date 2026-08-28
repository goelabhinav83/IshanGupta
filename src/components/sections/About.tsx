import { bio, doctor } from "@/content/doctor";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-teal-500">
        {label}
      </dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 py-14 sm:py-24">
      <Container className="grid grid-cols-1 gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
        <div>
          <SectionHeading eyebrow="About" title="A patient-centric approach to lung health" />
          {/*
            Two columns on a phone rather than four stacked pairs: these are
            short scannable facts, and stacking them spent roughly 340px above
            the bio. Boxing them also separates the credentials from the prose
            that follows, which previously ran together as one column of text.

            Labels keep the mono/tracked eyebrow treatment used by every other
            section heading; the values are body sans. Monospace values were
            roughly 25% wider per character, which pushed "MBBS, DNB
            (Respiratory Diseases)" onto three ragged lines against a
            single-line neighbour and left the two columns visibly uneven.
          */}
          <dl className="grid grid-cols-2 gap-x-5 gap-y-5 rounded-2xl bg-mist/50 p-5 text-[0.9375rem] leading-snug text-ink/80 md:grid-cols-1 md:bg-transparent md:p-0">
            <Fact label="Qualifications" value={doctor.credentials} />
            <Fact label="Experience" value={`${doctor.experienceYears}+ years`} />
            <Fact label="Affiliation" value={doctor.hospital} />
            <Fact label="Languages" value={doctor.languages.join(", ")} />
          </dl>
        </div>

        {/*
          The bio is roughly 900px of unbroken prose on a phone. Setting the
          opening paragraph a step larger and at full ink gives the block an
          entry point, so it reads as an article rather than one flat slab.
        */}
        <div className="space-y-5 text-base leading-relaxed text-ink/80 sm:text-[1.05rem]">
          {bio.map((paragraph, i) => (
            <p key={i} className={i === 0 ? "text-[1.0625rem] text-ink sm:text-[1.15rem]" : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}
