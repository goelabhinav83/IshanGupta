# Code Review — Dr. Ishan Gupta Website

**Date:** 2026-08-26
**Commit reviewed:** `5da3b07` (main)
**Deployed at:** https://ishan-gupta-eight.vercel.app
**Scope:** Full codebase — `src/` (23 files), config, deployment and env setup.

---

## Remediation status — 2026-08-26

All 20 findings have been addressed: **19 fixed in code**, **1 requires your action**
(M-4, blocked by a permission prompt), and **1 closed as won't-fix with rationale** (L-20).

| # | Finding | Status |
|---|---|---|
| H-1 | Chat bricks after 20 messages | ✅ Fixed — verified live |
| H-2 | `/api/chat` unthrottled | ✅ Fixed — verified live |
| H-3 | Primary CTA contrast 3.66:1 | ✅ Fixed — now 4.96:1 |
| M-4 | Stale Gmail credentials in Vercel | ⚠️ **Needs you** — see below |
| M-5 | `teal-500` text contrast | ✅ Fixed — now 5.58:1 / 4.87:1 |
| M-6 | No OpenRouter timeout | ✅ Fixed |
| M-7 | No chat input length limit | ✅ Fixed |
| M-8 | Chat dialog keyboard access | ✅ Fixed |
| M-9 | Contact form dead-end | ✅ Fixed |
| M-10 | Missing robots/sitemap | ✅ Fixed — verified live |
| M-11 | Thin structured data | ✅ Fixed — verified live |
| L-12 | Error bubbles sent as context | ✅ Fixed |
| L-13 | Reference-identity filter | ✅ Fixed |
| L-14 | Square OG image | ✅ Fixed — 1200×630 generated |
| L-15 | Chat panel overflow | ✅ Fixed |
| L-16 | `ink/60` below AA | ✅ Fixed |
| L-17 | Bare `#` logo link | ✅ Fixed |
| L-18 | No OpenRouter attribution | ✅ Fixed |
| L-19 | Empty `next.config.ts` | ✅ Fixed — security headers added |
| L-20 | WhatsApp icon contrast | ⏸️ Won't fix — brand treatment, see below |

### ⚠️ M-4 needs you — one command, plus a revoke

Deleting Vercel environment variables was blocked by a permission prompt, so this is the one
item left. Run:

```bash
vercel env rm GMAIL_USER production      --yes --scope team_hZeIPfYvXV9YDEmisblQg92v
vercel env rm GMAIL_USER preview         --yes --scope team_hZeIPfYvXV9YDEmisblQg92v
vercel env rm GMAIL_APP_PASSWORD production --yes --scope team_hZeIPfYvXV9YDEmisblQg92v
vercel env rm GMAIL_APP_PASSWORD preview    --yes --scope team_hZeIPfYvXV9YDEmisblQg92v
```

Then **revoke the app password** at https://myaccount.google.com/apppasswords — removing the
env var does not invalidate the credential itself, and that is the part that actually matters.

### 🐛 A bug caught during remediation

Adding the `X-Title` attribution header for L-18 initially broke the chat completely:

```
TypeError: Cannot convert argument to a ByteString because the character
at index 16 has a value of 8212 which is greater than 255
```

`SITE_NAME` contains an em-dash (`—`, U+2014), and HTTP header values must be ByteString-safe.
Every chat request returned 502. Caught by testing the endpoint rather than trusting the build
— `tsc`, `eslint`, and `next build` were all clean with this bug present. Fixed by stripping
non-ASCII from the header value (`ASCII_SITE_NAME` in `src/lib/openrouter.ts`).

### Verification performed

| Check | Result |
|---|---|
| 31-message history (was the H-1 break) | `HTTP 200`, assistant answered correctly |
| 150-message history (abuse guard) | `HTTP 400` — still rejected |
| Rate limit burst | 400s until the 12th request, then `HTTP 429` |
| `/robots.txt`, `/sitemap.xml` | Both serve correct absolute URLs |
| JSON-LD output | `telephone`, `url`, `openingHours`, `availableLanguage` all present |
| OG tags | Absolute URL, `1200×630`, `summary_large_image` |
| Security headers | All 5 present on response |
| `tsc --noEmit` / `eslint` / `next build` | All clean |

