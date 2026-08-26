# Dr. Ishan Gupta — Doctor Website

## Project Overview

A professional marketing/informational website for **Dr. Ishan Gupta**, a Pulmonology &
Respiratory Medicine specialist practicing at Apollo Hospitals, New Delhi. The site's job is
to build credibility with prospective patients, communicate his expertise clearly, and make it
easy to get in touch / book a consultation. This is a content-driven brochure site, not a
patient portal or booking system — no accounts, no PHI, no medical records.

Source content for the site lives in `Docs/Artifacts/` (bio, publications, awards docx files,
and a headshot photo). Treat those as the raw source of truth; copy/adapt their text into
structured content within the app rather than parsing docx at runtime.

## Doctor Profile (source: `Docs/Artifacts/About Dr Ishan.docx`)

- **Name:** Dr. Ishan Gupta
- **Specialty:** Pulmonology & Respiratory Medicine
- **Location / Affiliation:** Apollo Hospitals, New Delhi
- **Experience:** 10+ years
- **Qualifications:** MBBS, DNB (Respiratory Diseases)
- **Conditions treated:** Asthma, COPD, Tuberculosis, Sarcoidosis, Pneumonia, Lung fibrosis (ILD)
- **Procedures:** Bronchoscopy, EBUS, Thoracocentesis, Lung Biopsy, critical care / ICU /
  ventilator management
- **Special interest:** Sleep Apnea (has spoken at national conferences on this topic)
- **Languages spoken:** English, Hindi, Punjabi
- **Approach:** Patient-centric, personalized treatment plans, described as compassionate and
  communicative

## Publications (source: `Docs/Artifacts/Publications.docx`)

- Disseminated Histoplasmosis in a patient with Rheumatoid Arthritis and Interstitial Lung
  Disease
- Sarcoidosis: An Unusual Case of Pleural Effusion — *Medical Science*, India, Vol. 9, Issue 10,
  pp. 1736–1737, December 2020
- Post-trauma Deep-Seated Cutaneous Mucormycosis with Secondary Bacterial Infection and
  Multiorgan Failure in a Diabetic Patient — *International Journal of Scientific Research*,
  Vol. 9, Issue 12, December 2020
- Ahlawat A, Modi N, Gupta I. "Antidepressant-induced Acute Respiratory Distress Syndrome:
  Unraveling Sertraline's Role in Acute Lung Injury." *Indian J Chest Dis Allied Sci*, 2026
- Additional publications/articles in various national and international journals

## Awards & Recognition (source: `Docs/Artifacts/Awards and Reco.docx`)

- APJ Abdul Kalam Award for Service Excellence in Pulmonology (Doctor's Day)
- Member, Indian Chest Society
- Member, European Respiratory Society
- Member, Chest Journal
- Speaker, NCCP Meet — "Solitary Pulmonary Nodule"
- Speaker, CNBC Awaaz — Sleep Hygiene
- Speaker at multiple national conferences

## Assets

- `Docs/Artifacts/Photo.jpeg` — professional headshot (white background, suitable for hero/about
  sections; may want a second lifestyle/clinic photo eventually but not required for launch)

## Information Architecture

Single-page or lightly-multi-page site (TBD during build, single-page scroll is likely
sufficient for this amount of content):

1. **Home / Hero** — photo, name, title, one-line positioning ("Pulmonology & Respiratory
   Medicine Specialist, Apollo Hospitals"), primary CTA (Book Appointment / Contact)
2. **About** — full bio, qualifications, experience, languages, approach to care
3. **Expertise** — conditions treated + procedures performed, called out as scannable lists;
   Sleep Apnea called out as a special interest
4. **Publications** — list of papers, formatted as citations
5. **Awards & Recognition** — awards, memberships, speaking engagements
6. **Contact** — clinic location (Apollo Hospitals, New Delhi), contact form or phone/email,
   map embed if address is available

Persistent across all pages (not standalone sections): a floating **AI chat widget** and a
**WhatsApp click-to-chat button**, both described below.

## AI Chat Assistant

**Scope: Practice FAQ assistant only** — decided to avoid the liability of a doctor's site
appearing to give medical advice or diagnoses.

- Answers questions about Dr. Gupta's background, qualifications, conditions treated, procedures
  offered, languages spoken, clinic location/hours, and how to book — i.e. only what's in the
  site's own content.
- System prompt explicitly instructs the model to **decline** any request for diagnosis, symptom
  interpretation, or treatment advice, and to redirect those to "please book a consultation or
  message us on WhatsApp" instead.
- No patient health data should be collected or stored through this chat — keep it stateless
  (no conversation history persisted server-side) to avoid PHI-handling obligations.
- Implementation: a small chat widget (floating button, bottom-right) backed by a Next.js API
  route that calls the Claude API with a fixed system prompt containing the site content as
  context. Reference the `claude-api` skill when implementing the API call (models, streaming,
  system prompts).
- Needs an Anthropic API key added as an environment variable / secret before this can go live —
  not something to commit to the repo.

## WhatsApp Integration

**Scope: click-to-chat button only** — a `wa.me` link, not the WhatsApp Business API.

- A persistent "Chat on WhatsApp" button (floating, alongside or near the AI chat widget) that
  opens `https://wa.me/<number>?text=<prefilled message>` in a new tab.
- No backend, no approval process, no per-message cost — just needs Dr. Gupta's WhatsApp
  Business number (see Open Information Needed below).
- If automated WhatsApp replies are wanted later, that's a separate, larger effort (Meta
  Business verification + a provider like Twilio) — explicitly deferred, not part of this build.

## Open Information Needed From User Before Launch

Not present in the source docs — need to collect before the Contact section is real:
- Phone number and/or email for the practice
- Exact Apollo Hospitals branch/address in Delhi (there are multiple Apollo locations)
- Whether there's an existing booking system/link to integrate (e.g. Apollo's own portal) or if
  a simple contact form is sufficient
