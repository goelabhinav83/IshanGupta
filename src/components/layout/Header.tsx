"use client";

import { useEffect, useState } from "react";
import { doctor, navLinks } from "@/content/doctor";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function Header() {
  const [open, setOpen] = useState(false);

  // Escape closes the mobile menu, matching the chat widget's behaviour.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-teal-900/10">
      <Container className="flex items-center justify-between py-3.5">
        <a href="#top" className="font-display text-lg font-semibold text-teal-900">
          {doctor.name}
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/80 hover:text-teal-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button as="a" href="#contact" variant="primary" className="!px-5 !py-2.5">
            Request Appointment
          </Button>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden -mr-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-teal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-900"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </Container>

      {open && (
        <div className="md:hidden border-t border-teal-900/10 bg-paper">
          <Container className="flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink/85 hover:bg-mist"
              >
                {link.label}
              </a>
            ))}
            <Button
              as="a"
              href="#contact"
              variant="primary"
              onClick={() => setOpen(false)}
              className="mt-2 w-full"
            >
              Request Appointment
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}
