# Design Code

This document is strict.

## Themes

The app supports dark and light themes using CSS variables. Do not hardcode colors in components.

### Dark Theme

```css
--background: #0d1117;
--surface: #161b22;
--border: #2a3441;
--text: #f8fafc;
--muted: #94a3b8;
--accent: #38bdf8;
```

### Light Theme

```css
--background: #fafafa;
--surface: #ffffff;
--border: #e4e4e7;
--text: #18181b;
--muted: #71717a;
--accent: #0284c7;
```

## Rules

- Use only these six theme variables for app colors.
- Default theme is dark.
- Keep the page minimal: one top action row, stats line, and card slider.
- Do not show a product title or separate header.
- Top actions keep topic buttons and `Random` on the left.
- Theme toggle and language toggle sit at the far right.
- Do not show top navigation tabs.
- Do not use a select/dropdown for topics in the MVP.
- Topic buttons must be short enough to wrap cleanly on mobile.
- Stats are shown as small neutral tags, not as a separated text line.
- Desktop shows three cards from a random pool: previous, active, next.
- On desktop, the active center card is roughly 1.5x larger than side cards.
- Card navigation is infinite in both directions through bottom controls and horizontal swipe.
- The active card carries the visual accent.
- Card accent is a thin border only; do not use glow or drop-shadow.
- On mobile, side cards are hidden and only the active card is shown.
- On mobile, the card uses the free viewport height.
- Cards are real two-sided cards.
- Do not show card difficulty in the card UI.
- Cards include small `Знаю` and `Повторить` status buttons.
- Click a card to flip it in place.
- Flipping a normal card must not reshuffle the slider or write progress.
- Each card keeps its own flip state.
- Front side shows the question.
- Back side shows the answer and explanation inside the card scroll area.
- Plain text renders as normal card text.
- Code, code-like snippets, and markdown tables render in IDE-style code blocks.
- Do not open a modal/drawer from a normal card.
- Topic buttons start a step-by-step session with all cards from that topic.
- Session mode uses the same card component as the main slider.
- Implementation/code-writing tasks stay hidden until a real coding mode exists.