- Any social/professional profile links (LinkedIn, Practo, etc.) to link out to
- Domain name preference, if one is already owned
- **WhatsApp Business number** for the click-to-chat button
- **Anthropic API key** for the AI chat assistant (can be added later, but chat won't function
  without it)

## Tech Stack (decided)

A website-builder platform (WordPress/Squarespace) was considered but ruled out — the AI chat
assistant needs a real backend API route, which those platforms don't support cleanly.

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Content:** structured local content (e.g. `content/doctor.ts`) rather than a CMS — the
  content is small, static, and changes rarely; no CMS overhead needed
- **Contact form:** static form posting to a hosted form service (e.g. Formspree) to avoid
  needing a backend for this specific piece; `mailto:`/tel: links as a fallback
- **AI chat backend:** Next.js API route calling the Claude API (see AI Chat Assistant section)
- **WhatsApp:** client-side `wa.me` link, no backend needed
- **Hosting:** Vercel (pairs naturally with Next.js, supports API routes, free tier is
  sufficient for this traffic profile)
- **Images:** `next/image` for the headshot and any future photos

## Design Direction

- Tone: clinical trust + warmth — clean, uncluttered, whitespace-forward, not "salesy"
- Color palette: calm, medical-adjacent (blues/teals/whites), avoid alarming reds except
  sparingly for CTAs
- Typography: legible, professional serif or clean sans for headings; readable body text sized
  for an older/general-audience readership
- Mobile-first: most patients will land on this from a phone (search or referral link)
- Load `frontend-design` skill guidance when building the actual UI to avoid a templated,
  generic look

## Build Plan

1. **Scaffold** — Next.js + TypeScript + Tailwind project at repo root (alongside `Docs/`)
2. **Content layer** — transcribe bio/publications/awards into structured content files
3. **Static pages/sections** — build Home, About, Expertise, Publications, Awards, Contact
   sections per the IA above, using the headshot from `Docs/Artifacts/Photo.jpeg`
4. **Contact form** — wire up once contact details are confirmed with the user
5. **WhatsApp button** — floating click-to-chat button once the WhatsApp number is provided
6. **AI chat widget** — floating widget + API route once the Anthropic API key is available;
   test that it correctly declines medical-advice questions and redirects appropriately
7. **Responsive + accessibility pass** — verify mobile layout, color contrast, alt text
8. **Deploy** — connect to Vercel (or chosen host), verify production build, confirm API key is
   set as an environment variable there (not committed to the repo)
9. **SEO basics** — meta title/description, Open Graph image (headshot), local business
   structured data (Apollo Hospitals address) once address is confirmed

## Working Notes

- No git repo initialized yet — `git init` before first commit.
- Root of this directory (`IshanGupta/`) will hold the actual app code once scaffolded;
  `Docs/` stays as reference source material only, not part of the deployed site.
