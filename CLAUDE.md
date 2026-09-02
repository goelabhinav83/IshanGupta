# Dr. Ishan Gupta — Doctor Website

## Project Overview

A professional marketing/informational website for **Dr. Ishan Gupta**, a Pulmonology &
Respiratory Medicine specialist practicing at Apollo Hospitals, New Delhi. The site's job is
to build credibility with prospective patients, communicate his expertise clearly, and make it
easy to get in touch / book a consultation. This is a content-driven brochure site, not a
patient portal or booking system — no accounts, no PHI, no medical records.

Source content for the site lives directly in `Docs/` — `Information.txt` (bio, awards,
publications, and contact info) and `Photo.jpeg` (headshot). These replaced an earlier
`Docs/Artifacts/` folder of separate .docx files, which has been removed. Treat `Information.txt`
as the raw source of truth; copy/adapt its text into structured content within the app rather
than parsing it at runtime.

## Doctor Profile (source: `Docs/Information.txt`)

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

## Publications (source: `Docs/Information.txt`)

- Disseminated Histoplasmosis in a patient with Rheumatoid Arthritis and Interstitial Lungs
- Sarcoidosis: An Unusual Case of Pleural Effusion — *Medical Science*, India, Vol. 9, Issue 10,
  pp. 1736–1737, December 2020
- Post-trauma Deep-Seated Cutaneous Mucormycosis with Secondary Bacterial Infection and
  Multiorgan Failure in a Diabetic Patient — *International Journal of Scientific Research*,
  Vol. 9, Issue 12, December 2020
- Ahlawat A, Modi N, Gupta I. "Antidepressant-induced Acute Respiratory Distress Syndrome:
  Unraveling Sertraline's Role in Acute Lung Injury." *Indian J Chest Dis Allied Sci*, 2026
- Additional publications/articles in various national and international journals

## Awards & Recognition (source: `Docs/Information.txt`)