**Still not verified:** mobile rendering at 360–430px. The Chrome extension was not connected,
so L-15's fix (`max-h-[calc(100vh-172px)]`) is reasoned from CSS, not observed in a browser.
Worth a device-emulation pass before you consider the responsive requirement closed.

---

## Summary

The codebase is in good shape for a brochure site: clean component boundaries, content
properly centralised in `src/content/doctor.ts`, no secrets in git, lint passes with zero
warnings, and TypeScript strict mode compiles clean. The architecture decisions recorded in
`CLAUDE.md` are faithfully implemented — the chat route is server-side only, the contact form
is genuinely client-side, and no PHI is collected or persisted anywhere.

Three issues warrant attention before this site gets real patient traffic:

1. **The AI chat permanently breaks after 20 messages** — confirmed live against production.
2. **`/api/chat` is an unauthenticated, unthrottled endpoint that spends money per request.**
3. **The primary "Request Appointment" button fails WCAG AA contrast** — on a site explicitly
   designed for an older readership, this is the one control that must be legible.

Everything else is polish. Counts: **3 high**, **8 medium**, **9 low**.

### What was verified vs. assumed

| Verified | How |
|---|---|
| Chat 20-message failure | Live `POST` to production → `HTTP 400` |
| Over-length message rejection | Live `POST` with 2001 chars → `HTTP 400` |
| No WAF / rate limiting | `vercel api /v1/security/firewall/config/active` → `404 Config not found` |
| Stale Gmail env vars | `vercel env ls` |
| No secrets in git history | `git ls-files`, `git log --all -- .env*` |
| Contrast ratios | WCAG 2.x relative-luminance computed from `globals.css` tokens |
| OG tags resolve absolutely | `curl` of production HTML — `NEXT_PUBLIC_SITE_URL` **is** set, this is fine |
| Lint / typecheck | `npm run lint`, `npx tsc --noEmit` — both clean |

**Not verified:** mobile rendering at 360–430px. The browser extension was not connected during
this review, so the responsive claims in `CLAUDE.md` were not independently re-checked. The one
responsive issue below (L-15) comes from reading the CSS, not from observing it.

---

## High

### H-1 — AI chat permanently bricks itself after 20 messages  ✅ FIXED

> **Fix applied:** `ChatWidget.tsx` now trims to the last 18 real turns before sending; the route truncates instead of rejecting.

**`src/app/api/chat/route.ts:6`, `src/components/chat/ChatWidget.tsx:29-51`**

The server caps history at `MAX_MESSAGES = 20`. The client sends the **entire** conversation on
every turn and never trims it. Once a visitor reaches 20 messages (10 exchanges), every
subsequent request is rejected with `400 Invalid message history`.

The failure is not merely a dead end — it is self-reinforcing. The client's `catch` block
appends its error bubble to `messages` (line 44-51), so the array grows by one on every failed
attempt. The conversation can never return below the cap. The widget is dead until the visitor
reloads the page, and nothing in the UI tells them that reloading is the fix. They just see
"Sorry, I'm having trouble connecting right now" forever.

Confirmed against production:

```
POST /api/chat  (21 messages)  →  HTTP 400 {"error":"Invalid message history"}
```

**Fix:** trim client-side before sending, so the cap can never be hit:

```ts
// ChatWidget.tsx — keep the most recent turns, drop the oldest
const history = nextMessages.filter((m) => m !== GREETING).slice(-18);
```

Also stop feeding error bubbles back as context (see L-12). Optionally have the server truncate
rather than reject, so a stale client can't brick itself either.

---

### H-2 — `/api/chat` is an unauthenticated, unthrottled, billable endpoint  ✅ FIXED

> **Fix applied:** Per-IP sliding-window limit (12/min) in the route, returning 429 + `Retry-After`.

**`src/app/api/chat/route.ts:26`**

The route accepts any `POST` from anyone and forwards it to OpenRouter, which bills per token.
There is no rate limiting, no origin check, no bot protection. Confirmed that no Vercel WAF
config exists on the project (`/v1/security/firewall/config/active` → `404`).

A trivial loop against this URL runs up an OpenRouter bill with no ceiling. This is not a
theoretical risk for a public site with a discoverable `/api/chat` path — it is the standard
way small sites with LLM endpoints get drained.

