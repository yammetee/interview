# Typed Content Analysis

Date: 2026-06-18

Scope: active theoretical JavaScript cards from `data/cards/*.json`.

This report is about data shape, not UI styling. The UI must not guess content type from plain strings. Code blocks, tables, and lists must be represented explicitly in JSON with typed content blocks.

## Current State

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

Historical formatting candidates from the first audit:

| Candidate | Cards | Meaning |
| --- | ---: | --- |
| Markdown tables | 18 | These should become `table` blocks. |
| ASCII table separators | 17 | These are broken tables flattened into text. |
| Fenced code blocks | 332 | These should become explicit `code` blocks where they are real examples. |
| Markdown-like lists | 136 | These should become `list` blocks only when they are actual answer structure. |
| Inline backtick terms | 207 | These are mostly API names and should usually stay normal prose. |
| Long plain fields | 91 | These fields need content rewriting before visual polishing. |

## Required JSON Shape

Typed content is optional. Old string fields remain as fallback while the base is being migrated.

```ts
type ContentBlock =
  | { type: "text"; text: LocalizedText }
  | { type: "code"; language?: "js" | "ts" | "jsx" | "tsx" | "html" | "css" | "json" | "text"; code: LocalizedText }
  | { type: "table"; headers: LocalizedText[]; rows: LocalizedText[][] }
  | { type: "list"; items: LocalizedText[] };
```

Flashcards can use:

```ts
questionContent?: ContentBlock[];
answerContent?: ContentBlock[];
explanationContent?: ContentBlock[];
```

Rules:

- Normal text is normal text. Do not render it as an IDE block.
- Code is rendered as an IDE block only when a JSON block has `type: "code"`.
- Tables are rendered as tables only when a JSON block has `type: "table"`.
- API names such as `slice()`, `Promise`, `call()`, `bind()` do not automatically make the whole paragraph code.
- Raw markdown tables must be removed from final card fields.

## High-Priority Table Cards

These cards currently contain broken table-like content and should be migrated first:

| Card | File | Fields |
| --- | --- | --- |
| `sudheerj-q-395-what-are-the-differences-between-promises-and-observables` | `async-js.json` | answer, explanation |
| `sudheerj-q-042-what-are-the-differences-between-cookie-local-storage-and-session-stor` | `browser.json` | answer, explanation |
| `sudheerj-q-061-what-are-the-events-available-for-server-sent-events` | `browser.json` | answer, explanation |
| `sudheerj-q-077-what-is-the-difference-between-window-and-document` | `browser.json` | answer, explanation |
| `sudheerj-q-007-what-is-the-difference-between-slice-and-splice` | `js-core-1.json` | answer, explanation |
| `sudheerj-q-019-what-is-the-difference-between-let-and-var` | `js-core-1.json` | answer, explanation |
| `sudheerj-q-075-what-is-the-difference-between-null-and-undefined` | `js-core-1.json` | answer, explanation |
| `sudheerj-q-081-what-are-the-differences-between-undeclared-and-undefined-variables` | `js-core-1.json` | answer, explanation |
| `sudheerj-q-157-what-are-modifiers-in-regular-expression` | `js-core-1.json` | answer, explanation |
| `sudheerj-q-003-what-is-the-difference-between-call-apply-and-bind` | `js-core-2.json` | explanation |
| `sudheerj-q-008-how-do-you-compare-object-and-map` | `js-core-2.json` | answer, explanation |
| `sudheerj-q-229-what-are-the-different-error-names-from-error-object` | `js-core-2.json` | answer, explanation |

## Migration Plan

1. Keep UI fallback plain. No heuristic formatting in the app.
2. Migrate table-heavy cards first because they are visibly broken.
3. For each migrated card, rewrite `question.ru`, `answer.ru`, and `explanation.ru` manually.
4. Add `answerContent` and `explanationContent` only where typed blocks improve readability.
5. After each topic batch, rerun audits for duplicates, long answers, raw markdown, and English leakage.

Recommended first batch:

`data/cards/js-core-1.json`, starting with `slice/splice`, `let/var`, `null/undefined`, and undeclared/undefined cards.

## Migrated So Far

Current typed content coverage after migration:

| Metric | Count |
| --- | ---: |
| Typed items | 333 |
| Total typed blocks | 944 |
| Text blocks | 433 |
| Code blocks | 506 |
| Table blocks | 5 |
| List blocks | 0 |

Important:

- Typed content currently exists only in `data/cards/*.json`.
- DSA cards/tasks do not yet have typed content blocks.
- The UI renders typed `code` blocks as IDE-style snippets.
- The UI renders typed `table` blocks as tables.
- Normal prose remains normal prose.

Initial typed cards after the first cleanup pass were:

| Card | File | Typed fields |
| --- | --- | --- |
| `sudheerj-q-007-what-is-the-difference-between-slice-and-splice` | `js-core-1.json` | `answerContent`, `explanationContent` |
| `sudheerj-q-019-what-is-the-difference-between-let-and-var` | `js-core-1.json` | `answerContent`, `explanationContent` |
| `sudheerj-q-075-what-is-the-difference-between-null-and-undefined` | `js-core-1.json` | `answerContent`, `explanationContent` |
| `sudheerj-q-081-what-are-the-differences-between-undeclared-and-undefined-variables` | `js-core-1.json` | `answerContent`, `explanationContent` |
| `sudheerj-q-003-what-is-the-difference-between-call-apply-and-bind` | `js-core-2.json` | `answerContent`, `explanationContent` |
