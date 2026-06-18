# Theory Cards Content Audit

Date: 2026-06-18

Scope: active theoretical JavaScript cards from `data/cards/*.json`.

DSA cards and implementation tasks are excluded from the active trainer UI right now, so this audit focuses on the 477 theoretical cards currently shown to the user.

## Result

The Russian answer/explanation base is not production-quality yet.

Question translations were cleaned up after this audit. The remaining problem is not isolated typo-level translation in questions; it is answer/explanation quality and formatting:

- Many answers are too long for flashcards.
- Many explanations duplicate answers instead of explaining them.
- Markdown tables and code formatting were flattened into unreadable text.
- Some explanations are still English.
- Some raw imported markdown still exists in fallback strings, although typed content is now available for many code blocks.

Current question status:

- All 477 active JavaScript cards have `question.ru`.
- Obvious bad question terms such as translated `Promise`, `slice`, `splice`, `Service Worker`, and `Babel` were removed.
- API and language terms stay in English/code form where appropriate.

## Counts

Total active theory cards: 477.

By topic:

| Topic | Cards |
| --- | ---: |
| Scope, Hoisting, TDZ, Closures | 207 |
| this, call, apply, bind | 147 |
| Browser, Networking, Storage | 77 |
| Event Loop, Promise, async/await | 23 |
| Prototype, Prototype Chain, Class | 15 |
| React, Rendering, Memoization | 8 |

Detected issue counts:

| Issue | Count | Meaning |
| --- | ---: | --- |
| Exact answer/explanation duplicate | 57 | `answer.ru` and `explanation.ru` are effectively the same text. |
| Near answer/explanation duplicate | 94 | Explanation mostly repeats the answer. |
| Very long answer | 54 | Answer is too large for the back side of a flashcard. |
| Long answer | 110 | Answer should likely be shortened and moved into explanation. |
| Answer contains raw markdown/table | 15 | The answer is not readable as plain card text. |
| Explanation contains raw markdown/table | 367 | Markdown/code/table formatting is visible as text. |
| ASCII table separators | 18 | Flattened tables like `-----` are shown to the user. |
| Suspicious translated JS terms | Historical | Fixed for `question.ru`; answers/explanations still need review. |
| English/code leakage in RU fields | Historical | Fixed for `question.ru`; answers/explanations still need review. |

## Critical Examples

### `slice` / `splice`

Card: `sudheerj-q-007-what-is-the-difference-between-slice-and-splice`

Old broken question:

> В чем разница между срезом и сращиванием

Problems:

- `slice` and `splice` must not be translated as `срез` and `сращивание`.
- The answer is a flattened markdown table.
- The answer is too long.
- The explanation duplicates the same table.

Expected style:

Question:

> В чем разница между `slice()` и `splice()`?

Short answer:

> `slice()` возвращает копию части массива и не меняет исходный массив. `splice()` меняет исходный массив: удаляет, заменяет или вставляет элементы.

Explanation:

> `slice(start, end)` удобно использовать для чтения части массива. `splice(start, deleteCount, ...items)` используют для мутации массива. Главное отличие для интервью: `slice` immutable, `splice` mutable.

### Promise

Examples:

- `sudheerj-q-052-what-is-a-promise`
- `sudheerj-q-053-why-do-you-need-a-promise`
- `sudheerj-q-062-what-are-the-main-rules-of-promise`

Old problems:

- `Promise` was often translated as `обещание`.
- Questions sound unnatural: `Зачем тебе обещание`.
- Answers are too long.
- Explanations often duplicate answers or remain partly English.

Expected rule:

- Keep `Promise` as `Promise` or `промис`.
- Use natural interview phrasing.
- Answer should be short; explanation should explain mechanics and edge cases.

### Browser APIs

Examples:

- `sudheerj-q-032-what-is-a-service-worker`
- `sudheerj-q-037-what-is-a-post-message`
- `sudheerj-q-058-what-are-server-sent-events`

Problems:

