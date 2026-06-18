# Full Database Audit

Date: 2026-06-18

Scope:

- Full content database: `data/cards/*.json` and `data/dsa/*.json`.
- Visible trainer deck right now: JavaScript cards from `data/cards/*.json`.
- DSA cards and tasks are stored in the repository, but they are not visible in the current card trainer UI.

Current note:

- This audit contains historical issue counts from before the question-translation cleanup.
- `question.ru` has since been rewritten for all 633 cards.
- `answer.ru` and `explanation.ru` still need a separate quality pass.

Audit script:

```bash
node scripts/audit-content-database.mjs --summary
```

Curation marker script:

```bash
node scripts/mark-content-curation.mjs --write
```

## Database Size

Full database:

| Metric | Count |
| --- | ---: |
| Deck files | 19 |
| Total items | 817 |
| Cards | 633 |
| Tasks | 184 |
| JavaScript items | 505 |
| DSA items | 312 |

Current visible JavaScript card deck:

| File | Cards |
| --- | ---: |
| `js-core-1.json` | 207 |
| `js-core-2.json` | 147 |
| `browser.json` | 77 |
| `async-js.json` | 23 |
| `prototypes.json` | 15 |
| `react.json` | 8 |
| Total | 477 |

## Integrity

Good:

| Check | Result |
| --- | ---: |
| Duplicate IDs | 0 |
| Duplicate EN card questions | 0 |
| Duplicate task prompts | 0 |
| Invalid typed content blocks | 0 |

Problem:

| Check | Count |
| --- | ---: |
| Duplicate RU card questions | 1 |

Duplicate RU question:

- `sudheerj-q-142-what-is-the-way-to-find-the-number-of-parameters-expected-by-a-functio`
- `sudheerj-q-471-how-to-find-the-number-of-parameters-expected-by-a-function`

Both normalize to:

> как найти количество параметров ожидаемых функцией

## Full Database Issues

These counts include JavaScript, DSA, cards, and tasks.

| Issue | Count | Meaning |
| --- | ---: | --- |
| Empty EN required fields | 0 | English required fields are filled. |
| Empty RU required fields | 44 | After duplicate cleanup, these are empty explanations. |
| Empty EN explanations | 0 | English explanations are present. Some still need quality review. |
| Empty RU explanations | 44 | Explanation was removed because it duplicated answer. |
| Exact answer/explanation duplicates after normalization | 210 EN / 65 RU | Usually same content with formatting differences. Not safe for blind deletion. |
| Near answer/explanation duplicates | 197 EN / 153 RU | Explanation mostly repeats answer semantically. Needs rewrite. |
| Very long answers | 90 EN / 95 RU | Too large for a flashcard answer. |
| Raw markdown tables | 110 | Should become typed `table` blocks or be rewritten. |
| ASCII table artifacts | 114 | Broken table separators still inside text. |
| Fenced code inside string fields | 735 | Raw source strings still preserve imported markdown. The UI should prefer typed blocks when present. |
| Markdown headings in string fields | 625 | Imported article structure still exists. |
| Markdown lists in string fields | 930 | Many fields still contain raw list formatting. |
| High English leakage in RU fields | Historical | Fixed for questions; still relevant for answers/explanations. |
| Suspicious RU technical terms | Historical | Fixed for questions; still relevant for answers/explanations. |
| Implementation-like DSA cards | 156 | These are algorithm tasks stored as cards; keep hidden until IDE/task mode exists. |

Important interpretation:

The previous duplicate cleanup removed only mechanically safe duplicate text. The remaining normalized duplicates are not safe to delete blindly because many explanations contain markdown, tables, code, or slightly richer wording. They must be rewritten or converted into typed blocks.

## Visible JS Card Deck Issues

These are the 477 cards currently used by the trainer.

| File | Empty RU explanations | Empty EN explanations | Exact duplicates EN/RU | Near duplicates EN/RU | Markdown tables | Code fences | High EN in RU | Suspicious RU terms | Typed cards |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `js-core-1.json` | 9 | 0 | 78 / 9 | 17 / 30 | 4 | 348 | 151 | 16 | 88 |
| `js-core-2.json` | 17 | 0 | 53 / 13 | 14 / 39 | 12 | 175 | 71 | 24 | 43 |
| `browser.json` | 13 | 0 | 29 / 7 | 4 / 20 | 5 | 88 | 39 | 16 | 22 |
| `async-js.json` | 4 | 0 | 10 / 2 | 6 / 6 | 1 | 20 | 8 | 34 | 10 |
| `prototypes.json` | 1 | 0 | 6 / 1 | 1 / 4 | 2 | 22 | 8 | 0 | 7 |
| `react.json` | 0 | 0 | 3 / 2 | 0 / 5 | 0 | 6 | 0 | 0 | 3 |

Worst visible files:

1. `js-core-1.json`
   - Largest deck: 208 cards.
   - 151 RU fields with heavy English leakage.
   - 348 fenced code blocks still preserved in source strings.
   - 95 answer/explanation duplicate or near-duplicate pairs.

2. `js-core-2.json`
   - 147 cards.
   - 17 empty RU explanations.
   - 67 duplicate or near-duplicate EN pairs and 52 duplicate or near-duplicate RU pairs.
   - 12 markdown tables and 12 ASCII table artifacts.

3. `browser.json`
   - 77 cards.
   - Many API terms were translated too literally.
   - 39 RU fields with heavy English leakage.
   - 13 empty RU explanations.

## Typed Content Status

Current typed content coverage:

| Metric | Count |
| --- | ---: |
| Items with typed content | 333 |
| Total typed blocks | 944 |
| Text blocks | 433 |
| Code blocks | 506 |
| Table blocks | 5 |
| Invalid typed blocks | 0 |

