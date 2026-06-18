# Translation And Dedup Audit

Date: 2026-06-18

## Scope

Audited current static data after the Russian question translation pass:

- `data/cards/*.json`
- `data/dsa/*.json`

The audit focuses on:

- Russian question translation completeness.
- Duplicate card questions.
- Duplicate task prompts.
- Obvious machine-translated question terms.

It does not claim that `answer.ru` and `explanation.ru` are production-ready. Those fields still need a separate quality pass.

## Current Counts

| Metric | Count |
| --- | ---: |
| Total items | 817 |
| Cards | 633 |
| Tasks | 184 |
| JavaScript cards | 477 |
| DSA cards | 156 |

## Translation Checks

| Check | Result |
| --- | ---: |
| Missing `question.en` | 0 |
| Missing `question.ru` | 0 |
| Missing task `title.ru` | 0 |
| Missing task `prompt.ru` | 0 |
| Obvious bad RU question terms | 0 |

Bad-term scan included historical failures such as:

- `Promise` translated as `обещание`.
- `slice` / `splice` translated as `срез` / `сращивание`.
- `Service Worker` translated as `сервисный работник`.
- `Babel` translated as `Вавилон`.
- Broken mixed phrases like `Как get ...` or `Что такое преимущества ...`.

## Duplicate Checks

| Check | Result |
| --- | ---: |
| Duplicate card IDs | 0 |
| Duplicate EN card questions | 0 |
| Duplicate RU card questions | 0 |
| Duplicate task IDs | 0 |
| Duplicate EN task prompts | 0 |

## Cleanup Done

Removed one real duplicate active card:

- Removed: `sudheerj-q-142-what-is-the-way-to-find-the-number-of-parameters-expected-by-a-functio`
- Kept: `sudheerj-q-471-how-to-find-the-number-of-parameters-expected-by-a-function`

Reason:

- Both cards asked the same `function.length` question.
- The kept card contains more complete source material about default parameters, rest parameters, and destructuring.

## Remaining Data Quality Issues

The full database audit still reports issues outside question translation:

- Empty RU explanations: 44.
- Exact or near answer/explanation duplicates.
- Long answers.
- Raw markdown/code/table artifacts in fallback strings.
- English leakage in RU answers/explanations.

These are answer/explanation curation tasks, not blockers for the current question translation and duplicate-question audit.

## Verification

Commands run:

```sh
node scripts/audit-content-database.mjs --summary
npm run build
```

Result:

- Data parses successfully.
- Production build passes.
- Duplicate question checks return 0.