The 20-message cap and 2000-char limit bound the cost of a *single* request but do nothing about
request *volume*.

**Fix — pick at least one:**

- **Vercel WAF rate limit** (simplest, no code): add a rule on `/api/chat`, e.g. 10 req/min per
  IP. Configurable in the dashboard or via `vercel firewall`.
- **Vercel BotID** on the route to block automated clients.
- **Spend cap on the OpenRouter key itself** — worth doing regardless, as a backstop. OpenRouter
  supports per-key credit limits.

The spend cap is the one that guarantees a bounded worst case; do that one even if you do
nothing else.

---

### H-3 — Primary CTA button fails WCAG AA contrast  ✅ FIXED

> **Fix applied:** `--coral` darkened to `#c2472f` (4.96:1 on white); hover moved to a new `--coral-dark` token.

**`src/components/ui/Button.tsx:7`, `src/app/globals.css:9`**

White text on `--coral: #e2593f` measures **3.66:1**. WCAG AA requires **4.5:1** for normal-size
text. The button uses `text-sm` (14px) at weight 500, which does not qualify as "large text"
(that needs 18.66px bold or 24px regular).

This affects every `variant="primary"` button — "Request Appointment" in the header, the hero,
the mobile menu, and "Send via WhatsApp" on the contact form. `CLAUDE.md` specifies "readable
body text sized for an older/general-audience readership" and lists colour contrast as a
required pass. The single most important control on the site is the one that misses.

**Fix:** darken the coral until it clears 4.5:1 against white. `#c2472f` gives ~4.6:1 and stays
visually in the same family. Note the hover state `#c94a33` is already close to this — so the
button currently gets *more* legible on hover, which is backwards.

Verify after changing:

```
white on #c2472f  →  4.61:1  ✓ AA
```

---

## Medium

### M-4 — Stale Gmail credentials still live in Vercel  ⚠️ NEEDS YOUR ACTION

> **Status:** Blocked by a permission prompt — commands are in the Remediation section above.

`vercel env ls` shows `GMAIL_USER` and `GMAIL_APP_PASSWORD` still set on Production and Preview.
`CLAUDE.md` records that the nodemailer implementation was removed and these are no longer
needed — nothing in `src/` reads them.

A Gmail **app password** is a live credential granting SMTP access to a real mailbox. Leaving it
provisioned for a service that no longer uses it is pure downside.

**Fix:**
```bash
vercel env rm GMAIL_USER production
vercel env rm GMAIL_USER preview
vercel env rm GMAIL_APP_PASSWORD production
vercel env rm GMAIL_APP_PASSWORD preview
```
Then **revoke the app password** in the Google account — removing the env var does not
invalidate the credential itself.

---

### M-5 — `teal-500` body text fails AA wherever it appears  ✅ FIXED

> **Fix applied:** `--teal-500` darkened to `#20706a`; contact links moved to `teal-900` + underline.

**`src/app/globals.css:7`**

`--teal-500: #2f8f86` measures:

| Context | Ratio | Verdict |
|---|---|---|
| on `--paper` `#f8faf9` | **3.71:1** | fails AA (needs 4.5) |
| on `--mist` `#dceeec` | **3.24:1** | fails AA |

Used for section eyebrow labels, publication metadata (`Publications.tsx:16`), `<dt>` labels in
About, and — most importantly — **the clinic email and WhatsApp links** in
`Contact.tsx:35-40`. Those links are a primary conversion path and are rendered at 14px in a
mono face, which is already a legibility handicap.

**Fix:** use `--teal-900` (`#0b4a46`, 9.62:1) for the contact links, and darken `--teal-500`
to around `#237a72` (~4.6:1) for the decorative labels. Purely decorative eyebrow text is
arguably exempt, but the links are not.

---

### M-6 — No timeout on the OpenRouter request  ✅ FIXED

> **Fix applied:** `AbortSignal.timeout(20_000)` on the OpenRouter fetch.

**`src/lib/openrouter.ts:80-92`**

The `fetch` has no `AbortSignal`. If OpenRouter hangs, the function holds the connection until
Vercel's platform timeout (300s default). The visitor stares at "Typing…" with no error and no
recovery, and you pay for the idle compute.

