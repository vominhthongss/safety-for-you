# Documentation style guide

## Purpose and audience

Write technical documentation for maintainers, contributors, store publishers, and reviewers. Use a formal, neutral, precise register in **every supported language**. Avoid regional dialect, slang, conversational filler, marketing claims, and unexplained abbreviations. Keep platform and command names verbatim when they refer to official tooling.

## Required document structure

- **Overview and scope:** explain the documented workflow and its limitations.
- **Prerequisites:** state required accounts, tools, permissions, SDK versions, and unimplemented setup explicitly.
- **Configuration:** show real repository paths, configuration names, and redacted/example values; distinguish mandatory from optional services.
- **Procedure:** provide ordered steps and runnable commands in fenced `bash` or `json` blocks; do not invent configuration files or credentials that do not yet exist.
- **Verification and troubleshooting:** separate JS bundle validation, simulator tests, physical-device testing, signed builds, upload status, and review approval.
- **Safety, privacy, and release control:** identify data-source limits, location permissions, signing secrets, and production-release risks.
- **References:** link to official documentation and stable project files; verify material, time-sensitive rules before changing the guide.

## Localization requirements

The application supports exactly these documentation locales: `en`, `ja`, `vi`, `zh-CN`, `zh-TW`, `ko`, `tl`, `ne`, `id`, `pt`, `my`, `th`, `hi`. Maintain parallel coverage in `docs/adr/ADR-0001.<locale>.md`, `docs/deploy/DEPLOY.<locale>.md`, and `docs/stores/STORE_RELEASE.<locale>.md` whenever shared behavior or release steps change. Avoid leaving explanatory English paragraphs in a non-English guide; technical command names, identifiers, and names of official systems may remain in their original language. In Japanese UI guidance, the language picker label is `日本語` without Romaji.

## Safety and accuracy rules

- The iOS map is Apple Maps via `react-native-maps`; the Android map uses `react-native-webview`, Leaflet, and OSM Japan.
- JMA headline-only Worker output does **not** prove a warning is active. Do not infer earthquake intensity, tsunami wave movement/inundation, shelter availability, or validated place readings.
- Maintain visible source attribution, issue timestamps, error/fallback states, and an explicit warning that this app cannot replace official emergency instructions.
- Do not call a release complete merely because `npx expo export` or `eas submit` succeeded. Approval and physical-device checks must be verified separately.

## Review checklist

1. Verify referenced paths and commands against repository source and current official provider guidance.
2. Confirm all 13 locale links resolve and have equivalent technical scope.
3. Run `npm test`, `npx expo install --check`, and both platform exports when dependencies are available.
4. Inspect Markdown code fences, links, and cross-references; do not expose credentials or private keys.
5. Explain known blockers and avoid claiming tests or store approval that were not actually performed.
