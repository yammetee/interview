import { ChevronLeft, ChevronRight, Moon, Sun, X } from "lucide-react";
import type { ReactNode, TouchEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cards, Language, localText, StudyItem, topics } from "./data";
import type { ContentBlock } from "./data";

type Theme = "dark" | "light";
type Status = "new" | "known" | "review";
type ProgressMap = Record<string, { status: Status }>;
type ErrorReport = { cardId: string; resolved: boolean };
type StudySession = { items: StudyItem[]; index: number; title: string } | null;
type FlippedMap = Record<string, boolean>;

const DECK_SIZE = 20;

const uiText = {
  ru: {
    all: "Все",
    answer: "Ответ",
    cards: "Карточки",
    close: "Закрыть",
    empty: "Нет карточек для текущего фильтра.",
    reportIssue: "Ошибка",
    reportModeration: "Возможна ошибка · модерация",
    question: "Вопрос",
    known: "Знаю",
    language: "Язык",
    new: "Новые",
    nextCards: "Следующие карточки",
    nextSessionCard: "Следующая карточка теста",
    previousCards: "Предыдущие карточки",
    previousSessionCard: "Предыдущая карточка теста",
    random: "Рандом",
    review: "Повторить",
    stats: "Статистика",
    swipe: "Свайп",
    theme: "Тема",
    total: "Всего",
  },
  en: {
    all: "All",
    answer: "Answer",
    cards: "Cards",
    close: "Close",
    empty: "No cards match current filters.",
    reportIssue: "Report",
    reportModeration: "Possible issue · moderation",
    question: "Question",
    known: "Known",
    language: "Language",
    new: "New",
    nextCards: "Next cards",
    nextSessionCard: "Next session card",
    previousCards: "Previous cards",
    previousSessionCard: "Previous session card",
    random: "Random",
    review: "Review",
    stats: "Stats",
    swipe: "Swipe",
    theme: "Theme",
    total: "Total",
  },
} satisfies Record<Language, Record<string, string>>;

const statusLabels: Record<Language, Record<Status | "all", string>> = {
  ru: {
    all: uiText.ru.all,
    new: uiText.ru.new,
    known: uiText.ru.known,
    review: uiText.ru.review,
  },
  en: {
    all: uiText.en.all,
    new: uiText.en.new,
    known: uiText.en.known,
    review: uiText.en.review,
  },
};

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function wrapIndex(index: number, length: number) {
  if (!length) return 0;
  return ((index % length) + length) % length;
}

function buildDeck(source: StudyItem[], previousIds = new Set<string>()) {
  if (!source.length) return [];
  const fresh = source.filter((item) => !previousIds.has(item.id));
  const repeated = source.filter((item) => previousIds.has(item.id));
  const pool = fresh.length >= DECK_SIZE ? fresh : [...fresh, ...repeated];
  return shuffle(pool).slice(0, Math.min(DECK_SIZE, source.length));
}

function refillDeck(current: StudyItem[], source: StudyItem[]) {
  if (!source.length) return [];
  const sourceIds = new Set(source.map((item) => item.id));
  const retained = current.filter((item) => sourceIds.has(item.id));
  const limit = Math.min(DECK_SIZE, source.length);

  if (retained.length >= limit) return retained.slice(0, limit);

  const retainedIds = new Set(retained.map((item) => item.id));
  const candidates = source.filter((item) => !retainedIds.has(item.id));
  return [...retained, ...shuffle(candidates).slice(0, limit - retained.length)];
}

function itemTitle(item: StudyItem, language: Language) {
  return item.kind === "card" ? localText(item.question, language) : localText(item.title, language);
}

function itemAnswer(item: StudyItem, language: Language) {
  return item.kind === "card" ? localText(item.answer, language) : localText(item.expectedAnswer, language);
}

function itemTitleContent(item: StudyItem) {
  return item.kind === "card" ? item.questionContent : item.titleContent;
}

function itemAnswerContent(item: StudyItem) {
  return item.kind === "card" ? item.answerContent : item.expectedAnswerContent;
}

function itemAnswerTextContent(item: StudyItem) {
  return itemAnswerContent(item)?.filter((block) => block.type !== "code");
}

