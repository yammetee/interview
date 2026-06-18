# Interview Trainer Product Spec

## 1. Purpose

Interview Trainer is a single-page application for maintaining interview knowledge through flashcards.

The first version is intentionally minimal: no account, no backend, no voice recording, no dashboard. The user opens the app, starts a session, answers out loud, flips the card, checks the answer, and moves forward.

The product should feel like a daily knowledge game, not a static textbook.

## 2. Goals

- Help the user regularly refresh JavaScript, React, browser, data structure, and algorithm knowledge.
- Use a large source-backed base instead of weak generated cards.
- Support focused training by topic and broad mixed training across all content.
- Keep source attribution available for every imported item.
- Keep the architecture ready for future spaced repetition, progress tracking, and personal accounts.
- Grow toward a multi-language programming knowledge base without lowering card quality.

## 3. Non-Goals For MVP

- User accounts.
- Backend API.
- Cloud sync.
- Voice recording or answer transcription.
- Full Anki algorithm implementation.
- Public sharing of decks.
- Admin panel for editing cards.
- Long-form courses.

Account, profile, report, and admin-report features are planned for the next backend-backed layer, not the current static MVP. See [Account And Feedback Spec](./account-and-feedback.md).

## 4. Target User

A frontend developer preparing for interviews and trying to keep knowledge warm over time.

The user is expected to already know programming basics. The app should not teach from absolute zero, but it should explain interview-level concepts clearly and precisely.

## 5. Current Content Scope

The project currently uses imported, attributed content instead of hand-written cards.

| Dataset | Source repo | Cards | Tasks |
| --- | --- | ---: | ---: |
| JavaScript interview | `sudheerj/javascript-interview-questions` | 477 | 28 |
| Data structures and algorithms | `sudheerj/datastructures-algorithms` | 156 | 156 |
| Total |  | 633 | 184 |

JavaScript cards are redistributed into the original frontend interview areas:

- Scope, Hoisting, TDZ, Closures.
- this, call, apply, bind.
- Prototype, Prototype Chain, Class.
- Event Loop, Promise, async/await.
- React, Rendering, Memoization.
- Browser, Networking, Storage.

DSA cards are stored as a separate dataset:

- Data Structures.
- Array, String, Binary, Stack, Linked List.
- Dynamic Programming.
- Tree, Graph, Matrix, Interval.
- Hash Table.
- Sorting.

The current base is good enough for the first real trainer implementation because it is large, source-backed, deduplicated, has professionally reviewed Russian questions, and includes practical implementation material for later modes.

It is not yet a final polished learning deck. Some imported answers and explanations are broad article-style text, and some DSA prompts are implementation catalog entries. The app should therefore support source attribution and future manual curation without changing card IDs unnecessarily.

## 5.1 Active Content Policy

The current app is a no-IDE trainer.

Active content must be limited to:

- Theoretical interview questions.
- Code-reading questions that can be answered mentally.
- Small mental tasks that do not require writing a full solution.

Temporarily hidden from the active UI:

- Implementation tasks with `type: "implement"`.
- DSA cards phrased as `How do you solve or implement ...`.
- Any task where the expected workflow is writing code in an editor.

Reason:

- The app does not yet include an IDE/editor/test runner.
- Showing implementation tasks as theory cards creates wrong expectations.
- These items should return later in a separate coding-practice mode.

Production distribution note:

- DSA material has an MIT license file in the source tree and can be used only with the required notice.
- JavaScript interview material has no explicit license in the cloned repository, so it should not be treated as safe for App Store/commercial distribution without explicit permission.

## 5.2 Knowledge Base Expansion

Long-term content expansion is documented in [Knowledge Base Roadmap](./knowledge-base-roadmap.md).

Principles:

- New topics and languages must use the same source-backed import and validation pipeline.
- The app should eventually support multiple domains: frontend, backend, computer science, data, DevOps, security.
- Shared concepts should be modeled separately from language-specific implementations where useful.
- Cards must stay atomic: one card should test one precise idea.
- Imported content must not become active until it passes quality gates.
- Coding tasks must remain separate from theory cards and require a task/IDE mode before activation.

Recommended expansion order:

1. Frontend depth: JavaScript, TypeScript, React, browser APIs, HTML/CSS, web performance.
2. Interview core: DSA, system design basics, SQL, Git, HTTP/networking.
3. Backend languages: Node.js, Python, Go, Java, C#.
4. Advanced engineering: databases, distributed systems, cloud, security, testing, observability.

## 6. Training Modes

Current main page:

- Single-page learning workspace.
- One compact top action row with topic buttons and `Random` on the left, theme/language controls on the right.
- Topic selection uses small buttons, not a select/dropdown.
- Clicking a topic starts a step-by-step session with all cards from that topic.
- `Random` starts a randomized step-by-step session from the current card set.
- Small stats tags only: total, new, known, repeat.
- Random pool of up to 20 cards.
- Desktop shows previous, active, and next cards in one centered slider row.
- Card navigation can move infinitely in both directions with bottom controls and horizontal swipe.
- The active card is visually primary.
- Mobile hides side cards and shows only the active card.
- On mobile, the card uses the free viewport height.
- Clicking a card flips it in place.
- Flipping a normal card does not reshuffle the slider and does not write progress.
- Each card keeps its own flip state.
- Front side shows the question.
- Back side shows the answer and explanation inside the scrollable card area.
- Cards include small `Знаю` and `Повторить` buttons that update local status.
- Cards marked `Знаю` / `Known` are excluded from normal card pools and topic/random sessions until the user resets progress.
- Cards marked `Повторить` / `Review` remain in normal training pools and should appear again.
- Card difficulty is kept in data but not shown in the card UI.
- The same card component is used on the main slider and inside session mode.

