/**
 * Mobile layout check.
 *
 * CLAUDE.md makes mobile rendering a hard requirement ("verify with an actual
 * mobile-width browser check ... not just by eyeballing a desktop viewport").
 * This script does that automatically, at the three widths that matter, and
 * fails loudly rather than relying on a human noticing.
 *
 * Uses puppeteer-core against the locally installed Chrome — no browser
 * download. Start the dev server first, then:
 *
 *     node scripts/mobile-check.mjs                     # http://localhost:3000
 *     node scripts/mobile-check.mjs https://example.com  # any URL
 *
 * Screenshots land in .mobile-check/ (gitignored).
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL_UNDER_TEST = process.argv[2] || "http://localhost:3000";
const OUT_DIR = ".mobile-check";

// Smallest common Android, iPhone 14/15, and the largest phones. The floor and
// ceiling are what break layouts; the middle is what most visitors use.
const VIEWPORTS = [
  { name: "small-android", width: 360, height: 640 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "iphone-pro-max", width: 430, height: 932 },
];

/** Minimum comfortable touch target (Apple HIG 44pt; WCAG 2.5.8 asks 24px). */
const MIN_TAP = 44;

function collectIssues(minTap) {
  const de = document.documentElement;
  const vw = window.innerWidth;
  const issues = [];

  // 1. Horizontal overflow — the single most common mobile defect.
  if (de.scrollWidth > de.clientWidth + 1) {
    const culprits = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        culprits.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 70),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
    }
    issues.push({
      kind: "horizontal-overflow",
      detail: `scrollWidth ${de.scrollWidth} > clientWidth ${de.clientWidth}`,
      culprits: culprits.slice(0, 6),
    });
  }

  // 2. Tap targets that are too small to hit reliably on a phone.
  const small = [];
  for (const el of document.querySelectorAll("a, button, input, textarea, select")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue; // hidden
    if (r.height < minTap || r.width < minTap) {
      small.push({
        tag: el.tagName.toLowerCase(),
        label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
      });
    }
  }
  if (small.length) issues.push({ kind: "small-tap-target", culprits: small.slice(0, 8) });

  // 3. Anything rendering outside the viewport vertically at rest.
  const offscreen = [];
  for (const el of document.querySelectorAll("[class*='fixed']")) {
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    if (r.top < 0 || r.bottom > window.innerHeight + 1) {
      offscreen.push({
        cls: (el.className || "").toString().slice(0, 70),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        viewportH: window.innerHeight,
      });
    }
  }
  if (offscreen.length) issues.push({ kind: "fixed-element-clipped", culprits: offscreen });

  return issues;
}

/** Do the two floating buttons overlap each other? */
function checkFloatingButtons() {
  const wa = document.querySelector('a[aria-label="Chat on WhatsApp"]');
  const chat = document.querySelector('button[aria-label*="chat" i]');
  if (!wa || !chat) return { found: false };
  const a = wa.getBoundingClientRect();
  const b = chat.getBoundingClientRect();
  const overlap = !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  return {
    found: true,
    overlap,
    whatsapp: `${Math.round(a.width)}x${Math.round(a.height)} @ top ${Math.round(a.top)}`,
    chat: `${Math.round(b.width)}x${Math.round(b.height)} @ top ${Math.round(b.top)}`,
    gap: Math.round(a.top - b.bottom),
  };
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars"],
});

mkdirSync(OUT_DIR, { recursive: true });
let failures = 0;

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(URL_UNDER_TEST, { waitUntil: "networkidle2", timeout: 45_000 });
  await new Promise((r) => setTimeout(r, 600)); // let fonts settle

  console.log(`\n${"=".repeat(64)}\n${vp.name}  (${vp.width}x${vp.height})\n${"=".repeat(64)}`);

  const issues = await page.evaluate(collectIssues, MIN_TAP);
  const buttons = await page.evaluate(checkFloatingButtons);

  if (!issues.length) {
    console.log("  ✅ no layout issues");
  } else {
    for (const i of issues) {
      const soft = i.kind === "small-tap-target";
      if (!soft) failures++;
      console.log(`  ${soft ? "⚠️ " : "❌"} ${i.kind}${i.detail ? " — " + i.detail : ""}`);
      for (const c of i.culprits || []) console.log("       ", JSON.stringify(c));
    }
  }

  if (buttons.found) {
    console.log(
      `  ${buttons.overlap ? "❌ OVERLAP" : "✅ no overlap"} — WhatsApp ${buttons.whatsapp}, chat ${buttons.chat}, gap ${buttons.gap}px`
    );
    if (buttons.overlap) failures++;
  }

  await page.screenshot({ path: `${OUT_DIR}/${vp.name}.png`, fullPage: false });

  // Open the chat panel and confirm it fits within the viewport.
  const toggle = await page.$('button[aria-label*="chat" i]');
  if (toggle) {
    await toggle.click();
    await new Promise((r) => setTimeout(r, 500));
    const panel = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return null;
      const r = d.getBoundingClientRect();
      return {
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        left: Math.round(r.left),
        right: Math.round(r.right),
        viewportH: window.innerHeight,
        viewportW: window.innerWidth,
        fits: r.top >= 0 && r.bottom <= window.innerHeight + 1 && r.left >= 0 && r.right <= window.innerWidth + 1,
      };
    });
    if (panel) {
      console.log(`  ${panel.fits ? "✅" : "❌"} chat panel fits — ${JSON.stringify(panel)}`);
      if (!panel.fits) failures++;
      await page.screenshot({ path: `${OUT_DIR}/${vp.name}-chat.png` });
    } else {
      console.log("  ⚠️  chat panel did not open");
    }
  }

  await page.close();
}

await browser.close();
console.log(`\n${"=".repeat(64)}`);
console.log(failures === 0 ? "PASS — no blocking mobile issues" : `FAIL — ${failures} blocking issue(s)`);
console.log(`screenshots: ${OUT_DIR}/`);
process.exit(failures === 0 ? 0 : 1);
