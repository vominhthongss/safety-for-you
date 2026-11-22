import { useEffect, useMemo, useRef, useState } from "react";
import { CONFIG } from "./config";

export const hasJapanese = (value) => /[\u3040-\u30ff\u3400-\u9fff]/.test(String(value || ""));
const limit = (text) => String(text || "").slice(0, 160);

// Render original Japanese and its Romaji reading together. If readings are unavailable,
// never claim a guessed romanization is correct: show an explicit unavailability note.
export function showJapaneseWithRomaji(text, readings = {}) {
  const value = String(text || "");
  if (!hasJapanese(value)) return value;
  return value + "\n" + (readings[value] || "Romaji: unavailable");
}

export function useJapaneseReadings(input = []) {
  const [readings, setReadings] = useState({});
  const requested = useRef(new Set());
  const candidates = useMemo(() =>
    [...new Set(input.filter(hasJapanese).map(limit))].slice(0, 400),
    [input]
  );
  useEffect(() => {
    if (!CONFIG.romajiService) return;
    const next = candidates.filter((text) => !requested.current.has(text)).slice(0, 20);
    if (!next.length) return;
    next.forEach((text) => requested.current.add(text));
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    fetch(CONFIG.romajiService + "/romaji", {
      method: "POST", signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: next })
    }).then(async (res) => {
      if (!res.ok) throw Error("Romaji service unavailable");
      return res.json();
    }).then((data) => {
      if (!active || !Array.isArray(data?.romaji)) return;
      const update = {};
      next.forEach((text, i) => {
        if (typeof data.romaji[i] === "string" && data.romaji[i].trim()) {
          update[text] = data.romaji[i];
        }
      });
      setReadings((prev) => ({ ...prev, ...update }));
    }).catch(() => {}).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); };
  }, [candidates]);
  return readings;
}
