# Knowledge Base Roadmap

## 1. Vision

Interview Trainer should grow from a JavaScript interview trainer into a large structured knowledge base for programming, built around flashcards, mental code-reading tasks, and later coding exercises.

Core belief:

- Cards are not just exam prep.
- Cards are a way to keep knowledge alive.
- A good card closes one precise gap in understanding.
- A large curated card base can become a practical map of software engineering knowledge.

Long-term goal:

- Build one of the largest high-quality programming learning bases in card format.
- Support multiple programming languages and technical domains.
- Keep every card source-backed, deduplicated, typed, translated, and reviewable.

## 2. Expansion Principles

### Quality First

The product should not become a dump of imported questions.

Every card must have:

- Stable ID.
- Clear topic.
- Clear question.
- Short direct answer.
- Explanation that adds value and does not simply repeat the answer.
- Explicit typed content for code, tables, and lists.
- Source attribution where imported.
- Curation metadata if quality is not final.

### Atomic Cards

One card should test one idea.

Bad:

- `Explain React performance optimization.`

Good:

- `When does React.memo skip rendering?`
- `Why can useCallback still be useless if props change every render?`

### Multi-Language, Shared Concepts

Many concepts repeat across languages:

- Scope.
- Closures.
- Memory.
- Async.
- Types.
- Collections.
- Error handling.
- OOP.
- Concurrency.

The knowledge base should separate:

- Concept: language-independent idea.
- Implementation: how a language expresses that idea.
- Interview card: concrete question-answer pair.

## 3. Content Layers

### Layer 1: Flashcards

Fast recall.

Examples:

- Definitions.
- Differences.
- Gotchas.
- Mental execution.
- API behavior.

### Layer 2: Mental Tasks

No IDE required.

Examples:

- Predict output.
- Find bug.
- Explain behavior.
- Choose correct option.

### Layer 3: Coding Tasks

Requires editor/test runner later.

Examples:

- Implement debounce.
- Solve valid parentheses.
- Write binary search.

Coding tasks should remain hidden from the no-IDE trainer until a task mode exists.

### Layer 4: Learning Paths

Ordered groups of cards/tasks.

Examples:

- JavaScript Core.
- React Interview.
- TypeScript For Frontend.
- Python Backend.
- Go Concurrency.
- SQL Interviews.

## 4. Future Dataset Taxonomy

Use a stable hierarchy:

```txt
domain
  language/runtime/framework
    topic
      subtopic
        card/task
```

Examples:

```txt
frontend
  javascript
    scope
    async
    prototypes
  typescript
    types
    generics
    narrowing
  react
    rendering
    hooks
    memoization

backend
  node
    streams
    event-loop
  python
    data-model
    async
  go
    goroutines
    channels

data
  sql
    joins
    indexes
    transactions
  redis
    data-types
    caching

computer-science
  algorithms
  data-structures
  complexity
```

## 5. Recommended Language Expansion Order

### Phase 1: Frontend Depth

Reason: current user and current product are frontend-focused.

- JavaScript.
- TypeScript.
- React.
- Browser APIs.
- HTML/CSS mental questions.
- Web performance.
- Frontend architecture.

### Phase 2: Interview Core

- Data structures.
- Algorithms.
- System design basics.
- SQL.
- Git.
- HTTP/networking.

### Phase 3: Backend Languages

- Node.js.
- Python.
- Go.
- Java.
- C#.

### Phase 4: Advanced Engineering

- Databases.
- Distributed systems.
- Cloud.
- Security.
- Testing.
- Observability.
- DevOps.

## 6. Schema Direction

The current schema should evolve from hardcoded `JsTopicId | DsaTopicId` into generic dataset IDs.

Future direction:

```ts
type DomainId =
  | "frontend"
  | "backend"
  | "computer-science"
  | "data"
  | "devops"
  | "security";

type TechnologyId =
  | "javascript"
  | "typescript"
  | "react"
  | "node"
  | "python"
  | "go"
  | "java"
  | "sql";

type ContentKind = "flashcard" | "mental-task" | "coding-task";

type KnowledgeTopic = {
  id: string;
  domainId: DomainId;
  technologyId?: TechnologyId;
  title: LocalizedText;
  parentTopicId?: string;
};
```

Cards should eventually include:

```ts
type KnowledgeItem = {
  id: string;
  kind: ContentKind;
  domainId: DomainId;
  technologyId?: TechnologyId;
  topicId: string;
  subtopic?: string;
  question: LocalizedText;
  answer: LocalizedText;
  explanation: LocalizedText;
  questionContent?: ContentBlock[];
  answerContent?: ContentBlock[];
  explanationContent?: ContentBlock[];
  source: SourceMeta;
  quality: QualityMeta;
  tags: string[];
};
```

Quality metadata:

```ts
type QualityMeta = {
  status: "imported" | "needs_review" | "curated" | "verified";
  reviewedBy?: string;
  reviewedAt?: string;
  issues?: string[];
};
```

## 7. Import Pipeline

Every new source should go through the same pipeline:

1. Import raw source.
2. Preserve original files and source metadata.
3. Parse into normalized JSON.
4. Generate stable IDs.
5. Deduplicate by normalized question/prompt.
6. Detect task type.
7. Detect content type:
   - text
   - code
   - table
   - list
8. Mark curation flags.
9. Validate JSON.
10. Produce import report.
11. Add to UI only if content fits the active product mode.

## 8. Quality Gates

Before a dataset becomes active in the trainer:

- No duplicate IDs.
- No duplicate active questions.
- No empty required English fields.
- No implementation tasks in theory mode.
- Code examples stored as `type: "code"`.
- Tables stored as `type: "table"`.
- Explanation is not a full duplicate of answer.
- License status is documented.
- Source attribution is preserved.

Before a dataset becomes public:

- License is safe.
- Translations are reviewed.
- Suspicious literal translations are fixed.
- Admin/report flow exists for corrections.

## 9. User Contribution Model

Long term, users can help grow the base.

Possible contribution types:

- Report wrong answer.
- Suggest better explanation.
- Suggest missing code example.
- Suggest duplicate merge.
- Submit new card.
- Submit translation fix.

Do not allow direct public edits to canonical cards at first.

Recommended flow:

1. User submits suggestion/report.
2. Admin reviews.
3. Accepted changes become curation tasks.
4. Curated content is merged into canonical dataset.

## 10. Product Surfaces For Large Base

When the base grows, simple topic buttons will not be enough.

Future navigation:

- Home trainer: daily mixed cards.
- Library: browse domains/languages/topics.
- Search: find cards/tasks.
- Review: only `review` cards.
- Known archive: cards hidden from normal training.
- Learning paths: structured sequences.
- Admin/content queue: curation work.

Keep the trainer screen minimal. Put discovery and management into separate surfaces.

## 11. Metrics That Matter

Track content health:

- Total active cards.
- Total hidden tasks.
- Curated percentage.
- Duplicate count.
- Reports per 100 cards.
- Cards with code examples.
- Cards with reviewed translations.
- Average answer length.
- Explanation duplicate rate.

Track user learning:

- Known cards.
- Review cards.
- New remaining.
- Daily reviewed cards.
- Weak topics.
- Reset count.

## 12. Near-Term Plan

Short-term, do not add 10 languages immediately.

Recommended next steps:

1. Finish current JavaScript UX.
2. Clean current JS data quality.
3. Add report/profile backend layer.
4. Add generic dataset/topic schema.
5. Add TypeScript as the first new language-style dataset.
6. Add SQL or Node.js next.
7. Add coding-task mode before exposing algorithm implementation tasks.

This keeps the product useful while the knowledge base grows.
