import asyncJs from "../data/cards/async-js.json";
import browser from "../data/cards/browser.json";
import jsCore1 from "../data/cards/js-core-1.json";
import jsCore2 from "../data/cards/js-core-2.json";
import prototypes from "../data/cards/prototypes.json";
import react from "../data/cards/react.json";
import dsaArray from "../data/dsa/dsa-array.json";
import dsaBinary from "../data/dsa/dsa-binary.json";
import dsaDataStructures from "../data/dsa/dsa-data-structures.json";
import dsaDynamicProgramming from "../data/dsa/dsa-dynamic-programming.json";
import dsaGraph from "../data/dsa/dsa-graph.json";
import dsaHashTable from "../data/dsa/dsa-hash-table.json";
import dsaInterval from "../data/dsa/dsa-interval.json";
import dsaLinkedList from "../data/dsa/dsa-linked-list.json";
import dsaMatrix from "../data/dsa/dsa-matrix.json";
import dsaSorting from "../data/dsa/dsa-sorting.json";
import dsaStack from "../data/dsa/dsa-stack.json";
import dsaString from "../data/dsa/dsa-string.json";
import dsaTree from "../data/dsa/dsa-tree.json";

export type Language = "ru" | "en";
export type Difficulty = "easy" | "medium" | "hard";
export type TaskType = "predict-output" | "fix-code" | "implement" | "explain";
export type DatasetId = "all" | "javascript" | "dsa";
export type StudyKind = "cards" | "tasks";
export type OrderMode = "ordered" | "random";

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

export type SourceMeta = {
  repo: string;
  path?: string;
  number?: number;
  sourcePath?: string | null;
  documentationPath?: string | null;
  sourceUrl?: string | null;
  documentationUrl?: string | null;
};

export type ContentCuration = {
  needsCodeExample?: boolean;
  needsExplanation?: boolean;
  needsTypedContent?: boolean;
  needsTranslationReview?: boolean;
  needsAnswerReview?: boolean;
  reviewReasons?: string[];
};

export type Flashcard = {
  id: string;
  source: SourceMeta;
  topicId: string;
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

export type PracticalTask = {
  id: string;
  source: SourceMeta;
  topicId: string;
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

type RawDeck = {
  topic: {
    id: string;
    title: LocalizedText;
  };
  cards: Flashcard[];
  tasks: PracticalTask[];
};

export type Topic = {
  id: string;
  dataset: Exclude<DatasetId, "all">;
  title: string;
  cardCount: number;
  taskCount: number;
};

export type StudyItem =
  | (Flashcard & { kind: "card"; dataset: Exclude<DatasetId, "all">; topicTitle: string })
  | (PracticalTask & { kind: "task"; dataset: Exclude<DatasetId, "all">; topicTitle: string });

const jsDecks = [jsCore1, jsCore2, prototypes, asyncJs, react, browser] as RawDeck[];
const dsaDecks = [
  dsaDataStructures,
  dsaArray,
  dsaString,
  dsaDynamicProgramming,
  dsaBinary,
  dsaStack,
  dsaLinkedList,
  dsaTree,
  dsaGraph,
  dsaMatrix,
  dsaInterval,
  dsaHashTable,
  dsaSorting,
  dsaTree,
].filter((deck, index, decks) => decks.findIndex((item) => item.topic.id === deck.topic.id) === index) as RawDeck[];

function deckToTopic(deck: RawDeck, dataset: Exclude<DatasetId, "all">): Topic {
  return {
    id: deck.topic.id,
    dataset,
    title: deck.topic.title.ru ?? deck.topic.title.en,
    cardCount: deck.cards.length,
    taskCount: deck.tasks.length,
  };
}

function withDeckMeta(deck: RawDeck, dataset: Exclude<DatasetId, "all">) {
  const topicTitle = deck.topic.title.ru ?? deck.topic.title.en;
  return {
    cards: deck.cards.map((card) => ({ ...card, kind: "card" as const, dataset, topicTitle })),
    tasks: deck.tasks.map((task) => ({ ...task, kind: "task" as const, dataset, topicTitle })),
  };
}

const jsItems = jsDecks.map((deck) => withDeckMeta(deck, "javascript"));
const dsaItems = dsaDecks.map((deck) => withDeckMeta(deck, "dsa"));

export const allCards: StudyItem[] = [...jsItems.flatMap((deck) => deck.cards), ...dsaItems.flatMap((deck) => deck.cards)];
export const allTasks: StudyItem[] = [...jsItems.flatMap((deck) => deck.tasks), ...dsaItems.flatMap((deck) => deck.tasks)];

export function isActiveStudyItem(item: StudyItem): boolean {
  if (item.kind === "task" && item.type === "implement") {
    return false;
  }
  if (item.kind === "card" && item.dataset === "dsa") {
    return false;
  }
  const title = item.kind === "card" ? item.question.en : item.title.en;
  if (/how do you solve or implement/i.test(title)) {
    return false;
  }
  return true;
}

export const cards = allCards.filter(isActiveStudyItem);
export const tasks = allTasks.filter(isActiveStudyItem);

export const topics: Topic[] = [
  ...jsDecks.map((deck) => deckToTopic(deck, "javascript")),
  ...dsaDecks.map((deck) => deckToTopic(deck, "dsa")),
]
  .map((topic) => ({
    ...topic,
    cardCount: cards.filter((item) => item.topicId === topic.id).length,
    taskCount: tasks.filter((item) => item.topicId === topic.id).length,
  }))
  .filter((topic) => topic.cardCount > 0 || topic.taskCount > 0);

export function localText(value: LocalizedText | undefined, language: Language): string {
  if (!value) return "";
  return value[language] || value.en || value.ru || "";
}