Typed content is valid. Code fenced in markdown and malformed loose code blocks have been migrated into explicit `type: "code"` blocks for 329 additional items, while original imported strings remain as source text.

Code example representation:

- Use `ContentBlock` with `type: "code"` as the JSON-level `code_example`.
- The UI must render only this explicit block as an IDE-style snippet.
- Normal prose must stay normal text.
- Tables must become `type: "table"` blocks instead of being guessed from raw text.

## Curation Metadata

Every item can now carry a `curation` object. This is work metadata only; it does not change what the UI shows.

Important source rule:

- `question.en` and `answer.en` are treated as source text.
- Do not rewrite them mechanically.
- If they need improvement, mark the card with `curation.needsAnswerReview` and fix manually.

Current curation marks across the full database:

| Flag | Count |
| --- | ---: |
| Marked items | 777 / 817 |
| `needsCodeExample` | 393 |
| `needsExplanation` | 407 |
| `needsTypedContent` | 398 |
| `needsTranslationReview` | 477 |
| `needsAnswerReview` | 90 |

Visible JavaScript deck curation marks:

| File | Items | Marked | Code example | Explanation | Typed content | Translation review | Answer review |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `js-core-1.json` | 220 | 201 | 31 | 107 | 25 | 159 | 3 |
| `js-core-2.json` | 157 | 147 | 45 | 77 | 37 | 77 | 2 |
| `browser.json` | 78 | 72 | 20 | 34 | 14 | 43 | 1 |
| `async-js.json` | 26 | 24 | 10 | 19 | 8 | 22 | 1 |
| `prototypes.json` | 17 | 15 | 5 | 9 | 3 | 10 | 0 |
| `react.json` | 8 | 7 | 3 | 3 | 5 | 0 | 0 |

The `needsCodeExample` flag is the marker requested for questions/answers that would benefit from a code example and do not already have a typed `code` block.

## Main Problems

### 1. Explanations Are Missing Or Redundant

The duplicate cleanup did its job, but it exposed the real state:

- Some explanations are now empty because they were exact duplicates.
- Many remaining explanations still repeat the answer with formatting changes.
- Explanations should add mechanics, gotchas, examples, or interview nuance.

### 2. RU Answers And Explanations Still Need Review

Question translations have been cleaned up. Remaining RU answer/explanation fields may still contain:

- Entire English explanations.
- Literal translations of technical terms.
- Raw imported prose that does not sound like interview prep.

### 3. Imported Markdown Is Still Raw Data

The database still stores imported markdown as plain strings:

- Tables.
- Code fences.
- Headings.
- Lists.

This should be converted into typed blocks only when it helps the card. The UI should not guess.

### 4. DSA Is Not Ready For Card UI

DSA contains 156 implementation-like cards and 156 tasks.

Decision: keep DSA hidden from the card trainer until a proper task/IDE flow exists.

## Recommended Fix Order

1. Fill empty explanations in visible JS cards.
   - Start with `js-core-2.json`, `browser.json`, then `js-core-1.json`.
   - Do not restore duplicate text.
   - Write short explanations that add actual value.

2. Rewrite duplicate and near-duplicate explanations.
   - If explanation only repeats answer, replace it with mechanics/gotchas.
   - If explanation has useful code/table content, move it into typed blocks.

3. Fix RU answers and explanations topic by topic.
   - Start with cards where explanation is empty or duplicates the answer.
   - Keep JS/API names in English/code form.

4. Convert raw markdown into typed content.
   - Tables to `table`.
   - Code examples to `code`.
   - Real lists to `list`.
   - Remove markdown headings from card text.

5. Keep DSA out of the current card flow.
   - Later, expose it under task mode only.

## Next Batch Recommendation

Start with empty explanations in visible JS cards:

1. `js-core-2.json`: 17 RU / 27 EN empty explanations.
2. `browser.json`: 13 RU / 19 EN empty explanations.
3. `js-core-1.json`: 9 RU / 16 EN empty explanations.

This is the cleanest next step because empty explanations are unambiguous defects after the duplicate-removal pass.

## Cleanup Log

### 2026-06-18: Empty English Explanations Filled

Script: `scripts/fill-visible-js-empty-explanations.mjs`

Scope: visible JavaScript cards from `data/cards/*.json`.

Changes:

- Added 73 missing `explanation.en` values.
- Did not modify `question.en`.
- Did not modify `answer.en`.
- Re-ran curation markers after the update.

Result:

- `emptyExplanationEn`: 0 across the full database.
- `emptyRequiredEn`: 0 across the full database.

Remaining:

- `emptyExplanationRu`: 44.
- Existing EN explanations that are still duplicate/near-duplicate because they contain imported markdown, code, tables, or article-style prose.
- Typed-content migration is still needed.

### 2026-06-18: Russian Question Translation Pass

Scripts:

- `scripts/translate-js-questions-ru.mjs`
- `scripts/translate-dsa-questions-ru.mjs`

Scope:

- `question.ru` in `data/cards/*.json`.
- `question.ru` in `data/dsa/*.json`.

Changes:

- Rewrote all active JavaScript card questions in professional Russian.
- Normalized all DSA card questions while preserving canonical task names in backticks.
- Did not modify `question.en`, `answer.en`, or source metadata.

Validation:

- 633 / 633 cards have `question.ru`.
- Obvious bad question-term audit returns 0.
- JSON parse check passes.
- Production build passes.

Remaining:

- Re-audit and rewrite Russian answers and explanations.
- Update `curation.needsTranslationReview` to distinguish question, answer, and explanation review states.
