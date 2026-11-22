/**
 * Cloudflare Worker: public, cached JMA Atom news adapter.
 *
 * IMPORTANT: These are recent JMA bulletin HEADLINES, not verified in-force
 * local alerts. Regions and live validity must be added by parsing the
 * individual authoritative XML documents before this becomes a notification system.
 */
const FEEDS = [
  "https://www.data.jma.go.jp/developer/xml/feed/extra_l.xml",
  "https://www.data.jma.go.jp/developer/xml/feed/regular_l.xml",
  "https://www.data.jma.go.jp/developer/xml/feed/eqvol_l.xml"
];
const RULES = [
  ["typhoon", /台風|暴風|強風/],
  ["flood", /洪水|氾濫|増水/],
  ["landslide", /土砂|地すべり|がけ崩れ/],
  ["rain", /大雨|記録的短時間大雨/],
  ["volcano", /火山|噴火/],
  ["snow", /大雪|暴風雪|雪崩/],
  ["heat", /熱中症|高温/]
];
const decodeXml = (input) => String(input || "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, c) => {
    const n = c.startsWith("x") ? parseInt(c.slice(1), 16) : Number(c);
    return n > 0 && n <= 0x10FFFF ? String.fromCodePoint(n) : "";
  })
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
function tag(block, name) {
  const match = new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + name + ">", "i").exec(block);
  return decodeXml(match?.[1] || "").trim();
}
function parseAtom(xml) {
  const entries = xml.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/g) || [];
  return entries.map((block) => {
    const title = tag(block, "title");
    const category = RULES.find((r) => r[1].test(title))?.[0];
    const link = /<link\b[^>]*\bhref=["']([^"']+)["']/i.exec(block)?.[1];
    const time = tag(block,"updated") || tag(block,"published");
    if (!category || !link || !time || !/^https:\/\/www\.data\.jma\.go\.jp\/developer\/xml\//.test(link)) return null;
    return {
      id: "jma-" + tag(block,"id"), category, title, description: title,
      source: "JMA", time, url: link, coordinate: null
    };
  }).filter(Boolean);
}
async function loadOne(feed) {
  const response = await fetch(feed, { cf: { cacheTtl: 180, cacheEverything: true } });
  if (!response.ok) throw new Error("JMA upstream " + response.status);
  return parseAtom(await response.text());
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = { "Content-Type":"application/json; charset=utf-8",
      "Access-Control-Allow-Origin":env.ALLOWED_ORIGIN || "*", "Cache-Control":"public, max-age=120" };
    if (request.method === "OPTIONS") return new Response(null, { headers, status: 204 });
    if (request.method !== "GET" || url.pathname !== "/hazards")
      return new Response(JSON.stringify({ error:"not_found" }), { status:404, headers });
    const results = await Promise.allSettled(FEEDS.map(loadOne));
    const ok = results.filter((p) => p.status === "fulfilled");
    if (!ok.length) return new Response(JSON.stringify({ error:"JMA_UNAVAILABLE" }), { status:503, headers });
    const seen = new Map();
    for (const r of ok) for (const item of r.value) seen.set(item.id, item);
    const items = [...seen.values()].sort((a,b) => Date.parse(b.time)-Date.parse(a.time)).slice(0,160);
    return new Response(JSON.stringify({
      updatedAt:new Date().toISOString(), kind:"RECENT_JMA_BULLETINS_NOT_ACTIVE_WARNINGS", items,
      degraded:ok.length !== FEEDS.length
    }), { headers });
  }
};
