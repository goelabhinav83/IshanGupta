import { contact, whatsappPrefilledMessage } from "@/content/doctor";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactForm from "@/components/ContactForm";

export default function Contact() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(contact.fullAddress)}&output=embed`;
  const waHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(whatsappPrefilledMessage)}`;

  return (
    <section id="contact" className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Contact" title="Request an appointment" />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="space-y-6">
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

              <div className="mt-5 flex flex-col gap-3 font-mono text-sm">
                <a href={`mailto:${contact.email}`} className="text-teal-500 hover:text-teal-900">
                  {contact.email}
                </a>
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-900">
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
                className="block"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-paper p-6 shadow-sm shadow-teal-900/5 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
