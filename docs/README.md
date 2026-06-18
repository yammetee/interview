# Interview Trainer Docs

This directory describes the current Interview Trainer MVP: a static single-page app for keeping interview knowledge warm through flashcards.

Read in this order:

1. [Product Spec](./product-spec.md)
2. [Data Schema](./data-schema.md)
3. [Architecture](./architecture.md)
4. [Design Code](./design-code.md)
5. [Account And Feedback Spec](./account-and-feedback.md)
6. [Knowledge Base Roadmap](./knowledge-base-roadmap.md)
7. [Content Usage And License Notes](./content-usage-and-license.md)
8. [Documentation Audit](./documentation-audit.md)
9. [Translation And Dedup Audit](./card-material/translation-dedup-audit.md)
10. [SudheerJ JS Import Report](./card-material/sudheerj-import-report.md)
11. [SudheerJ DSA Import Report](./card-material/sudheerj-dsa-import-report.md)

## Current Content Base

The project no longer uses manually written cards. The current base is imported from two open-source SudheerJ repositories:

| Dataset | Source | Cards | Tasks | Duplicate skips |
| --- | --- | ---: | ---: | ---: |
| JavaScript interview | `sudheerj/javascript-interview-questions` | 477 | 28 | 1 card + 1 task duplicate removed |
| Data structures and algorithms | `sudheerj/datastructures-algorithms` | 156 | 156 | 1 card + 1 task duplicate removed |
| Total |  | 633 | 184 | 4 duplicate items removed |

Generated data lives in:

- `data/cards/*.json` for JavaScript interview cards.
- `data/dsa/*.json` for data structures and algorithms.
- `data/coding-exercise/sudheerj/**` for JavaScript exercises.
- `data/coding-exercise/sudheerj-dsa/**` for DSA source code and documentation.

Current quality status:

- 817 total training items.
- 0 duplicate prompts after cleanup.
- 0 missing Russian question translations.
- 0 missing source metadata.
- Russian answers and explanations still need a separate quality pass.

Active UI scope:

- The current trainer shows 477 JavaScript theory/mental-review cards.
- Implementation tasks and DSA `How do you solve or implement ...` cards are hidden until the app has a coding-practice mode.
- The hidden content remains in `data/` for later use.

## MVP Summary

The app should open directly into the trainer, without backend, accounts, dashboards, or voice recording.

Required training modes:

- Random 20-card deck from the active card pool.
- Topic training by one-word topic buttons.
- Infinite slider navigation with previous/next controls and swipe.

Card flow:

- Front side: question.
- User answers out loud.
- Click card to flip.
- Back side: direct answer plus explanation in the scrollable card area.
- `Known` hides the card from normal pools until progress reset.
- `Review` keeps the card eligible for future sessions.

## Next Backend Layer

The next planned product layer is documented in [Account And Feedback Spec](./account-and-feedback.md).

Scope:

- Report issue button on cards.
- User report form with max 2 active unresolved reports per user.
- Personal cabinet with profile, reports, stats, and reset progress.
- Admin reports screen with resolved/unresolved handling.
- Optional GitHub avatar via username.

## Knowledge Base Vision

The long-term expansion strategy is documented in [Knowledge Base Roadmap](./knowledge-base-roadmap.md).

Direction:

- Grow from JavaScript cards into a multi-language programming knowledge base.
- Keep cards atomic, source-backed, typed, deduplicated, and curated.
- Add new domains through a repeatable import and quality pipeline.
- Keep coding tasks hidden until an IDE/task mode exists.
