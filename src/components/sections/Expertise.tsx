import { conditionsTreated, procedures, specialInterest } from "@/content/doctor";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-base text-ink/85">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Expertise() {
  return (
    <section id="expertise" className="scroll-mt-20 bg-mist/50 py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Expertise" title="Conditions treated & procedures performed" />

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div className="rounded-2xl bg-paper p-6 shadow-sm shadow-teal-900/5 sm:p-8">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-teal-900">
              Conditions treated
            </h3>
            <List items={conditionsTreated} />
          </div>

          <div className="rounded-2xl bg-paper p-6 shadow-sm shadow-teal-900/5 sm:p-8">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-teal-900">
              Procedures performed
            </h3>
            <List items={procedures} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-coral/25 bg-coral/5 p-6 sm:flex-row sm:items-center sm:gap-5 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-coral">
            Special interest
          </p>
          <p className="text-base text-ink/85">
            <span className="font-semibold text-teal-900">{specialInterest.title}</span> —{" "}
            {specialInterest.description}
          </p>
        </div>
      </Container>
    </section>
  );
}
