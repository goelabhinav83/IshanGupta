import { conditionsTreated, procedures, specialInterest } from "@/content/doctor";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * Chips rather than one-per-row bullets. Most of these entries are a single
 * word ("Asthma", "COPD", "EBUS"), so a stacked list spent a full 44px row on
 * each and pushed the section well past a phone screen; wrapping them inline
 * fits two or three per row and scans faster. Kept at 16px with generous
 * padding for the older readership this site is written for.
 */
function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-teal-900/10 bg-mist/70 px-3.5 py-2 text-base leading-snug text-ink/85"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Expertise() {
  return (
    <section id="expertise" className="scroll-mt-20 bg-mist/50 py-14 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Expertise" title="Conditions treated & procedures performed" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          <div className="rounded-2xl border border-teal-900/10 bg-paper p-6 shadow-sm shadow-teal-900/5 sm:p-8">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-teal-900">
              Conditions treated
            </h3>
            <List items={conditionsTreated} />
          </div>

          <div className="rounded-2xl border border-teal-900/10 bg-paper p-6 shadow-sm shadow-teal-900/5 sm:p-8">
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
