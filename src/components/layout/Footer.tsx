import { contact, doctor } from "@/content/doctor";
import Container from "@/components/ui/Container";

export default function Footer() {
  return (
    <footer className="bg-teal-900 text-white/80">
      <Container className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base font-semibold text-white">{doctor.name}</p>
          <p className="text-sm text-white/70 mt-1">{doctor.specialty}</p>
        </div>
        <div className="flex flex-col gap-1 text-sm sm:text-right">
          <a href={`mailto:${contact.email}`} className="hover:text-white transition-colors">
            {contact.email}
          </a>
          <p className="text-white/60">{contact.fullAddress}</p>
        </div>
      </Container>
    </footer>
  );
}