- APJ Abdul Kalam Award for Service Excellence in Pulmonology (Doctor's Day)
- Member, Indian Chest Society
- Member, European Respiratory Society
- Member, Chest Journal
- Speaker, NCCP Meet — "Solitary Pulmonary Nodule"
- Speaker, CNBC Awaaz — Sleep Hygiene
- Speaker at multiple national conferences

## Assets

- `Docs/Photo.jpeg` — professional headshot (white background, suitable for hero/about
  sections; may want a second lifestyle/clinic photo eventually but not required for launch)

## Contact Information (source: `Docs/Information.txt`)

- **WhatsApp:** +91 8076674364
- **Email:** dr.ishangupta90@gmail.com
- **Clinic address:** Cure Chest Clinic, SCO 71, Sector 28, HUDA Market, Faridabad
- **Office hours:** Monday – Saturday, 5 PM – 8 PM

> **Resolved:** the Contact section (and any local-business structured data) should use the
> Cure Chest Clinic, Faridabad address above. The bio's mention of "At Apollo Hospitals" refers
> to a hospital affiliation and stays in the About/bio text, but it is not the location used for
> contact/directions/booking.

## Information Architecture

Single-page or lightly-multi-page site (TBD during build, single-page scroll is likely
sufficient for this amount of content):

1. **Home / Hero** — photo, name, title, one-line positioning ("Pulmonology & Respiratory
   Medicine Specialist, Apollo Hospitals"), primary CTA ("Request Appointment", scrolls to Contact)
2. **About** — full bio, qualifications, experience, languages, approach to care
3. **Expertise** — conditions treated + procedures performed, called out as scannable lists;
   Sleep Apnea called out as a special interest
4. **Publications** — list of papers, formatted as citations
5. **Awards & Recognition** — awards, memberships, speaking engagements
6. **Contact** — clinic location (Cure Chest Clinic, Faridabad — see Contact Information
   section above), office hours (Monday – Saturday, 5 PM – 8 PM), an appointment-request form
   ("Request Appointment") or phone/email, map embed using this address. Submitting the form
   opens WhatsApp (via a `wa.me` link, see Tech Stack) with the visitor's details pre-filled as
   the message, rather than emailing Dr. Gupta or opening the visitor's own mail client. The
   visitor still has to tap Send inside WhatsApp — this is client-side only, no backend
   delivery.

Persistent across all pages (not standalone sections): a floating **AI chat widget** and a
**WhatsApp click-to-chat button**, both described below.

## AI Chat Assistant

**Scope: Practice FAQ assistant only** — decided to avoid the liability of a doctor's site
appearing to give medical advice or diagnoses.

- Answers questions about Dr. Gupta's background, qualifications, conditions treated, procedures
  offered, languages spoken, clinic location/hours, and how to book — i.e. only what's in the
  site's own content.
- System prompt explicitly instructs the model to **decline** any request for diagnosis, symptom
  interpretation, or treatment advice, and to redirect those to "please request an appointment or
  message us on WhatsApp" instead.
- No patient health data should be collected or stored through this chat — keep it stateless
  (no conversation history persisted server-side) to avoid PHI-handling obligations.
- Implementation: a small chat widget (floating button, bottom-right) backed by a Next.js API
  route that calls a model via **OpenRouter** (not the Anthropic API directly) with a fixed
  system prompt containing the site content as context.
- API key: `OPENROUTER_API_KEY` is already set in a local `.env` file (gitignored, not committed).
  Read it server-side only, inside the Next.js API route — never expose it to the client.
- OpenRouter uses an OpenAI-compatible chat completions format
  (`https://openrouter.ai/api/v1/chat/completions`); pick a specific model id to call (e.g. a
  Claude or other model available on OpenRouter) when implementing the route.

## WhatsApp Integration

**Scope: click-to-chat button only** — a `wa.me` link, not the WhatsApp Business API.

- A persistent "Chat on WhatsApp" button (floating, alongside or near the AI chat widget) that
  opens `https://wa.me/<number>?text=<prefilled message>` in a new tab.
- No backend, no approval process, no per-message cost — just needs Dr. Gupta's WhatsApp
  Business number (see Open Information Needed below).
- If automated WhatsApp replies are wanted later, that's a separate, larger effort (Meta
  Business verification + a provider like Twilio) — explicitly deferred, not part of this build.

## Open Information Needed From User Before Launch

Resolved by `Docs/Information.txt`:
- ~~Phone number and/or email~~ → dr.ishangupta90@gmail.com
- ~~WhatsApp Business number~~ → +91 8076674364
- ~~Clinic address~~ → Cure Chest Clinic, SCO 71, Sector 28, HUDA Market, Faridabad — confirmed
  as the address to use for the Contact section and local-business data

Resolved by the user:
- ~~Existing booking system to integrate~~ → none; a simple contact form is sufficient
- ~~Social/professional profile links~~ → none (no LinkedIn/Practo to link out to)
- ~~Domain name preference~~ → none; use the default `*.vercel.app` domain from Vercel hosting,
  no custom domain to configure

Resolved:
- ~~AI chat backend API key~~ → `OPENROUTER_API_KEY` added to local `.env` (gitignored); chat
  widget will call OpenRouter rather than the Anthropic API directly. This same key will need
  to be set as an environment variable in Vercel before the chat widget works in production.

## Tech Stack (decided)

A website-builder platform (WordPress/Squarespace) was considered but ruled out — the AI chat
assistant needs a real backend API route, which those platforms don't support cleanly.

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Content:** structured local content (e.g. `content/doctor.ts`) rather than a CMS — the
  content is small, static, and changes rarely; no CMS overhead needed
- **Contact form ("Request Appointment"):** client-side only, no backend route. On submit, the
  form builds a `wa.me/<number>?text=<encoded details>` link from the entered name, phone,
  email, and message, and opens it in a new tab via `window.open` — the visitor then taps Send
  inside WhatsApp to actually deliver it to Dr. Gupta. This replaced an earlier Gmail SMTP
  (nodemailer) implementation that emailed submissions directly to Dr. Gupta's email; that
  required `GMAIL_USER` / `GMAIL_APP_PASSWORD` env vars and a `/api/contact` route, both now
  removed. (Resend was tried even earlier and rejected — it requires a verified domain to send
  to anyone other than the Resend account owner's own email, which this no-custom-domain
  project doesn't have.) If `window.open` is blocked (popup blocker), the form falls back to
  showing a plain clickable `wa.me` link instead of failing silently.
- **AI chat backend:** Next.js API route calling a model via OpenRouter (see AI Chat Assistant
  section); `OPENROUTER_API_KEY` in `.env`, not the Anthropic API directly
- **WhatsApp:** client-side `wa.me` link, no backend needed
- **Hosting:** Vercel (pairs naturally with Next.js, supports API routes, free tier is
  sufficient for this traffic profile); no custom domain — ships on the default `*.vercel.app`
  domain
- **Images:** `next/image` for the headshot and any future photos

## Design Direction

- Tone: clinical trust + warmth — clean, uncluttered, whitespace-forward, not "salesy"
- Color palette: calm, medical-adjacent (blues/teals/whites), avoid alarming reds except
  sparingly for CTAs
- Typography: legible, professional serif or clean sans for headings; readable body text sized
  for an older/general-audience readership
- **Mobile-first, hard requirement:** most patients will land on this from a phone (search or
  referral link), so the site must render and look correct on mobile screen sizes, not just
  desktop. Every section (Hero, About, Expertise, Publications, Awards, Contact), the floating
  AI chat widget, and the floating WhatsApp button must be usable and visually correct at common
  phone viewport widths (~360–430px), not just scaled-down desktop layouts. Verify with an
  actual mobile-width browser check (e.g. dev tools device emulation) before considering any UI
  work done, not just by eyeballing a desktop viewport.
- Load `frontend-design` skill guidance when building the actual UI to avoid a templated,
  generic look

## Build Plan

1. **Scaffold** — Next.js + TypeScript + Tailwind project at repo root (alongside `Docs/`)
2. **Content layer** — transcribe bio/publications/awards into structured content files
3. **Static pages/sections** — build Home, About, Expertise, Publications, Awards, Contact
   sections per the IA above, using the headshot from `Docs/Photo.jpeg`
4. **Contact form ("Request Appointment")** — wire up using the confirmed contact details (Cure
   Chest Clinic address, email, WhatsApp — see Contact Information above); on submit, build a
   `wa.me` link from the entered details and open it in a new tab so the visitor sends it via
   WhatsApp (client-side only, no backend)
5. **WhatsApp button** — floating click-to-chat button using +91 8076674364
6. **AI chat widget** — floating widget + API route calling OpenRouter (`OPENROUTER_API_KEY`
   already in local `.env`); test that it correctly declines medical-advice questions and
   redirects appropriately
7. **Responsive + accessibility pass** — required, not optional: verify every section, the AI
   chat widget, and the WhatsApp button render correctly at common mobile widths (~360–430px)
   as well as tablet/desktop, plus color contrast and alt text
8. **Deploy** — connect to Vercel, verify production build on the default `*.vercel.app` domain,
   confirm `OPENROUTER_API_KEY` is set as an environment variable there (not committed to the
   repo)
9. **SEO basics** — meta title/description, Open Graph image (headshot), local business
   structured data using the Cure Chest Clinic, Faridabad address

## Working Notes

- Git repo initialized (`main` branch, initial commit made).
- Root of this directory (`IshanGupta/`) will hold the actual app code once scaffolded;
  `Docs/` stays as reference source material only, not part of the deployed site.
- Local `.env` file created with `OPENROUTER_API_KEY` (gitignored via `.gitignore`); the AI chat
  API route should read this and call OpenRouter, not the Anthropic API directly.
- **Build steps 1–7 of the Build Plan are done:** Next.js 16 (App Router) + TypeScript +
  Tailwind v4 scaffolded at the repo root; all sections (Hero, About, Expertise, Publications,
  Awards, Contact), the floating WhatsApp button, and the floating AI chat widget are built and
  verified working (mobile widths 360–430px and desktop, no horizontal overflow, no console
  errors, chat correctly declines medical questions).
- The AI chat uses a **fallback chain of five FREE OpenRouter models**, defined as
  `DEFAULT_MODEL_CHAIN` in `src/lib/openrouter.ts` and overridable via `OPENROUTER_MODELS`
  (comma-separated) or `OPENROUTER_MODEL` (primary only). This replaced single-model configs
  (`openai/gpt-oss-120b`, before that `z-ai/glm-5.2:free`, before that paid
  `anthropic/claude-haiku-4.5`). The design is driven by three measured constraints:
  - **Every `:free` model has exactly ONE provider pool**, and pools return
    `429 upstream_provider_shared_pool` when saturated. Measured: only **1–2 of 8** free models
    responded at any given moment, and which ones changed between runs minutes apart. The chain
    therefore lists models on *different* pools — GMICloud, Google AI Studio, Decart,
    Thinking Machines, AtlasCloud. Two models on the same pool would fail together and buy nothing.
  - **OpenRouter caps the `models` array at 3** (a longer array is a hard 400). So the chain is
    split into consecutive batches of 3 and walked under one shared `TOTAL_BUDGET_MS` deadline,
    rather than a per-batch timeout the visitor would wait through serially.
  - **Excluded after testing:** `nvidia/nemotron-*:free` return whitespace instead of JSON (they
    surfaced as 502s after ~20s); `poolside/*` and `cohere/north-mini-code` are code-specialised;
    `google/lyria-*` are audio; `liquid/lfm-2.5-2.6b` is 2.6B; `openrouter/free` picks a random
    model per request, so refusal behaviour would vary call to call.
  - **Latency is variable** (measured 2.3s–13s) because a request may walk several dead pools
    before one answers. `REQUEST_TIMEOUT_MS` is 25s per round trip, `TOTAL_BUDGET_MS` 40s overall.
  - **All free models are `is_moderated: false`**, so the medical-advice refusal rests entirely on
    the system prompt — and *which* model answers now varies per request. Refusal was sampled 5×
    against a symptom/diagnosis question: 5/5 declined with no diagnosis leakage. **Re-run that
    sampling whenever the chain changes**, not just a single call.
  - When the whole chain is down the route returns HTTP 503 with a "busy, try again — or message
    us on WhatsApp" notice, which the widget shows verbatim.
  - A 4xx whose body carries `error.metadata.provider_name` is the *provider* failing, not a bad
    request from us (observed: AtlasCloud returning a bare 400), so it falls through to the next
    batch instead of aborting. 5xx is treated the same as 429. A 400 without provider metadata,
    and any 401/403, still aborts the chain immediately — those are ours.
  - Every model in the chain answers in Markdown regardless of the system prompt, so
    `ChatMessage.tsx` carries a deliberately tiny renderer for the only two constructs that
    actually appear (bold/italic spans and hyphen bullets). It builds React nodes rather than
    HTML, so nothing a model returns can inject markup.
- A mobile look-and-feel pass followed the functional responsive pass. `npm run mobile-check`
  (`scripts/mobile-check.mjs`, puppeteer-core against the locally installed Chrome) covers the
  measurable failures — overflow, tap targets, floating-button overlap, chat panel fit — and
  passes; the visual work on top of that was: a lead-paragraph treatment on the About bio (it is
  ~900px of unbroken prose on a phone), sans rather than mono values in the credentials card so
  the two columns stop wrapping raggedly, a smaller/tighter hero eyebrow so it holds one line at
  360px, mobile gaps cut from 40px to 24–32px between stacked cards, hairline borders on the
  `bg-paper` cards (they had no perceptible edge against `bg-paper`/`bg-mist/50`), `z=16` on the
  Google Maps embed (it defaulted to a metro-wide zoom, useless in a 224px-tall iframe), and
  ~112px of bottom padding on the footer so the floating buttons stop covering the address at the
  end of the page. **The map pin's exact position has not been confirmed against the real clinic**
  — the embed geocodes the address string.
- Office hours (Monday – Saturday, 5 PM – 8 PM) are shown in the Contact section and included in
  the AI chat assistant's context so it can answer "when are you open" questions.
- The primary CTA is labeled **"Request Appointment"** (renamed from "Book a Consultation")
  across the Header and Hero; it still scrolls to `#contact`.
- Contact form (`src/components/ContactForm.tsx`) is client-side only: on submit it builds a
  `wa.me/<number>?text=<encoded details>` link from the entered name, phone, email, and message,
  and opens it via `window.open` so the visitor sends it themselves inside WhatsApp. This
  replaced the earlier Gmail SMTP (`nodemailer`) implementation — the `/api/contact` API route
  and `src/lib/email.ts` were removed, along with the `nodemailer`/`@types/nodemailer`
  dependencies and the `GMAIL_USER`/`GMAIL_APP_PASSWORD` env vars, none of which are needed
  anymore. Resend/`RESEND_API_KEY` and `NEXT_PUBLIC_FORM_ENDPOINT`/Formspree were an earlier,
  already-abandoned attempt before that.
- Build Plan step 8 (Deploy) is done: the site is live on Vercel at the default
  `https://ishan-gupta-eight.vercel.app` domain, with `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`,
  and `NEXT_PUBLIC_SITE_URL` set as Vercel env vars (Production + Preview). No email-related env
  vars are needed anymore.
- Build Plan step 9 (SEO basics) is done: meta title/description, canonical URL, Open Graph +
  Twitter Card tags (1200×630 image), and `Physician`/`MedicalClinic` JSON-LD structured data are
  all in `src/app/layout.tsx`; `robots.ts` and `sitemap.ts` generate `robots.txt`/`sitemap.xml`.
  On top of that, the site is verified in **Google Search Console** via a
  `verification: { google: "..." }` entry in `layout.tsx`'s `metadata` export (site added as a
  URL-prefix property, verified with the HTML-tag method since there's no custom domain to use a
  DNS record with). Sitemap submission and an initial "Request Indexing" pass in Search Console
  are follow-ups the user does directly in the Search Console UI, not something committed to the
  repo. If the verification code ever needs to change (e.g. re-verifying under a different Google
  account), swap the `content` value there and redeploy.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
