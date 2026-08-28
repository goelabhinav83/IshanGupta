import { contact, whatsappPrefilledMessage } from "@/content/doctor";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactForm from "@/components/ContactForm";

export default function Contact() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(contact.fullAddress)}&z=16&output=embed`;
  const waHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(whatsappPrefilledMessage)}`;

  return (
    <section id="contact" className="scroll-mt-20 py-14 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Contact" title="Request an appointment" />

        {/*
          The section's job is the appointment request, and every CTA on the
          page scrolls here — so on a phone the form comes first and the clinic
          details and map follow. On desktop there is room side by side and the
          details keep their original left-hand position.
        */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="order-2 space-y-6 lg:order-1">
            <div className="rounded-2xl bg-mist/60 p-6 sm:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-900">
                {contact.clinicName}
              </h3>
              <address className="mt-2 not-italic text-base leading-relaxed text-ink/85">
                {contact.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>

              <p className="mt-4 text-sm text-ink/70">
                <span className="font-medium text-ink/85">Office Hours: </span>
                {contact.officeHours}
              </p>

              <div className="mt-4 flex flex-col font-mono text-sm">
                <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center text-teal-900 underline decoration-teal-900/30 underline-offset-2 hover:decoration-teal-900">
                  {contact.email}
                </a>
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-teal-900 underline decoration-teal-900/30 underline-offset-2 hover:decoration-teal-900">
                  {contact.whatsappDisplay} (WhatsApp)
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-teal-900/10">
              <iframe
                title={`Map to ${contact.clinicName}`}
                src={mapSrc}
                width="100%"
                height="280"
                loading="lazy"
                className="block h-56 w-full sm:h-[280px]"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="order-1 rounded-2xl border border-teal-900/10 bg-paper p-6 shadow-sm shadow-teal-900/5 sm:p-8 lg:order-2">
            <ContactForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
