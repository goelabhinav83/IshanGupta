import { awards, memberships, speakingEngagements } from "@/content/doctor";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

function Group({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-teal-900">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="border-l-2 border-teal-500/40 pl-4 text-base text-ink/85">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Awards() {
  return (
    <section id="awards" className="scroll-mt-20 bg-mist/50 py-14 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Recognition" title="Awards, memberships & speaking" />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
          <Group title="Awards" items={[...awards]} />
          <Group title="Memberships" items={[...memberships]} />
          <Group title="Speaking engagements" items={[...speakingEngagements]} />
        </div>
      </Container>
    </section>
  );
}
