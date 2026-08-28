import Image from "next/image";
import { doctor } from "@/content/doctor";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import BreathLine from "@/components/ui/BreathLine";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-mist/60">
      {/*
        Three children rather than two, so the phone gets a different reading
        order than the desktop without duplicating the portrait. In one column
        the DOM order runs headline → portrait → supporting copy → CTAs, which
        puts Dr. Gupta's face on the first screen; previously it sat below both
        buttons, roughly a full scroll down. From md up the explicit row/column
        placement rebuilds the original two-column layout.
      */}
      <Container className="grid grid-cols-1 items-center gap-x-12 gap-y-7 py-12 sm:py-20 md:grid-cols-[1.15fr_0.85fr] md:items-center lg:py-24">
        <div className="md:col-start-1 md:row-start-1 md:self-end">
          <p className="mb-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-teal-500 sm:mb-4 sm:text-xs sm:tracking-[0.2em]">
            {doctor.specialty}
          </p>
          <h1 className="text-[2.125rem] font-semibold leading-[1.08] text-teal-900 sm:text-5xl lg:text-6xl">
            Breathe easier, with expert care.
          </h1>
        </div>

        <div className="mx-auto w-48 md:col-start-2 md:row-span-2 md:row-start-1 md:w-full md:max-w-sm md:self-center">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-teal-900/10 bg-paper shadow-xl shadow-teal-900/10">
            <Image
              src={doctor.photo}
              alt={`${doctor.name}, ${doctor.specialty}`}
              fill
              priority
              sizes="(min-width: 768px) 24rem, 12rem"
              className="object-cover"
            />
          </div>
        </div>

        <div className="md:col-start-1 md:row-start-2 md:self-start">
          <p className="max-w-xl text-lg leading-relaxed text-ink/80">
            {doctor.name} — {doctor.tagline}. {doctor.experienceYears}+ years treating asthma,
            COPD, sleep apnea, and the full range of respiratory conditions.
          </p>
          {/*
            One clear action on a phone. The secondary route stays available as
            a quiet link rather than a second full-width slab, which previously
            read as an equal-weight choice against the actual conversion.
          */}
          <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-3">
            <Button as="a" href="#contact" variant="primary" className="w-full sm:w-auto">
              Request Appointment
            </Button>
            {/*
              One element, restyled at the breakpoint rather than two rendered
              in parallel — a `hidden sm:inline-flex` pair both duplicates the
              link for screen readers and leaves the winner up to stylesheet
              order, since `hidden` and `inline-flex` set the same property.
            */}
            <a
              href="#about"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium tracking-wide text-teal-900 underline decoration-teal-900/25 underline-offset-4 transition-colors hover:decoration-teal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900 sm:min-h-0 sm:rounded-full sm:border sm:border-teal-900/25 sm:px-6 sm:py-3 sm:no-underline sm:hover:bg-mist"
            >
              About Dr. Gupta
              <span aria-hidden="true" className="sm:hidden">
                →
              </span>
            </a>
          </div>
        </div>
      </Container>

      <BreathLine className="h-8 text-teal-900/25" />
    </section>
  );
}
