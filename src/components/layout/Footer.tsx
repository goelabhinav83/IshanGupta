import { contact, doctor } from "@/content/doctor";
import Container from "@/components/ui/Container";

export default function Footer() {
  return (
    <footer className="bg-teal-900 text-white/80">
      {/* The floating WhatsApp/chat stack is ~72px tall in the bottom-right
          corner, and at the end of the page there is nothing left to scroll —
          so without extra bottom padding the buttons sit permanently on top of
          the address line. Only needed while the stack is over the footer's
          single column; the desktop row keeps its original padding. */}
      <Container className="flex flex-col gap-4 pb-28 pt-10 sm:flex-row sm:items-center sm:justify-between sm:pb-10">
        <div>
          <p className="font-display text-base font-semibold text-white">{doctor.name}</p>
          <p className="text-sm text-white/70 mt-1">{doctor.specialty}</p>
        </div>
        {/* Stacked on a phone the two blocks ran together as one column of
            white-on-teal text; a hairline separates them without adding a
            second rule on the desktop row layout. */}
        <div className="flex flex-col gap-1 border-t border-white/15 pt-4 text-sm sm:border-t-0 sm:pt-0 sm:text-right">
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex min-h-11 items-center transition-colors hover:text-white sm:justify-end"
          >
            {contact.email}
          </a>
          <p className="text-white/70">{contact.fullAddress}</p>
        </div>
      </Container>
    </footer>
  );
}
