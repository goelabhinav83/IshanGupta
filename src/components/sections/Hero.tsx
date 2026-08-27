import Image from "next/image";
import { doctor } from "@/content/doctor";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import BreathLine from "@/components/ui/BreathLine";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-mist/60">
      <Container className="grid grid-cols-1 items-center gap-10 py-14 sm:py-20 md:grid-cols-[1.15fr_0.85fr] md:gap-12 lg:py-24">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-teal-500 mb-4">
            {doctor.specialty}
          </p>
          <h1 className="text-4xl font-semibold leading-[1.08] text-teal-900 sm:text-5xl lg:text-6xl">
            Breathe easier, with expert care.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink/80">
            {doctor.name} — {doctor.tagline}. {doctor.experienceYears}+ years treating asthma,
            COPD, sleep apnea, and the full range of respiratory conditions.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as="a" href="#contact" variant="primary">
              Request Appointment
            </Button>
            <Button as="a" href="#about" variant="ghost">
              About Dr. Gupta
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-56 sm:w-64 md:w-full md:max-w-sm">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-teal-900/10 bg-paper shadow-xl shadow-teal-900/10">
            <Image
              src={doctor.photo}
              alt={`${doctor.name}, ${doctor.specialty}`}
              fill
              priority
              sizes="(min-width: 768px) 24rem, 16rem"
              className="object-cover"
            />
          </div>
        </div>
      </Container>

      <BreathLine className="h-8 text-teal-900/25" />
    </section>
  );
}
