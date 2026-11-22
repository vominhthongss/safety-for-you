import { useEffect, useMemo, useState } from "react";
import { toRomaji } from "wanakana";
import { CONFIG } from "./config";

const JAPANESE = /[\u3040-\u30ff\u3400-\u9fff]/;
const KANJI = /[\u3400-\u9fff]/;
const MAX_ITEMS = 400;
const MAX_TEXT = 160;

export const hasJapanese = (value) => JAPANESE.test(String(value || ""));
const isKanji = (value) => KANJI.test(String(value || ""));
const short = (value) => String(value || "").slice(0, MAX_TEXT);

/**
 * A local reading is safe only when the original contains kana and no kanji.
 * Wanakana cannot infer kanji pronunciation: it transliterates kana only.
 */
export function toLocalRomaji(text) {
  const value = String(text || "");
  if (!hasJapanese(value) || isKanji(value)) return "";
  return toRomaji(value).trim();
}

/** No "Romaji:" prefix or missing-reading placeholder. Keep Japanese original. */
export function showJapaneseWithRomaji(text, readings = {}) {
  const value = String(text || "");
  if (!hasJapanese(value)) return value;
  const reading = readings[value] || toLocalRomaji(value);
  if (!reading || reading === value) return value;
  return value + "\n" + reading;
}

/**
 * Kanji requires morphological analysis. Kuroshiro + Kuromoji runs in the
 * optional HTTPS service, not the React Native bundle (Kuromoji requires
 * dictionary files and is not React Native / Expo Go compatible).
 */
export function useJapaneseReadings(input = []) {
  const [readings, setReadings] = useState({});
  const candidates = useMemo(() =>
    [...new Set(input.filter((text) => hasJapanese(text) && isKanji(text))
      .map(short))].slice(0, MAX_ITEMS), [input]);

  useEffect(() => {
    if (!CONFIG.romajiService || !candidates.length) return;
    const controller = new AbortController();
    let mounted = true;

    async function load() {
      const entries = {};
      for (let i=0;i<candidates.length;i+=20) {
        if (!mounted || controller.signal.aborted) return;
        const batch = candidates.slice(i,i+20);
        try {
          const response = await fetch(CONFIG.romajiService + "/romaji", {
            method:"POST", signal:controller.signal,
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({texts:batch})
          });
          if (!response.ok) break;
          const data = await response.json();
          if (!Array.isArray(data.romaji)) break;
          batch.forEach((text,j) => {
            const result = data.romaji[j];
            if (typeof result === "string" && result.trim() &&
              result !== text && !isKanji(result)) entries[text] = result.trim();
          });
        } catch { break; }
      }
      if (mounted && Object.keys(entries).length) {
        setReadings((previous) => ({ ...previous, ...entries }));
      }
    }
    load();
    return () => { mounted = false; controller.abort(); };
  }, [candidates]);

  return readings;
}