function itemCodeContent(item: StudyItem) {
  const blocks = [...(itemAnswerContent(item) ?? []), ...(item.explanationContent ?? [])].filter((block): block is Extract<ContentBlock, { type: "code" }> => block.type === "code");
  const seen = new Set<string>();
  return blocks.filter((block) => {
    const key = `${block.language ?? "code"}:${block.code.en}:${block.code.ru ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function readProgress(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem("interview-trainer-progress-v2") || "{}") as ProgressMap;
  } catch {
    return {};
  }
}

function getStatus(item: StudyItem, progress: ProgressMap): Status {
  return progress[item.id]?.status ?? "new";
}

function t(language: Language, key: keyof (typeof uiText)["en"]) {
  return uiText[language][key];
}

function topicButtonLabel(topicId: string, title: string, language: Language) {
  const labels: Record<Language, Record<string, string>> = {
    ru: {
      "async-js": "Async",
      browser: "Browser",
      "js-core-1": "Scope",
      "js-core-2": "this",
      prototypes: "Prototype",
      react: "React",
    },
    en: {
      "async-js": "Async",
      browser: "Browser",
      "js-core-1": "Scope",
      "js-core-2": "this",
      prototypes: "Prototype",
      react: "React",
    },
  };
  return labels[language][topicId] ?? title.split(/[\s,]+/)[0];
}

function topicCardLabel(topicId: string, fallback: string, language: Language) {
  const labels: Record<Language, Record<string, string>> = {
    ru: {
      "async-js": "Event Loop, Promise, async/await",
      browser: "Browser, Networking, Storage",
      "js-core-1": "Scope, Hoisting, TDZ, Closures",
      "js-core-2": "this, call, apply, bind",
      prototypes: "Prototype, Chain, Class",
      react: "React, Rendering, Memoization",
    },
    en: {
      "async-js": "Event Loop, Promise, async/await",
      browser: "Browser, Networking, Storage",
      "js-core-1": "Scope, Hoisting, TDZ, Closures",
      "js-core-2": "this, call, apply, bind",
      prototypes: "Prototype, Chain, Class",
      react: "React, Rendering, Memoization",
    },
  };
  return labels[language][topicId] ?? fallback;
}

function blockText(value: { en: string; ru?: string }, language: Language) {
  return localText(value, language);
}

function normalizeErrorReports(value: unknown): ErrorReport[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is ErrorReport => Boolean(item) && typeof item.cardId === "string" && typeof item.resolved === "boolean");
  }
  if (value && typeof value === "object" && "reports" in value) {
    return normalizeErrorReports((value as { reports: unknown }).reports);
  }
  if (value && typeof value === "object" && "report" in value) {
    return normalizeErrorReports((value as { report: unknown }).report);
  }
  if (value && typeof value === "object" && "cardId" in value && "resolved" in value) {
    return normalizeErrorReports([value]);
  }
  return [];
}

async function fetchErrorReports() {
  const response = await fetch("/api/error-reports");
  if (!response.ok) throw new Error("Unable to load error reports");
  return normalizeErrorReports(await response.json());
}

async function createErrorReport(cardId: string) {
  const response = await fetch("/api/error-reports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cardId }),
  });
  if (!response.ok) throw new Error("Unable to create error report");
  if (response.status === 204) return [{ cardId, resolved: false }];
  return normalizeErrorReports(await response.json());
}

function splitNumberedList(text: string) {
  const matches = [...text.matchAll(/(?:^|\s)(\d+)\.\s+(?=\S)/g)];
  if (matches.length < 2) return null;

  const intro = text.slice(0, matches[0].index).trim();
  const items = matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    return text
      .slice(start, end)
      .replace(/\n{2,}/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .trim();
  });

  if (items.some((item) => item.length < 8)) return null;
  return { intro, items };
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);
}

function isMarkdownTableSeparator(line: string) {
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitMarkdownTable(text: string) {
  const lines = text.split(/\r?\n/);
  const tableStart = lines.findIndex((line, index) => line.includes("|") && lines[index + 1]?.includes("|") && isMarkdownTableSeparator(lines[index + 1]));
  if (tableStart < 0) return null;

  const headers = splitTableRow(lines[tableStart]);
  if (headers.length < 2) return null;

  const rows: string[][] = [];
  let cursor = tableStart + 2;
  while (cursor < lines.length && lines[cursor].includes("|")) {
    const row = splitTableRow(lines[cursor]);
    if (row.length >= 2) rows.push(row);
    cursor += 1;
  }

  if (!rows.length) return null;

  return {
    intro: lines.slice(0, tableStart).join("\n").trim(),
    headers,
    rows,
    outro: lines.slice(cursor).join("\n").trim(),
  };
}

function MarkdownTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <span className="typed-table-wrap">
      <table className="typed-table">
        <thead>
          <tr>
            {headers.map((cell, cellIndex) => (
              <th key={cellIndex}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((_, cellIndex) => (
                <td key={cellIndex}>{row[cellIndex] ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </span>
  );
}

function PlainText({ text, compact = false }: { text: string; compact?: boolean }) {
  if (!text) return null;
  const markdownTable = compact ? null : splitMarkdownTable(text);
  if (markdownTable) {
    return (
      <span className="plain-text">
        {markdownTable.intro ? <PlainText text={markdownTable.intro} /> : null}
        <MarkdownTable headers={markdownTable.headers} rows={markdownTable.rows} />
        {markdownTable.outro ? <PlainText text={markdownTable.outro} /> : null}
      </span>
    );
  }

  const numberedList = compact ? null : splitNumberedList(text);
  if (numberedList) {
    return (
      <span className="plain-text">
        {numberedList.intro ? <span className="typed-paragraph">{numberedList.intro}</span> : null}
        <ol className="typed-list is-numbered">
          {numberedList.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      </span>
    );
  }
  return <span className={compact ? "plain-text is-compact" : "plain-text"}>{text}</span>;
}

const codeTokenPattern =
  /\/\/.*|\/\*[\s\S]*?\*\/|(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1|\b(?:async|await|break|case|catch|class|const|continue|default|else|export|extends|false|finally|for|from|function|if|import|in|instanceof|let|new|null|of|return|switch|this|throw|true|try|typeof|undefined|var|while)\b|\b\d+(?:\.\d+)?\b|=>|[{}()[\].,;:]|[+\-*%=&|!<>?]+/g;

function codeTokenClass(token: string) {
  if (token.startsWith("//") || token.startsWith("/*")) return "syntax-comment";
  if (/^["'`]/.test(token)) return "syntax-string";
  if (/^\d/.test(token)) return "syntax-number";
  if (/^(?:async|await|break|case|catch|class|const|continue|default|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|switch|this|throw|try|typeof|var|while)$/.test(token)) {
    return "syntax-keyword";
  }
  if (/^(?:true|false|null|undefined)$/.test(token)) return "syntax-constant";
  if (/^[{}()[\].,;:]$/.test(token)) return "syntax-punctuation";
  return "syntax-operator";
}

