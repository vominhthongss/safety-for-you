// Japan disaster bulletin dates are presented in JST, regardless of device timezone.
const TIME_ZONE = "Asia/Tokyo";
function parseReportTime(value) {
  if (!value) return null;
  const input=String(value).trim();
  const match=input.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  const normalized=match ? `${match[1]}-${match[2].padStart(2,"0")}-${match[3].padStart(2,"0")}T${match[4].padStart(2,"0")}:${match[5]}:${match[6]||"00"}+09:00` : input;
  const date=new Date(normalized);
  return Number.isFinite(date.getTime()) ? date : null;
}
function japanDayKey(date) {
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:TIME_ZONE,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
  const part=(type)=>parts.find(p=>p.type===type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
function formatReportDate(value,locale="en",todayText="Today",now=new Date()) {
  if (!value) return "—";
  const date=parseReportTime(value);
  if (!date) return String(value);
  let label;
  try {
    label=new Intl.DateTimeFormat(locale==="ja" ? "ja-JP" : locale,{timeZone:TIME_ZONE,year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(date);
  } catch {
    label=new Intl.DateTimeFormat("en-US",{timeZone:TIME_ZONE,year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(date);
  }
  return japanDayKey(date)===japanDayKey(now) ? `${todayText} · ${label}` : label;
}
module.exports={parseReportTime,japanDayKey,formatReportDate};
