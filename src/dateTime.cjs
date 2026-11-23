const JAPAN_TIME_ZONE = "Asia/Tokyo";
const JAPAN_OFFSET_MS = 9 * 60 * 60 * 1000;

// P2PQuake's unzoned timestamps are JST. Never interpret them in the
// device's timezone; JMA ISO timestamps retain their explicit offset.
function parseBulletinTime(value) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date || typeof value === "number") {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  const input = String(value).trim();
  const local = /^(\d{4})[-/](\d{2})[-/](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(\.\d{1,3})?)?$/.exec(input);
  const normalized = local ?
    `${local[1]}-${local[2]}-${local[3]}T${local[4]}:${local[5]}:${local[6] || "00"}${local[7] || ""}+09:00` : input;
  // Avoid locale-dependent parsing of unknown or incomplete upstream text.
  if (!local && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/i.test(input)) return null;
  const date = new Date(normalized);
  if (!Number.isFinite(date.getTime())) return null;
  const calendarDate = normalized.slice(0, 10);
  if (new Date(`${calendarDate}T00:00:00Z`).toISOString().slice(0, 10) !== calendarDate) return null;
  if (local && japanDay(date) !== `${local[1]}-${local[2]}-${local[3]}`) return null;
  return date;
}

function japanDay(date) {
  return new Date(date.getTime() + JAPAN_OFFSET_MS).toISOString().slice(0, 10);
}

function isTodayInJapan(value, now = Date.now()) {
  const date = parseBulletinTime(value);
  const current = parseBulletinTime(now);
  return !!date && !!current && japanDay(date) === japanDay(current);
}

function formatReportTime(value, locale, todayLabel, now = Date.now()) {
  if (value === null || value === undefined || value === "") return "—";
  const date = parseBulletinTime(value);
  if (!date) return String(value);
  const options = { timeZone:JAPAN_TIME_ZONE, year:"numeric", month:"short",
    day:"numeric", hour:"2-digit", minute:"2-digit", hourCycle:"h23" };
  let formatted;
  try { formatted = new Intl.DateTimeFormat(locale, options).format(date); }
  catch { formatted = new Intl.DateTimeFormat("en", options).format(date); }
  const prefix = todayLabel && isTodayInJapan(date, now) ? `${todayLabel} · ` : "";
  return `${prefix}${formatted} JST`;
}

module.exports = { JAPAN_TIME_ZONE, parseBulletinTime, isTodayInJapan, formatReportTime };