### All Cards In Order

The user starts a session containing every selected flashcard in deterministic content order.

Expected behavior:

- No random duplication.
- Cards are shown one by one.
- Session progress is visible.
- Restarting the mode starts from the first card again.

### All Cards Random

The user starts a session containing every selected flashcard in randomized order.

Expected behavior:

- Every card appears exactly once per session.
- Randomization happens when the session starts or when the user explicitly reshuffles.
- The current session does not duplicate cards.

### Topic Training

The user selects one topic and trains only that content.

Expected filters:

- Topic, for example `Async JavaScript` or `Dynamic Programming`.
- Subtopic, when available.
- Dataset, difficulty, status, search, and select/dropdown filters are not shown in the MVP top row.

### Practical Tasks

The user trains on code-oriented tasks.

Task modes:

- Predict output.
- Fix code.
- Implement behavior.
- Explain behavior.

Current MVP does not show implementation tasks until a coding-practice mode exists. Mental tasks can be shown later if they can be solved without writing code in an editor.

## 6.1 Next Backend Layer: Account And Feedback

After the trainer UI is stable, add a small backend-backed account layer.

Required features:

- `Сообщить об ошибке` / `Report issue` button on cards.
- Report form with reason and message.
- Maximum 2 active unresolved reports per user.
- Personal cabinet where a user can see their own reports.
- Admin report screen where admins can see all reports.
- Admin can mark reports as `open`, `in_review`, `resolved`, or `rejected`.
- Profile page with display name, bio, GitHub username/avatar, language/theme preferences.
- Profile stats for known/review/new cards and viewed count.
- Reset progress action.

Rules:

- Static card JSON remains canonical content.
- Reports and progress live outside card data.
- Report limits must be enforced by the backend.
- Admin report resolution does not directly mutate card JSON in the first version.

## 7. Flashcard Interaction

Each flashcard has two states.

Front side:

- Question.
- Dataset/topic/subtopic metadata.
- Progress in current session.

Back side:

- Direct answer.
- Explanation.
- Optional source/documentation link.
- Tags.

Controls:

- Previous card.
- Next card.
- Mark as known.
- Mark for review.

The card itself is the reveal control: clicking or tapping it flips between the question and answer sides.

## 8. UX Principles

- First screen is the training app, not a marketing landing page.
- The app must be usable immediately after opening.
- No decorative complexity that distracts from the card.
- The card must be readable on mobile and desktop.
- Code snippets must be formatted and horizontally safe on mobile.
- Buttons must have clear visual hierarchy.
- The card itself is the primary reveal interaction.
- Previous/next controls move through the current pool.
- The user should always know:
  - which topic is active;
  - current position in the 20-card pool;
  - whether the current card is flipped.

## 9. MVP Screens

### Trainer Screen

Main screen containing:

- Theme toggle.
- Language toggle.
- One-word topic buttons.
- Random start action.
- Card slider.
- Session progress.

This should be the default route.

### Tasks Screen

Not part of the active MVP UI.

Task and DSA content remains stored in JSON for the future coding-practice mode, but it should not appear in the current no-IDE trainer.

### Content Debug Screen

Optional internal screen for development:

- Total card count.
- Count by dataset/topic/subtopic.
- Duplicate ID check result.
- Duplicate question check result.
- Missing field report.

This is a development aid, not a user-facing product feature.

## 10. Data Persistence

MVP can run fully from static local data.

Required:

- Cards and tasks are stored in repository JSON files.
- Data is imported at build time or bundled statically.
- User progress is separate from imported content.

Optional local persistence:

- Last selected topic.
- Local known/review marks.
- Viewed count.

Use `localStorage` only for lightweight local state.

## 11. Future Spaced Repetition

The MVP should not implement full spaced repetition, but the data and UI should not block it.

Future card review fields:

- `lastReviewedAt`
- `nextReviewAt`
- `stability`
- `difficultyScore`
- `reviewCount`
- `lapses`
- `lastGrade`

Potential answer grades:

- `again`
- `hard`
- `good`
- `easy`

These should live outside the static card content as user progress data.

## 12. Acceptance Criteria

The MVP is acceptable when:

- The app opens as a single-page trainer.
- The main page shows a random pool of up to 20 active cards.
- The user can start a random session.
- The user can start a topic session.
- The user can flip a card in place and move infinitely forward/backward.
- The user can mark a card as `Known` or `Review`.
- Cards marked `Known` disappear from normal pools until progress reset.
- Static content loads the current 477 active JavaScript cards.
- Static content keeps the 156 DSA cards and 184 imported tasks hidden for later modes.
- No card IDs are duplicated.
- No questions are duplicated within the same imported dataset.
- No task prompts are duplicated within the same imported dataset.
- Every card has answer and explanation fields.
- Every card question has a Russian translation.
- Russian answers and explanations remain tracked for separate curation.
- Imported source metadata remains available for every card/task.
- The app works on desktop and mobile.

## 13. Content Quality Policy

Do not add manually generated cards unless explicitly reviewed.

Current source of truth:

- Imported JSON data.
- Import scripts in `tools/`.
- Import reports in `docs/card-material/`.

Quality rules:

- Prefer source-backed material.
- Keep duplicate checks in import/validation scripts.
- Preserve source repo, source path, and documentation path metadata.
- Improve weak imported prompts later with curated overlays, not by losing original source references.
