# Interview Trainer

Minimal flashcard trainer for interview preparation.

## Local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Vercel

Use the default Vite settings:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

The current error-report JSON flow is intentionally lightweight for local/project use. A real shared production moderation queue should be moved to persistent storage before public release.
