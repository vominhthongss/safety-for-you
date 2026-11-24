// Renders app icons, splash and store artwork from SVG with the Playwright
// Chromium that is available in the build container:
//   node scripts/render-assets.cjs
// Outputs are committed; re-run only after changing the artwork below.
// Afterwards remove the alpha channel where the stores forbid it:
//   python3 -c "from PIL import Image as I;[I.open(f).convert('RGB').save(f) for f in ['assets/icon.png','store/google-play/feature-graphic.png']]"
// The glyph is original artwork. SF Symbols must not be used in app icons.
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const BLUE_TOP = "#2F8CFF", BLUE_BOTTOM = "#0057D9";
const SHIELD = "M512 232 L752 318 Q760 321 760 330 V506 C760 660 656 772 512 818 C368 772 264 660 264 506 V330 Q264 321 272 318 Z";
const WAVE = "M362 560 C402 520 442 520 482 560 C522 600 562 600 602 560 C632 530 652 524 672 528";
const gradient = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${BLUE_TOP}"/><stop offset="1" stop-color="${BLUE_BOTTOM}"/></linearGradient></defs>`;
// scale: glyph size relative to the 1024 canvas (centered).
const glyph = ({ shield, wave, scale = 1, mask = false }) => {
  const t = `translate(${512 - 512 * scale} ${525 - 525 * scale}) scale(${scale})`;
  if (mask) return `<defs><mask id="m"><rect width="1024" height="1024" fill="#fff"/>
    <path d="${WAVE}" transform="${t}" stroke="#000" stroke-width="56" fill="none" stroke-linecap="round"/></mask></defs>
    <path d="${SHIELD}" transform="${t}" fill="${shield}" mask="url(#m)"/>`;
  return `<path d="${SHIELD}" transform="${t}" fill="${shield}"/>
    <path d="${WAVE}" transform="${t}" stroke="${wave}" stroke-width="56" fill="none" stroke-linecap="round"/>`;
};
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const ASSETS = [
  // iOS/Android launcher icon: opaque, full bleed (iOS applies the mask).
  { file:"assets/icon.png", w:1024, h:1024, opaque:true,
    body:gradient + `<rect width="1024" height="1024" fill="url(#bg)"/>` + glyph({ shield:"#FFFFFF", wave:BLUE_BOTTOM, scale:1.08 }) },
  // Android adaptive icon foreground: transparent, inside the 66% safe zone.
  { file:"assets/adaptive-icon.png", w:1024, h:1024,
    body:glyph({ shield:"#FFFFFF", wave:BLUE_BOTTOM, scale:0.9 }) },
  // Android 13+ themed icon: single-color alpha mask.
  { file:"assets/adaptive-monochrome.png", w:1024, h:1024,
    body:glyph({ shield:"#FFFFFF", scale:0.9, mask:true }) },
  // Splash logo on the mint splash background.
  { file:"assets/splash-icon.png", w:1024, h:1024,
    body:glyph({ shield:BLUE_BOTTOM, wave:"#FFFFFF", scale:1.15 }) },
  // Google Play listing icon (512 x 512, 32-bit PNG).
  { file:"store/google-play/icon-512.png", w:512, h:512, opaque:true,
    body:`<g transform="scale(0.5)">` + gradient + `<rect width="1024" height="1024" fill="url(#bg)"/>` +
      glyph({ shield:"#FFFFFF", wave:BLUE_BOTTOM, scale:1.08 }) + `</g>` },
  // Google Play feature graphic (1024 x 500, no alpha). Minimal text.
  { file:"store/google-play/feature-graphic.png", w:1024, h:500, opaque:true,
    body:`<defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BLUE_TOP}"/><stop offset="1" stop-color="${BLUE_BOTTOM}"/></linearGradient></defs>
      <rect width="1024" height="500" fill="url(#fg)"/>
      <g transform="translate(40 -6) scale(0.5)">${glyph({ shield:"#FFFFFF", wave:BLUE_BOTTOM })}</g>
      <text x="560" y="232" font-family="Inter Display, Inter, sans-serif" font-weight="700" font-size="64" fill="#FFFFFF">Safety For You</text>
      <text x="562" y="290" font-family="Inter, sans-serif" font-weight="500" font-size="28" fill="#FFFFFFE0">Disaster information for Japan</text>
      <text x="562" y="332" font-family="Inter, sans-serif" font-weight="500" font-size="28" fill="#FFFFFFE0">13 languages · Free · Nonprofit</text>` }
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor:1 });
  for (const a of ASSETS) {
    await page.setViewportSize({ width:a.w, height:a.h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg(a.w, a.h, a.body)}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    fs.mkdirSync(path.dirname(a.file), { recursive:true });
    await page.screenshot({ path:a.file, omitBackground:!a.opaque, clip:{ x:0, y:0, width:a.w, height:a.h } });
    console.log("wrote", a.file);
  }
  await browser.close();
})();
