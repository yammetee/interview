# Account And Feedback Spec

## 1. Purpose

This document describes the first backend-backed product layer after the local MVP:

- User profile.
- User progress sync.
- Error reports from cards.
- Personal request history.
- Admin request moderation.

The current trainer can stay usable without an account. Account features should be additive and must not break local training.

## 2. User Roles

### Guest

- Can train with cards.
- Can keep local progress in `localStorage`.
- Cannot submit persistent error reports.
- Can be prompted to sign in when opening report form.

### User

- Can train with synced progress.
- Can submit error reports.
- Can see their own reports in profile.
- Can edit personal profile fields.
- Can connect GitHub avatar.
- Can reset personal progress.

### Admin

- Can see all reports from all users.
- Can mark reports as resolved or unresolved.
- Can filter reports by status, card, topic, user, and date.
- Cannot edit canonical card data from this first admin screen.

## 3. Error Report Flow

### Entry Point

Add a small action on the card:

- RU: `Сообщить об ошибке`
- EN: `Report issue`

Current MVP behavior:

- No localStorage for error reports.
- The button writes to `data/error-reports.json` through the Vite dev API.
- The first version does not open a form.
- The payload is just the card ID.
- If an unresolved report already exists for the card, the API does nothing.
- If a resolved report exists for the card, the API marks it unresolved again.
- Cards with unresolved reports stay visible, but show a moderation warning.

Minimum shared database object:

```ts
type CardErrorReport = {
  cardId: string;
  resolved: boolean;
};
```

Temporary project JSON storage:

```txt
data/error-reports.json
```

API contract implemented in `vite.config.ts`:

```txt
GET  /api/error-reports
POST /api/error-reports
```

`GET /api/error-reports` returns either:

```ts
CardErrorReport[]
```

or:

```ts
{ reports: CardErrorReport[] }
```

`POST /api/error-reports` accepts:

```ts
{ cardId: string }
```

API logic:

```ts
const existing = reports.find((report) => report.cardId === cardId);

if (!existing) {
  reports.push({ cardId, resolved: false });
} else if (existing.resolved) {
  existing.resolved = false;
}
```

Placement:

- Back side of card, near answer/explanation metadata or top actions.
- The button must be visually secondary.
- It must not compete with `Знаю` / `Повторить`.

### Report Form

Later account-backed version only.

Fields:

- `reason`: required enum.
- `message`: required free text.
- Optional screenshot later, not in first version.

Reason values:

```ts
type ReportReason =
  | "wrong_answer"
  | "bad_translation"
  | "unclear_question"
  | "duplicate"
  | "formatting"
  | "other";
```

Recommended UI labels:

| Reason | RU | EN |
| --- | --- | --- |
| `wrong_answer` | Неверный ответ | Wrong answer |
| `bad_translation` | Плохой перевод | Bad translation |
| `unclear_question` | Непонятный вопрос | Unclear question |
| `duplicate` | Дубликат | Duplicate |
| `formatting` | Проблема форматирования | Formatting issue |
| `other` | Другое | Other |

### Active Report Limit

Each user can have at most 2 active unresolved reports.

Active means:

```ts
status === "open" || status === "in_review"
```

When the user already has 2 active reports:

- Disable submit.
- Show a short message:
  - RU: `У тебя уже есть 2 активных обращения. Дождись обработки одного из них.`
  - EN: `You already have 2 active reports. Wait until one is processed.`

The limit must be enforced on the backend, not only in the UI.

## 4. Report Statuses

```ts
type ReportStatus = "open" | "in_review" | "resolved" | "rejected";
```

Meaning:

| Status | Meaning |
| --- | --- |
| `open` | User submitted the report. Admin has not reviewed it yet. |
| `in_review` | Admin acknowledged it and is checking it. |
| `resolved` | Report was accepted and fixed or queued for fix. |
| `rejected` | Report was checked and no change is needed. |

User-facing simplified labels:

