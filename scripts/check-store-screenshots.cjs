// Validates store screenshots in store/screenshots/<slot>/ against the
// App Store Connect and Google Play specifications (checked 2026-11-24):
// https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/
// https://support.google.com/googleplay/android-developer/answer/9866151
//   node scripts/check-store-screenshots.cjs            # check all slots
//   node scripts/check-store-screenshots.cjs file.png   # check given files
const fs = require("node:fs");
const path = require("node:path");

const pairs = (...sizes) => sizes.flatMap(([w, h]) => [`${w}x${h}`, `${h}x${w}`]);
const SLOTS = {
  "iphone-6.9": { store:"App Store", sizes:pairs([1320,2868],[1290,2796]), min:1, max:10, required:"one of iphone-6.9 / iphone-6.5" },
  "iphone-6.5": { store:"App Store", sizes:pairs([1284,2778],[1242,2688]), min:0, max:10 },
  "ipad-13": { store:"App Store", sizes:pairs([2064,2752],[2048,2732]), min:1, max:10, required:"because ios.supportsTablet is true" },
  "android-phone": { store:"Google Play", min:2, max:8, play:true }
};

// Width, height and alpha from PNG (IHDR) or JPEG (SOF) headers.
function imageInfo(file) {
  const b = fs.readFileSync(file);
  if (b.length > 25 && b.toString("ascii", 1, 4) === "PNG") {
    const type = b[25];
    return { w:b.readUInt32BE(16), h:b.readUInt32BE(20), alpha:type === 4 || type === 6, format:"png" };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length - 9;) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1], len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return { w:b.readUInt16BE(i + 7), h:b.readUInt16BE(i + 5), alpha:false, format:"jpeg" };
      i += 2 + len;
    }
  }
  return null;
}
function checkFile(file, slotName) {
  const slot = SLOTS[slotName];
  const info = imageInfo(file);
  if (!info) return [`${file}: not a PNG or JPEG image`];
  const errors = [];
  const size = `${info.w}x${info.h}`;
  if (slot.play) {
    const lo = Math.min(info.w, info.h), hi = Math.max(info.w, info.h);
    if (lo < 320 || hi > 3840) errors.push(`${file}: ${size} outside 320-3840 px`);
    if (hi > lo * 2.3) errors.push(`${file}: ${size} long side exceeds 2.3x the short side`);
    if (info.alpha) errors.push(`${file}: PNG has an alpha channel (Google Play requires 24-bit PNG or JPEG)`);
    if (fs.statSync(file).size > 8 * 1024 * 1024) errors.push(`${file}: larger than 8 MB`);
  } else if (!slot.sizes.includes(size)) {
    errors.push(`${file}: ${size} is not an accepted ${slotName} size (${slot.sizes.filter((_, i) => i % 2 === 0).join(", ")})`);
  }
  return errors;
}
function main() {
  const root = path.join(__dirname, "..");
  const args = process.argv.slice(2).filter((a) => a !== "--quiet");
  const quiet = process.argv.includes("--quiet");
  const errors = [];
  if (args.length) {
    for (const file of args) {
      const slotName = path.basename(path.dirname(path.resolve(file)));
      if (!SLOTS[slotName]) { errors.push(`${file}: folder must be one of ${Object.keys(SLOTS).join(", ")}`); continue; }
      errors.push(...checkFile(file, slotName));
    }
  } else {
    const counts = {};
    for (const slotName of Object.keys(SLOTS)) {
      const dir = path.join(root, "store", "screenshots", slotName);
      const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort() : [];
      counts[slotName] = files.length;
      for (const f of files) errors.push(...checkFile(path.join(dir, f), slotName));
      const slot = SLOTS[slotName];
      if (files.length > slot.max) errors.push(`${slotName}: ${files.length} files, ${slot.store} accepts at most ${slot.max}`);
      if (slotName !== "iphone-6.9" && files.length < slot.min)
        errors.push(`${slotName}: ${files.length} of ${slot.min} required screenshot(s)${slot.required ? " (" + slot.required + ")" : ""}`);
    }
    if (counts["iphone-6.9"] + counts["iphone-6.5"] < 1)
      errors.push("iphone: at least one screenshot is required in iphone-6.9 or iphone-6.5");
    if (!quiet) console.log("screenshots:", JSON.stringify(counts));
  }
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  if (!quiet) console.log("OK: screenshots match the store specifications.");
}
if (require.main === module) main();
module.exports = { imageInfo, checkFile, SLOTS };