**Fix:**
```ts
const response = await fetch(OPENROUTER_URL, {
  method: "POST",
  headers: { /* … */ },
  body: JSON.stringify({ /* … */ }),
  signal: AbortSignal.timeout(20_000),
});
```
A 20s ceiling is generous for a 400-token reply and fails fast enough that the existing
`catch` in the route returns a useful 502.

---

### M-7 — Chat input has no length limit, so long pastes fail opaquely  ✅ FIXED

> **Fix applied:** `maxLength={2000}` on the chat input, matching the server cap.

**`src/components/chat/ChatWidget.tsx:105-112`**

The server rejects content over `MAX_MESSAGE_LENGTH = 2000` (`route.ts:7`), confirmed live:

```
POST /api/chat  (2001-char message)  →  HTTP 400
```

The input has no `maxLength`, so a visitor pasting a long question gets the generic "having
trouble connecting" message with no indication that length was the problem — and per H-1, that
failed message now permanently pollutes the history.

**Fix:** add `maxLength={2000}` to the input. The browser then prevents the invalid state
instead of the server rejecting it after the fact.

---

### M-8 — Chat dialog has no keyboard affordances  ✅ FIXED

> **Fix applied:** Initial focus, Escape-to-close with focus restore, and an explicit close button; Escape added to the mobile nav too.

**`src/components/chat/ChatWidget.tsx:80-84`**

The panel declares `role="dialog"` but:

- focus is never moved into it when it opens
- **Escape does not close it**
- focus is not trapped, so tabbing walks out into the page behind
- no `aria-modal`, and focus is not restored to the trigger on close

A keyboard or screen-reader user can open the widget and then be stranded — the panel is
announced as a dialog but behaves like loose page content.

**Fix:** on open, focus the text input; add an Escape handler that closes and returns focus to
the toggle button. A full focus trap is optional for a non-modal panel, but Escape and initial
focus are the minimum for anything carrying `role="dialog"`.

The same Escape gap exists on the mobile nav in `Header.tsx:60-84`, though it matters less
there since the menu is inline rather than an overlay.

---

### M-9 — Contact form success state is a dead end  ✅ FIXED

> **Fix applied:** "Send another request" resets to `idle`; fallback `wa.me` link now shown in the success state too.

**`src/components/ContactForm.tsx:45-54`**

On success the component returns *only* the confirmation panel — the form is unmounted with no
way back. A visitor who mistypes their phone number, or who wants to send a second request,
must reload the page. The `form.reset()` on line 38 is dead code, since the form unmounts
immediately after.

Worth noting the success copy is also slightly optimistic: `window.open` returning a truthy
handle means the tab opened, not that WhatsApp loaded or that the visitor sent anything.

**Fix:** add a "Send another request" button that resets `status` to `"idle"`. Consider
softening the copy to "WhatsApp should have opened in a new tab" with the `waHref` fallback link
shown alongside — the popup-blocked path already renders that link, so it costs nothing to show
it in both states.

---

### M-10 — Missing `robots.ts` and `sitemap.ts`  ✅ FIXED

> **Fix applied:** Added `src/app/robots.ts` and `src/app/sitemap.ts`.

**`src/app/`**

Build Plan step 9 calls for SEO basics. Metadata and Open Graph tags are done and resolving
correctly in production (verified), but there is no `robots.ts` or `sitemap.ts`. For a
single-page site these are small files with real discovery value.

**Fix:** add `src/app/robots.ts` and `src/app/sitemap.ts` using the App Router metadata
conventions, both keyed off the `SITE_URL` constant already in `src/lib/constants.ts`.

---

### M-11 — Local-business structured data is missing its most useful fields  ✅ FIXED

> **Fix applied:** Added `telephone`, `url`, `openingHours`, `availableLanguage`; `@type` is now `["Physician","MedicalClinic"]`; `image` made absolute.

**`src/app/layout.tsx:39-55`**

The `Physician` JSON-LD includes name, specialty, image, address and email, but omits
`telephone`, `openingHours`, `url`, and `geo`. For a clinic whose whole SEO value is "found by a
patient nearby, during opening hours", those are the fields that matter most in local search
results.

`openingHours` is directly derivable from `contact.officeHours` (already structured as
Mon–Sat, 17:00–20:00) and `telephone` from `contact.whatsappNumber`.

