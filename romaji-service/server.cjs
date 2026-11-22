// Dedicated Node service. Do not run morphological dictionaries in the RN bundle.
const http = require("node:http");
const Kuroshiro = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");

const port = Number(process.env.PORT || 3088);
const converter = new Kuroshiro();
const initialized = converter.init(new KuromojiAnalyzer());
const cache = new Map();
const MAX_CACHE = 2000;

function send(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}
const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    try { await initialized; return send(res, 200, { ok:true }); }
    catch { return send(res, 503, { ok:false }); }
  }
  if (req.method !== "POST" || req.url !== "/romaji") return send(res, 404, { error:"not_found" });
  let payload = "";
  try {
    for await (const chunk of req) {
      payload += chunk;
      if (Buffer.byteLength(payload) > 12000) return send(res, 413, { error:"too_large" });
    }
    const { texts } = JSON.parse(payload);
    if (!Array.isArray(texts) || texts.length > 20 || !texts.every((v) => typeof v === "string" && v.length <= 160))
      return send(res, 400, { error:"invalid_input" });
    await initialized;
    const romaji = [];
    for (const text of texts) {
      let reading = cache.get(text);
      if (!reading) {
        reading = await converter.convert(text, { to:"romaji", mode:"normal", romajiSystem:"hepburn" });
        if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value);
        cache.set(text, reading);
      }
      romaji.push(reading);
    }
    return send(res, 200, { romaji });
  } catch {
    return send(res, 503, { error:"conversion_failed" });
  }
});
server.requestTimeout = 10000;
server.listen(port, "0.0.0.0");