- `open` and `in_review`: unresolved.
- `resolved`: resolved.
- `rejected`: rejected.

## 5. User Profile

Profile should include:

- Display name.
- Bio/about text.
- GitHub username.
- GitHub avatar URL.
- Preferred language.
- Preferred theme.
- Created date.

The GitHub avatar can be resolved from username:

```txt
https://github.com/{username}.png
```

Do not require OAuth for the first version if we only need avatar display. OAuth can come later when real identity/provider login is chosen.

## 6. Progress In Profile

Profile should show compact learning results:

- Total cards.
- New.
- Known.
- Review.
- Viewed count.
- Last reviewed date.
- Current streak later, optional.

Do not add a large dashboard to the trainer page. Profile can contain more detailed stats.

## 7. Reset Progress

Profile must include a reset action:

- RU: `Сбросить прогресс`
- EN: `Reset progress`

Behavior:

- Requires confirmation.
- Deletes or archives only the current user's progress.
- Makes cards previously marked `Known` eligible for training again.
- Does not delete reports.
- Does not delete profile.
- Does not mutate static card data.

Confirmation text:

- RU: `Прогресс по карточкам будет сброшен. Обращения и профиль останутся.`
- EN: `Card progress will be reset. Reports and profile will stay.`

Training visibility rule:

- `Known` cards are hidden from normal training until progress reset.
- `Review` cards stay visible in normal training.
- Reset progress returns every card to `New`.

## 8. Personal Cabinet Screens

### Profile

Content:

- Avatar.
- Display name.
- Bio/about.
- GitHub username.
- Language/theme preferences.
- Progress stats.
- Reset progress action.

### My Reports

Content:

- List of user's reports.
- Status.
- Card question title.
- Topic.
- Created date.
- Admin response or resolution note, when available.

Filters:

- All.
- Active.
- Resolved.
- Rejected.

## 9. Admin Screens

### Reports Admin

Content:

- All reports.
- User info.
- Card ID and question.
- Topic.
- Reason.
- Message.
- Status.
- Created date.
- Updated date.

Actions:

- Mark as `in_review`.
- Mark as `resolved`.
- Mark as `rejected`.
- Add admin note.

Admin must not edit card JSON directly from this screen in the first version. A resolved report can later become a separate content-curation task.

## 10. Backend Data Model

Recommended tables/collections:

```ts
type UserRole = "user" | "admin";

type UserProfile = {
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

type UserCardProgress = {
  userId: string;
  cardId: string;
  status: "new" | "known" | "review";
  viewed: number;
  lastReviewed?: string;
  updatedAt: string;
};

type CardReport = {
  id: string;
  userId: string;
  cardId: string;
  dataset: "javascript" | "dsa";
  topicId: string;
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

Required backend constraints:

- `CardReport.userId` must reference an existing user.
- `CardReport.cardId` must reference a known static card ID.
- A user can have no more than 2 reports where status is `open` or `in_review`.
- Only admins can change report status to `in_review`, `resolved`, or `rejected`.
- Only the report owner and admins can read a specific report.

## 11. API Draft

```txt
GET    /api/me
PATCH  /api/me

GET    /api/me/progress
PATCH  /api/me/progress/:cardId
DELETE /api/me/progress

GET    /api/me/reports
POST   /api/reports

GET    /api/admin/reports
PATCH  /api/admin/reports/:reportId
```

Report creation behavior:

1. Authenticate user.
2. Validate `cardId` against static content index.
3. Count active reports for user.
4. Reject if active count is already 2.
5. Create report with `status: "open"`.

## 12. Implementation Order

Recommended order:

1. Add UI-only report button and form state.
2. Add local mock storage for reports to test UX.
3. Add profile screen shell.
4. Add backend/auth choice.
5. Move progress from `localStorage` to backend for signed-in users.
6. Persist reports in backend.
7. Add admin reports screen.
8. Add GitHub avatar field.
9. Add reset progress.

Do not start with admin tooling before the user report flow works.