**Fix:**
```ts
telephone: `+${contact.whatsappNumber}`,
url: SITE_URL,
openingHours: "Mo-Sa 17:00-20:00",
```
Consider also `@type: ["Physician", "MedicalClinic"]` so the clinic itself is described, not
only the practitioner.

---

## Low

**L-12 — Error bubbles are sent back to the model as conversation history.** ✅ **FIXED** — error/greeting bubbles carry a `transient` flag and are filtered out of what is sent.
`ChatWidget.tsx:44-51` pushes "Sorry, I'm having trouble connecting…" into `messages`, and
line 38 sends everything except the greeting. So the assistant's own outage messages become part
of the context it reasons over. Tag error bubbles and filter them out.

**L-13 — `m !== GREETING` is a reference-identity filter.** ✅ **FIXED** — replaced with the same `transient` flag; no more reference-identity comparison.
`ChatWidget.tsx:38` works only because `GREETING` is a module-level constant held by reference
in the initial state. Any refactor that clones or serialises messages silently starts sending
the greeting to the model. A `system`-ish flag on the message object would be sturdier.

**L-14 — OG image is square.** ✅ **FIXED** — generated `public/images/og-dr-ishan-gupta.jpg` at 1200×630 and wired into metadata.
`public/images/dr-ishan-gupta.jpg` is 960×958. Social cards expect ~1200×630; most platforms
will centre-crop this, which on a headshot risks cutting the face. Consider a dedicated
landscape OG image.

**L-15 — Chat panel can overflow the top of short viewports.** ✅ **FIXED** — now `max-h-[calc(100vh-172px)]` with a fixed height, removing the 390px cliff.
`ChatWidget.tsx:84` uses `bottom-[156px]` with `h-[min(30rem,60vh)]`. The panel fits only while
`156 + 0.6·vh ≤ vh`, i.e. **viewport height ≥ 390px**. Phones in landscape (360–430px tall) sit
right at that boundary. Using `max-h-[calc(100vh-172px)]` instead of a `60vh` fraction removes
the cliff. *(Reasoned from CSS; not observed in a browser.)*

**L-16 — `text-ink/60` sits just under AA.** ✅ **FIXED** — changed to `text-ink/70` (5.61:1).
4.11:1 on paper, 3.91:1 on mist — used for the "Typing…" indicator and some secondary copy.
`ink/70` (5.61:1) clears AA and is a one-character change.

**L-17 — Header logo links to bare `#`.** ✅ **FIXED** — now `href="#top"` with a matching `id` on the Hero section.
`Header.tsx:14` — clicking appends `#` to the URL and pushes a history entry. `href="#top"` with
a matching anchor, or a scroll handler, avoids the dangling hash.

**L-18 — No OpenRouter attribution headers.** ✅ **FIXED** — `HTTP-Referer` and `X-Title` added (ASCII-sanitised — see the bug note above).
`openrouter.ts:82-85` omits `HTTP-Referer` and `X-Title`, which OpenRouter uses for dashboard
attribution and ranking. Two lines, purely informational benefit.

**L-19 — `next.config.ts` is an empty stub.** ✅ **FIXED** — five security headers added via `next.config.ts`; CSP deliberately deferred.
Fine as-is, but it is where security headers would go (`Content-Security-Policy`,
`X-Frame-Options`, `Referrer-Policy`). Worth a pass before this is the public face of a medical
practice.

**L-20 — WhatsApp icon contrast.** ⏸️ **WON'T FIX** —
White glyph on `#25d366` is 1.98:1, below the 3:1 that WCAG 1.4.11 asks of meaningful graphics.
This is the official brand treatment, so it is defensible — noted for completeness rather than
as a defect.

---

## What's already right

Worth recording, so it doesn't get "fixed" later:

- **Secret handling is correct.** `OPENROUTER_API_KEY` is read server-side only, `.env` and
  `.env.local` are gitignored, and `git log --all` confirms no env file was ever committed.
  Only `.env.example` is tracked, with empty values.
- **The medical-advice guardrail is well constructed.** The system prompt in
  `openrouter.ts:59-70` is explicit, scoped, and repeated in the widget's greeting and header
  subtitle. Refusal behaviour is reinforced in three places a user actually sees.
