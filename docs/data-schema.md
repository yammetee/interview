# Data Schema

## 1. Overview

The MVP stores cards and tasks as static JSON in the repository.

Current generated data:

- JavaScript interview data: `data/cards/*.json`.
- DSA data: `data/dsa/*.json`.
- Imported exercise/source files: `data/coding-exercise/**`.
- Import reports: `docs/card-material/*.md`.

Current directory shape:

```txt
data/
  cards/
    index.json
    async-js.json
    browser.json
    js-core-1.json
    js-core-2.json
    prototypes.json
    react.json
  dsa/
    index.json
    dsa-array.json
    dsa-binary.json
    ...
  coding-exercise/
    sudheerj/
    sudheerj-dsa/
```

## 2. Topic IDs

Topic IDs must be stable because future progress data will reference them.

```ts
export type JsTopicId =
  | "js-core-1"
  | "js-core-2"
  | "prototypes"
  | "async-js"
  | "react"
  | "browser";

export type DsaTopicId =
  | "dsa-data-structures"
  | "dsa-array"
  | "dsa-string"
  | "dsa-dynamic-programming"
  | "dsa-binary"
  | "dsa-stack"
  | "dsa-linked-list"
  | "dsa-tree"
  | "dsa-graph"
  | "dsa-matrix"
  | "dsa-interval"
  | "dsa-hash-table"
  | "dsa-sorting"
  | "dsa-misc";

export type TopicId = JsTopicId | DsaTopicId;
```

## 3. Dataset File Shape

```ts
export type LocalizedText = {
  en: string;
  ru?: string;
};

export type ContentBlock =
  | {
      type: "text";
      text: LocalizedText;
    }
  | {
      type: "code";
      language?: "js" | "ts" | "jsx" | "tsx" | "html" | "css" | "json" | "text";
      code: LocalizedText;
    }
  | {
      type: "table";
      headers: LocalizedText[];
      rows: LocalizedText[][];
    }
  | {
      type: "list";
      items: LocalizedText[];
    };

export type ContentCuration = {
  needsCodeExample?: boolean;
  needsExplanation?: boolean;
  needsTypedContent?: boolean;
  needsTranslationReview?: boolean;
  needsAnswerReview?: boolean;
  reviewReasons?: string[];
};

export type TopicDeck = {
  topic: {
    id: TopicId;
    title: LocalizedText;
  };
  cards: Flashcard[];
  tasks: PracticalTask[];
};
```

## 4. Flashcard Schema

```ts
export type Difficulty = "easy" | "medium" | "hard";

export type SourceMeta = {
  repo: string;
  path?: string;
  number?: number;
  sourcePath?: string | null;
  documentationPath?: string | null;
  sourceUrl?: string | null;
  documentationUrl?: string | null;
};

export type Flashcard = {
  id: string;
  source: SourceMeta;
  topicId: TopicId;
  subtopic: string;
  difficulty: Difficulty;
  question: LocalizedText;
  answer: LocalizedText;
  explanation: LocalizedText;
  questionContent?: ContentBlock[];
  answerContent?: ContentBlock[];
  explanationContent?: ContentBlock[];
  curation?: ContentCuration;
  tags: string[];
};
```

Field rules:

- `id` must be globally unique and stable.
- `source` must preserve the original repo and local paths when available.
- `topicId` must match known topic metadata.
- `question.en`, `answer.en`, and `explanation.en` are required.
- `question.ru` is required for active cards and imported DSA cards.
- `answer.ru` is required when the card can be shown in RU mode.
- `explanation.ru` is preferred, but may be temporarily empty when a duplicate explanation was removed and a better explanation still needs curation.
- `questionContent`, `answerContent`, and `explanationContent` are optional typed replacements for rich content.
- If typed content exists, the UI renders only the explicit block types. The UI must not guess that a normal string is code, a table, or a list.
- A code example is stored as a `ContentBlock` with `type: "code"` inside the relevant typed content field; do not keep useful examples only as raw fenced markdown.
- `curation` is metadata for cleanup work. It must not change user-facing content by itself.
- `tags` should stay lowercase and useful for filtering/search.

Typed content rules:

- Use `text` for normal prose only.
- Use `code` only for real code examples. Keep API names inside normal prose as text unless a whole block is code.
- Use `table` only when the comparison is genuinely clearer as a table.
- Use `list` only when the answer is naturally a short set of points.
- Do not store raw markdown tables in `answer` or `explanation`.
- Do not duplicate the same content in `answerContent` and `explanationContent`; the answer should be short, the explanation should add mechanics or nuance.