- Literal translations: `сервисный работник`, `почтовое сообщение`, `прослушиватели событий`.
- Exact answer/explanation duplicates.

Expected rule:

- Use accepted terms: `service worker`, `postMessage`, `Server-Sent Events`, `event listener`.
- Translate the explanation, not the API names.

## Topic Risk

### Worst topics

`Scope, Hoisting, TDZ, Closures`

- 207 cards.
- 10 exact duplicates.
- 28 near duplicates.
- 63 long or very long answers.
- 184 explanations contain raw markdown/table/code formatting.
- 139 cards have high English/code leakage in RU fields.

`this, call, apply, bind`

- 147 cards.
- 23 exact duplicates.
- 37 near duplicates.
- 53 long or very long answers.
- 103 explanations contain raw markdown/table/code formatting.

`Browser, Networking, Storage`

- 77 cards.
- 17 exact duplicates.
- 16 near duplicates.
- 28 long or very long answers.
- 50 explanations contain raw markdown/table/code formatting.

## Required Rewrite Rules

Every theoretical card should follow this shape:

Question:

- Natural Russian.
- JavaScript API names stay in English/code form: `slice()`, `Promise`, `callback`, `event loop`.
- No literal machine translation of programming terms.

Answer:

- 1-3 short paragraphs or bullets.
- Directly answers the question.
- No markdown tables.
- No long code blocks.
- No copied long-form article text.

Explanation:

- Must not duplicate the answer.
- Explains why the answer is correct.
- Adds mechanics, gotchas, or interview nuance.
- Can be longer than answer, but must stay readable on a card.

Formatting:

- Use backticks for code terms.
- Convert markdown tables into short bullets.
- Keep examples compact.
- Avoid English prose in RU fields unless it is an API/library name.

## Suggested Fix Order

1. Re-audit `answer.ru` and `explanation.ru` after the question-translation pass.
2. Fix exact and near answer/explanation duplicates.
3. Convert table cards into typed tables or short bullet cards.
4. Shorten all answers over 700 characters.
5. Rewrite explanations that mostly repeat answers.
6. Run another audit.

## Important Decision

Do not mass-translate the whole answer/explanation base blindly.

The correct workflow should be topic-by-topic manual curation with automated checks after each batch.

Recommended first batch:

`data/cards/js-core-1.json`

Reason:

- It contains the visible broken `slice/splice` card.
- It is the largest and most damaged topic.
- It includes many fundamental interview questions that the user will see often.

## Cleanup Log

### 2026-06-18: Duplicate Explanation Pass

Script: `scripts/cleanup-duplicate-explanations.mjs`

Scope: cards from `data/cards/*.json`. Tasks and DSA files were not changed in this pass.

Changes:

- 258 cards touched.
- 117 full duplicate explanation fields removed.
- 224 duplicate explanation prefixes removed while preserving the remaining explanation text.
- Languages changed: 258 `en` fields, 83 `ru` fields.

Validation:

- Re-running the script in dry-run mode returns 0 changes.
- JSON parses successfully.
- Production build passes.

Important limitation:

This pass only removes mechanically detectable duplication. It does not rewrite bad translations, shorten overlong answers, or fix explanations that repeat the answer semantically with different wording.

### 2026-06-18: Question Translation Pass

Scripts:

- `scripts/translate-js-questions-ru.mjs`
- `scripts/translate-dsa-questions-ru.mjs`

Scope:

- `question.ru` in `data/cards/*.json`.
- `question.ru` in `data/dsa/*.json`.

Changes:

- Professionally rewrote Russian questions for 477 JavaScript cards.
- Normalized 156 DSA question prompts to `Как решить или реализовать задачу ...?`.
- Preserved English source questions.
- Preserved code/API names and canonical task names.

Validation:

- 633 / 633 cards have `question.ru`.
- Obvious machine-translated question terms audit returns 0.
- Production build passes.

Remaining:

- `answer.ru` and `explanation.ru` still need a separate curation pass.
