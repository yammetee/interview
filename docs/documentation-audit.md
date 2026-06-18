# Documentation Audit

Date: 2026-06-18

## Scope

Reviewed documentation under `docs/` against the current repository state:

- React/Vite SPA in `src/App.tsx`, `src/data.ts`, and `src/styles.css`.
- Static content in `data/cards/*.json` and `data/dsa/*.json`.
- Import and cleanup scripts in `tools/` and `scripts/`.

## Current Source Of Truth

| Area | Current truth |
| --- | --- |
| UI | Minimal single-page trainer with compact topic buttons, `Random`, stats tags, theme toggle, language toggle, and card slider. |
| Active cards | 477 JavaScript theory/mental-review cards from `data/cards/*.json`. |
| Stored cards | 633 total cards: 477 JavaScript + 156 DSA. |
| Stored tasks | 184 total tasks: 28 JavaScript + 156 DSA. |
| Active DSA | Hidden from the current trainer because DSA cards are implementation-style prompts. |
| Active tasks | Hidden until a real task/coding mode exists. |
| Progress | Local-only progress in `localStorage`; `Known` cards are excluded until reset. |
| Languages | UI supports RU/EN. All card and DSA questions have `question.ru`; answers/explanations still need separate curation. |
| Typed content | 333 items have typed content; 944 typed blocks exist, including 506 code blocks and 5 table blocks. |
| Backend | Not implemented. Account, reports, profile, admin flow are planned next-layer docs only. |

## Findings

### 1. Product Docs Mixed Old And Current UX

Some docs still described older modal/drawer or button-heavy flows:

- `Show answer` as a separate control.
- Practical task screen as an MVP acceptance requirement.
- Optional difficulty indicator on cards.
- Larger navigation/page concepts that conflict with the current minimal top row.

Correct current UX:

- Card itself flips in place.
- No normal-card modal/drawer.
- No top nav tabs.
- No difficulty in card UI.
- Explanation is shown on the back side inside the scrollable card area.
- `Known` / `Review` actions live on the card and update local status.

### 2. Content Scope Needed Clearer Separation

The repository contains 633 cards, but the current trainer should use only 477 active JavaScript cards.

DSA content is translated and stored, but it is intentionally inactive until a coding/task flow exists.

### 3. Translation Status Was Outdated

Older audits said RU questions were broadly unreliable and listed bad terms such as translated `Promise`, `slice`, `splice`, and `Service Worker`.

Current state after the question-translation pass:

- `question.ru` is present for all 633 cards.
- Obvious bad question terms were removed.
- Canonical API/code terms remain in English/code form.
- `answer.ru` and `explanation.ru` still require separate quality work.

### 4. Typed Content Reports Were Stale

`typed-content-analysis.md` previously said only 5 cards had typed content. Current data has:

- 333 typed items.
- 944 typed blocks.
- 506 code blocks.
- 5 table blocks.

### 5. Architecture Doc Was More Aspirational Than Actual

The recommended future folder structure is still useful, but the current implementation is intentionally compact:

- `src/App.tsx`
- `src/data.ts`
- `src/styles.css`

Docs now need to label this as current implementation, not only suggested architecture.

## Decisions

- Keep current MVP static-first.
- Keep DSA and implementation tasks hidden until a proper task/coding mode exists.
- Treat English source text as source-backed original content.
- Treat Russian questions as curated enough for active use.
- Treat Russian answers and explanations as the next content-quality target.
- Keep `curation.needsTranslationReview` until answers/explanations are reviewed; do not interpret it as meaning questions are still broken.
- Do not delete source/import docs yet because license and provenance are still important.

## Required Follow-Up

1. Re-audit and rewrite `answer.ru` and `explanation.ru` topic by topic.
2. Re-run or update curation markers so translation flags distinguish questions from answers/explanations.
3. Continue typed-content migration for tables, code examples, and real lists.
4. Add a real validation script for documentation-sensitive counts.
5. Keep docs updated whenever active content scope changes.