function HighlightedCode({ code }: { code: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of code.matchAll(codeTokenPattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(code.slice(cursor, index));
    nodes.push(
      <span className={codeTokenClass(token)} key={`${index}-${token}`}>
        {token}
      </span>,
    );
    cursor = index + token.length;
  }

  if (cursor < code.length) nodes.push(code.slice(cursor));
  return <>{nodes}</>;
}

function TypedContent({ blocks, fallback, language, compact = false }: { blocks?: ContentBlock[]; fallback: string; language: Language; compact?: boolean }) {
  if (!blocks?.length) {
    return <PlainText text={fallback} compact={compact} />;
  }

  return (
    <span className={compact ? "typed-content is-compact" : "typed-content"}>
      {blocks.map((block, index) => {
        if (block.type === "text") {
          return (
            <span className="typed-paragraph" key={index}>
              <PlainText text={blockText(block.text, language)} compact={compact} />
            </span>
          );
        }

        if (block.type === "list") {
          return (
            <ul className="typed-list" key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{blockText(item, language)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "table") {
          return (
            <span className="typed-table-wrap" key={index}>
              <table className="typed-table">
                <thead>
                  <tr>
                    {block.headers.map((cell, cellIndex) => (
                      <th key={cellIndex}>{blockText(cell, language)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{blockText(cell, language)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </span>
          );
        }

        return (
          <span className="code-window" key={index}>
            <span className="code-window-bar">
              <span className="code-window-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="code-window-language">{block.language ?? "code"}</span>
            </span>
            <code>
              <HighlightedCode code={blockText(block.code, language)} />
            </code>
          </span>
        );
      })}
    </span>
  );
}

export function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("interview-trainer-theme") === "light" ? "light" : "dark"));
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("interview-trainer-language") === "en" ? "en" : "ru"));
  const [topicId, setTopicId] = useState("all");
  const [progress, setProgress] = useState<ProgressMap>(readProgress);
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [flipped, setFlipped] = useState<FlippedMap>({});
  const [sliderIndex, setSliderIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState<StudyItem[]>([]);
  const [session, setSession] = useState<StudySession>(null);
  const [swipeHintToken, setSwipeHintToken] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const suppressNextClick = useRef(false);
  const swipeHintTimer = useRef<number | null>(null);
  const swipeHintCount = useRef(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("interview-trainer-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("interview-trainer-language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem("interview-trainer-progress-v2", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 719px)");
    const updateViewport = () => setIsMobileViewport(media.matches);

    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    let ignored = false;
    fetchErrorReports()
      .then((reports) => {
        if (!ignored) setErrorReports(reports);
      })
      .catch(() => {
        if (!ignored) setErrorReports([]);
      });
    return () => {
      ignored = true;
    };
  }, []);

  const statusSignature = useMemo(() => {
    return Object.entries(progress)
      .map(([id, item]) => `${id}:${item.status}`)
      .sort()
      .join("|");
  }, [progress]);

  const filtered = useMemo(() => {
    return cards.filter((item) => {
      if (topicId !== "all" && item.topicId !== topicId) return false;
      if (getStatus(item, progress) === "known") return false;
      return true;
    });
  }, [topicId, statusSignature]);

  const filteredKey = useMemo(() => filtered.map((item) => item.id).join("|"), [filtered]);
  const centerIndex = wrapIndex(sliderIndex, visibleItems.length);
  const activeItem = visibleItems[centerIndex];
  const sliderItems = ([-1, 0, 1] as const).map((offset) => {
    const position = offset === -1 ? "left" : offset === 1 ? "right" : "center";
    if (!visibleItems.length || (visibleItems.length === 1 && offset !== 0)) {
      return { item: undefined, position };
    }
    return {
      item: visibleItems[wrapIndex(sliderIndex + offset, visibleItems.length)],
      position,
    };
  });
  const counts = useMemo(() => {
    const all = cards;
    return {
      total: all.length,
      new: all.filter((item) => getStatus(item, progress) === "new").length,
      known: all.filter((item) => getStatus(item, progress) === "known").length,
      review: all.filter((item) => getStatus(item, progress) === "review").length,
    };
  }, [statusSignature]);

  const availableTopics = useMemo(() => {
    return topics.filter((topic) => topic.cardCount > 0);
  }, []);

  useEffect(() => {
    setVisibleItems((current) => refillDeck(current, filtered));
    setSliderIndex((current) => Math.min(current, Math.max(0, Math.min(DECK_SIZE, filtered.length) - 1)));
  }, [filteredKey]);

  useEffect(() => {
    setSliderIndex(0);
    setFlipped({});
  }, [topicId]);

  useEffect(() => {
    if (swipeHintTimer.current) {
      window.clearTimeout(swipeHintTimer.current);
      swipeHintTimer.current = null;
    }

    if (!isMobileViewport || !activeItem || swipeHintCount.current >= 3 || session) return;

    const scheduleNextHint = () => {
      const delays = [10_000, 60_000, 120_000];
      const delay = delays[swipeHintCount.current];
      if (!delay) return;

      swipeHintTimer.current = window.setTimeout(() => {
        swipeHintCount.current += 1;
        setSwipeHintToken((value) => value + 1);
        scheduleNextHint();
      }, delay);
    };

    scheduleNextHint();

    return () => {
      if (swipeHintTimer.current) {
        window.clearTimeout(swipeHintTimer.current);
        swipeHintTimer.current = null;
      }
    };
  }, [activeItem?.id, isMobileViewport, session]);

  function updateStatus(item: StudyItem, nextStatus: Status) {
    setProgress((current) => {
      return {
        ...current,
        [item.id]: {
          status: nextStatus,
        },
      };
    });
  }

  async function reportCardIssue(item: StudyItem) {
    const reports = await createErrorReport(item.id);
    if (reports.length) {
      setErrorReports((current) => {
        const next = new Map(current.map((report) => [report.cardId, report]));
        for (const report of reports) next.set(report.cardId, report);
        return [...next.values()];
      });
    }
  }

  function flipCard(flipKey: string) {
    setFlipped((current) => ({ ...current, [flipKey]: !current[flipKey] }));
  }

  function showPreviousCard() {
    if (!visibleItems.length) return;
    setSliderIndex((current) => (wrapIndex(current, visibleItems.length) === 0 ? visibleItems.length - 1 : current - 1));
  }

  function showNextCard() {
    if (!visibleItems.length) return;
    if (centerIndex === visibleItems.length - 1) {
      setVisibleItems(buildDeck(filtered, new Set(visibleItems.map((item) => item.id))));
      setSliderIndex(0);
      setFlipped({});
      return;
    }
    setSliderIndex((current) => current + 1);
  }

  function moveToPreviousCard() {
    showPreviousCard();
    setSwipeHintToken(0);
  }

  function moveToNextCard() {
    showNextCard();
    setSwipeHintToken(0);
  }

  function handleTouchStart(event: TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 48) return;
    suppressNextClick.current = true;
    if (deltaX > 0) {
      moveToPreviousCard();
    } else {
      moveToNextCard();
    }
    window.setTimeout(() => {
      suppressNextClick.current = false;
    }, 0);
  }

  function startSession(items: StudyItem[], title: string, random = false) {
    const next = random ? shuffle(items) : [...items];
    setSession(next.length ? { items: next, index: 0, title } : null);
  }

  function showPreviousSessionCard() {
    setSession((current) => (current ? { ...current, index: Math.max(0, current.index - 1) } : current));
  }

  function showNextSessionCard() {
    setSession((current) => (current ? { ...current, index: Math.min(current.items.length - 1, current.index + 1) } : current));
  }

  function renderStudyCard(item: StudyItem, className: string, key: string, allowSwipe = false, readOnly = false) {
    const flipKey = item.id;
    const itemStatus = getStatus(item, progress);
    const isFlipped = Boolean(flipped[flipKey]);
    const hasUnresolvedReport = errorReports.some((report) => report.cardId === item.id && !report.resolved);
    const codeBlocks = itemCodeContent(item);
    const currentStatusLabel = statusLabels[language][itemStatus];
    const currentTopicLabel = topicCardLabel(item.topicId, item.topicTitle, language);

    const shouldHintSwipe = isMobileViewport && className.includes("slider-center") && swipeHintToken > 0;

    return (
      <article
        className={`${className} question-card${isFlipped ? " is-flipped" : ""}${shouldHintSwipe ? ` is-swipe-hint is-swipe-hint-${swipeHintToken % 2}` : ""}`}
        key={key}
        onClick={() => {
          if (readOnly) return;
          if (suppressNextClick.current) return;
          flipCard(flipKey);
        }}
        onKeyDown={(event) => {
          if (readOnly) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            flipCard(flipKey);
          }
        }}
        onTouchStart={allowSwipe ? handleTouchStart : undefined}
        onTouchEnd={allowSwipe ? handleTouchEnd : undefined}
        role={readOnly ? "presentation" : "button"}
        tabIndex={readOnly ? -1 : 0}
      >
        <span className="question-card-inner">
          <span className="card-face card-front">
            <strong>
              <TypedContent blocks={itemTitleContent(item)} fallback={itemTitle(item, language)} language={language} compact />
            </strong>
            <span className="card-status-actions">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void reportCardIssue(item).catch(() => undefined);
                }}
              >
                {t(language, "reportIssue")}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  updateStatus(item, "known");
                }}
              >
                {t(language, "known")}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  updateStatus(item, "review");
                }}
              >
                {t(language, "review")}
              </button>
            </span>
            <span className="tag-row">
              <span>{t(language, "question")}</span>
              <span>{item.dataset === "javascript" ? "JS" : "DSA"}</span>
              <span>{currentTopicLabel}</span>
              <span>{currentStatusLabel}</span>
              {hasUnresolvedReport ? <span className="moderation-tag">{t(language, "reportModeration")}</span> : null}
            </span>
          </span>
          <span className="card-face card-back">
            <span className="back-content">
              <strong>
                <TypedContent blocks={itemAnswerTextContent(item)} fallback={itemAnswer(item, language)} language={language} />
              </strong>
              {codeBlocks.length ? (
                <span className="card-code-examples">
                  <TypedContent blocks={codeBlocks} fallback="" language={language} />
                </span>
              ) : null}
            </span>
            <span className="card-status-actions">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void reportCardIssue(item).catch(() => undefined);
                }}
              >
                {t(language, "reportIssue")}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  updateStatus(item, "known");
                }}
              >
                {t(language, "known")}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  updateStatus(item, "review");
                }}
              >
                {t(language, "review")}
              </button>
            </span>
            <span className="tag-row">
              <span>{t(language, "answer")}</span>
              <span>{item.dataset === "javascript" ? "JS" : "DSA"}</span>
              <span>{currentTopicLabel}</span>
              <span>{currentStatusLabel}</span>
              {hasUnresolvedReport ? <span className="moderation-tag">{t(language, "reportModeration")}</span> : null}
            </span>
          </span>
        </span>
      </article>
    );
  }

  return (
    <main className="app-shell">
      <div className="top-actions">
        <div className="topic-actions">
          {availableTopics.map((topic) => (
            <button
              className={topicId === topic.id ? "is-active" : ""}
              key={topic.id}
              onClick={() => {
                setTopicId(topic.id);
                startSession(
                  cards.filter((item) => item.topicId === topic.id && getStatus(item, progress) !== "known"),
                  topicButtonLabel(topic.id, topic.title, language),
                );
              }}
            >
              {topicButtonLabel(topic.id, topic.title, language)}
            </button>
          ))}
          <button className="is-primary" onClick={() => startSession(filtered, t(language, "random"), true)}>
            {t(language, "random")}
          </button>
        </div>
        <div className="settings-actions">
          <button onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))} aria-label={t(language, "theme")}>
            {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <button onClick={() => setLanguage((value) => (value === "ru" ? "en" : "ru"))} aria-label={t(language, "language")}>
            {language.toUpperCase()}
          </button>
        </div>
      </div>

      <section className="stats-line" aria-label={t(language, "stats")}>
        <span>
          {t(language, "total")} {counts.total}
        </span>
        <span>
          {t(language, "new")} {counts.new}
        </span>
        <span>
          {t(language, "known")} {counts.known}
        </span>
        <span>
          {t(language, "review")} {counts.review}
        </span>
      </section>

      <section className="card-slider" aria-label={t(language, "cards")}>
        {activeItem ? (
          <>
            <div className="slider-track">
              {sliderItems.map(({ item, position }) => {
                if (!item) return <span className={`slider-card slider-${position} is-empty`} key={position} />;
                const isCenter = position === "center";
                const card = renderStudyCard(item, `slider-card slider-${position}`, `${position}-${item.id}`, isCenter, !isCenter);
                if (isCenter) return card;
                return (
                  <span
                    className="side-card-hitbox"
                    key={`${position}-${item.id}`}
                    onClick={() => {
                      position === "left" ? moveToPreviousCard() : moveToNextCard();
                    }}
                  >
                    {card}
                  </span>
                );
              })}
            </div>
            {isMobileViewport ? (
              <p className="swipe-hint" aria-hidden="true">
                {t(language, "swipe")}
              </p>
            ) : null}
          </>
        ) : (
          <div className="empty-state">{t(language, "empty")}</div>
        )}
      </section>

      {session ? (
        <div className="session-screen" role="dialog" aria-modal="true">
          <div className="session-shell">
            <button className="close-button" onClick={() => setSession(null)} aria-label={t(language, "close")}>
              <X size={18} />
            </button>
            <div className="session-meta">
              <span>{session.title}</span>
              <span>
                {session.index + 1} / {session.items.length}
              </span>
            </div>
            <div className="session-card-wrap">{renderStudyCard(session.items[session.index], "session-card", `session-${session.items[session.index].id}`)}</div>
            <div className="slider-controls">
              <button className="secondary-action icon-action" onClick={showPreviousSessionCard} disabled={session.index === 0} aria-label={t(language, "previousSessionCard")}>
                <ChevronLeft size={18} />
              </button>
              <span>
                {session.index + 1} / {session.items.length}
              </span>
              <button className="secondary-action icon-action" onClick={showNextSessionCard} disabled={session.index >= session.items.length - 1} aria-label={t(language, "nextSessionCard")}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