- **`runtime = "nodejs"`** on the chat route matches current Vercel guidance — Edge would have
  been the wrong reach here.
- **Content is genuinely centralised.** Every section reads from `src/content/doctor.ts`, and
  the chat's context is *generated from the same source* (`buildSiteContext`), so the assistant
  cannot drift from the page content. That's a nice property and worth preserving.
- **Input validation on the API route is real** — shape, role, type, and length are all checked
  before anything reaches OpenRouter. The problem in H-1 is the client's failure to respect the
  cap, not the cap itself.
- **`prefers-reduced-motion` is handled properly**, including freezing the `breath-line`
  animation and disabling smooth scroll.
- **Semantic HTML throughout** — `<address>`, `<dl>` for the qualifications list, `<ol>` for
  publications, `aria-hidden` on decorative SVGs, labelled form controls.

---

## Suggested order of work

1. **H-1** — trim chat history client-side. One line, removes a user-facing break.
2. **H-2** — set an OpenRouter spend cap today; add a WAF rate limit when convenient.
3. **M-4** — remove and revoke the stale Gmail credentials.
4. **H-3 / M-5** — the contrast pass. Two token changes in `globals.css` fix most of it.
5. **M-6, M-7** — timeout and `maxLength`; small and self-contained.
6. **M-8, M-9** — chat Escape/focus, and the form's "send another" path.
7. **M-10, M-11** — SEO completion, closing out Build Plan step 9.
8. Lows as time permits.

Items 1–3 are the ones that affect real visitors or real money.

---

## Appendix — changes by file

| File | Findings addressed | Change |
|---|---|---|
| `src/app/globals.css` | H-3, M-5 | `--coral` → `#c2472f`, `--teal-500` → `#20706a`, new `--coral-dark` token |
| `src/components/ui/Button.tsx` | H-3 | Primary hover uses `coral-dark` (was *lighter* than the new base) |
| `src/components/chat/ChatWidget.tsx` | H-1, M-7, M-8, L-12, L-13, L-15, L-16 | History trimming, `transient` message flag, `maxLength`, focus + Escape + close button, height clamp, `ink/70` |
| `src/app/api/chat/route.ts` | H-1, H-2 | Per-IP rate limit; truncate-not-reject with a separate `HARD_MAX_MESSAGES` abuse guard |
| `src/lib/openrouter.ts` | M-6, L-18 | 20s `AbortSignal.timeout`, attribution headers, `ASCII_SITE_NAME` sanitiser |
| `src/components/ContactForm.tsx` | M-9 | "Send another request", fallback link in success state, removed dead `form.reset()` |
| `src/app/layout.tsx` | M-11, L-14 | Structured data fields, absolute `image`/`url`, OG + Twitter card metadata, always-set `metadataBase` |
| `src/lib/constants.ts` | M-10, L-14 | New `SITE_ORIGIN` with documented production fallback |
| `src/app/robots.ts` *(new)* | M-10 | Allow all, disallow `/api/`, point at sitemap |
| `src/app/sitemap.ts` *(new)* | M-10 | Single-page sitemap |
| `src/content/doctor.ts` | M-11, L-14 | `officeHoursSchema`, `ogImage` |
| `src/components/sections/Contact.tsx` | M-5 | Contact links to `teal-900` + underline |
| `src/components/layout/Header.tsx` | M-8, L-17 | Escape closes mobile menu, logo → `#top` |
| `src/components/sections/Hero.tsx` | L-17 | `id="top"` anchor target |
| `next.config.ts` | L-19 | Five security headers; CSP deliberately deferred with rationale |
| `public/images/og-dr-ishan-gupta.jpg` *(new)* | L-14 | 1200×630 social card generated from the headshot |

### Follow-ups worth doing separately

1. **M-4** — remove and revoke the Gmail credentials (commands above).
2. **OpenRouter spend cap** — the rate limit is per-instance and best-effort. A credit limit on
   the key is the only hard ceiling on spend; worth setting regardless.
3. **Mobile pass at 360–430px** — the one thing this round could not verify.
4. **Content-Security-Policy** — deliberately left out of `next.config.ts`; needs a browser
   check against the Maps iframe and Google Fonts.
