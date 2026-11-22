# Japanese / Romaji conversion (optional self-hosted service)

Dynamic P2PQuake place names, JMA bulletins, shelter names and addresses can contain Kanji. Kanji has context-sensitive readings: **never romanize character by character or invent pronunciation**.

This optional Node.js 22+ service uses Kuroshiro and the Kuromoji dictionary to generate Hepburn Romaji.

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

Expose it behind an HTTPS reverse proxy with TLS, rate limits and abuse protection. Set `EXPO_PUBLIC_ROMAJI_API_URL=https://your-domain.example` in the Expo app `.env`. Restart Metro. Example request: POST `/romaji` with JSON `{"texts":["地震","名古屋市"]}` -> `{"romaji":["jishin","nagoya-shi"]}` (example readings; exact tokenizer output may vary).

If unset or offline, the app displays the **original Japanese only** without a placeholder or guessed reading. WanaKana converts Kana locally. Japanese static interface strings are bundled with manually provided Romaji and work offline.

**Safety note:** Dictionary tokenization sometimes misreads people/place names or technical terminology. Validate critical readings with humans; never use automatic readings to change evacuation destinations. API text submitted to this service includes bulletin and location names, not raw GPS coordinates.