Curation rules:

- Treat `question.en` and `answer.en` as source text. Do not rewrite them mechanically.
- Use `curation.needsCodeExample` when a card would benefit from a code example and has no typed `code` block yet.
- Use `curation.needsExplanation` when explanation is empty or mostly repeats the answer.
- Use `curation.needsTypedContent` when markdown/table/code/list content is still stored inside plain strings.
- Use `curation.needsTranslationReview` when RU answers or explanations are untranslated, overly literal, or terminology is wrong. Do not assume this flag means `question.ru` is still broken.
- Use `curation.needsAnswerReview` when the answer is too long for a flashcard and should be manually shortened.

## 5. Practical Task Schema

```ts
export type TaskType =
  | "predict-output"
  | "fix-code"
  | "implement"
  | "explain";

export type PracticalTask = {
  id: string;
  source: SourceMeta;
  topicId: TopicId;
  subtopic: string;
  type: TaskType;
  difficulty: Difficulty;
  title: LocalizedText;
  prompt: LocalizedText;
  code?: string;
  expectedAnswer: LocalizedText;
  explanation: LocalizedText;
  titleContent?: ContentBlock[];
  promptContent?: ContentBlock[];
  expectedAnswerContent?: ContentBlock[];
  explanationContent?: ContentBlock[];
  curation?: ContentCuration;
  tags: string[];
};
```

## 6. Index File Shape

```ts
export type DatasetIndex = {
  source: {
    repo: string;
    localPath: string;
    license?: string;
  };
  topics: Array<{
    id: TopicId;
    title: LocalizedText;
  }>;
  counts: {
    cards: number;
    tasks: number;
    skippedDuplicateQuestions?: number;
    skippedDuplicateItems?: number;
  };
  files: string[];
};
```

## 7. User Progress Schema For Later

Static content must not contain user progress.

Future local or backend progress can use:

```ts
export type ReviewGrade = "again" | "hard" | "good" | "easy";

export type CardProgress = {
  cardId: string;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  reviewCount: number;
  lapses: number;
  lastGrade: ReviewGrade | null;
  stability?: number;
  difficultyScore?: number;
};
```

## 8. Account And Feedback Schema For Later

Backend-backed account data must stay separate from static card content.

```ts
export type UserRole = "user" | "admin";

export type UserProfile = {
  id: string;
  role: UserRole;
  email?: string;
  displayName: string;
  bio?: string;
  githubUsername?: string;
  githubAvatarUrl?: string;
  preferredLanguage: "ru" | "en";
  preferredTheme: "dark" | "light";
  createdAt: string;
  updatedAt: string;
};

export type UserCardStatus = "new" | "known" | "review";

export type UserCardProgress = {
  userId: string;
  cardId: string;
  status: UserCardStatus;
  viewed: number;
  lastReviewed?: string;
  updatedAt: string;
};

export type ReportReason =
  | "wrong_answer"
  | "bad_translation"
  | "unclear_question"
  | "duplicate"
  | "formatting"
  | "other";

export type ReportStatus = "open" | "in_review" | "resolved" | "rejected";

export type CardReport = {
  id: string;
  userId: string;
  cardId: string;
  dataset: "javascript" | "dsa";
  topicId: TopicId;
  reason: ReportReason;
  message: string;
  status: ReportStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
};
```

Rules:

- Cards with `status: "known"` are excluded from normal training pools until progress reset.
- Cards with `status: "review"` stay eligible for normal training.
- A user can have at most 2 active reports.
- Active reports are `open` or `in_review`.
- The report limit must be enforced by the backend.
- Users can read their own reports.
- Admins can read all reports and update report status.
- Reset progress deletes `UserCardProgress` rows only.
- Static `Flashcard` and `PracticalTask` objects must not contain profile, report, or user progress fields.

## 9. Validation Rules

Build or test scripts should validate:

- Every card has a unique `id`.
- Every task has a unique `id`.
- No duplicated `question` values within the same dataset.
- No duplicated task `prompt + code` pairs.
- Every `topicId` exists in topic metadata.
- Every required field is non-empty.
- Every imported card preserves source metadata.
- Every JSON file parses successfully.
- Every `question.ru` exists for cards.
- No obvious machine-translated technical terms appear in `question.ru`.
