import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const summaryOnly = process.argv.includes("--summary");
const dataRoots = [
  { dataset: "javascript", dir: path.join(root, "data", "cards") },
  { dataset: "dsa", dir: path.join(root, "data", "dsa") },
];

const languages = ["en", "ru"];
const textFieldsByKind = {
  card: ["question", "answer", "explanation"],
  task: ["title", "prompt", "expectedAnswer", "explanation"],
};

function readDecks() {
  const decks = [];
  for (const source of dataRoots) {
    if (!fs.existsSync(source.dir)) continue;
    for (const file of fs.readdirSync(source.dir).filter((name) => name.endsWith(".json") && name !== "index.json").sort()) {
      const fullPath = path.join(source.dir, file);
      decks.push({
        dataset: source.dataset,
        file,
        path: fullPath,
        deck: JSON.parse(fs.readFileSync(fullPath, "utf8")),
      });
    }
  }
  return decks;
}

function local(value, language) {
  return value?.[language] || "";
}

function normalize(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*|__|#+|>|[-–—]{2,}/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tokens(value) {
  const normalized = normalize(value);
  if (!normalized) return [];
  return normalized.split(" ").filter((token) => token.length > 1);
}

function similarity(a, b) {
  const aTokens = new Set(tokens(a));
  const bTokens = new Set(tokens(b));
  if (!aTokens.size || !bTokens.size) return 0;
  let intersection = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) intersection += 1;
  }
  return intersection / Math.min(aTokens.size, bTokens.size);
}

function latinRatio(value) {
  const letters = String(value || "").match(/\p{L}/gu) || [];
  if (!letters.length) return 0;
  const latin = letters.filter((letter) => /[A-Za-z]/.test(letter)).length;
  return latin / letters.length;
}

function hasMarkdownTable(value) {
  return /\n\s*\|.+\|\s*\n\s*\|?[\s:|-]{6,}\|/m.test(value || "");
}

function hasAsciiTable(value) {
  return /-{8,}/.test(value || "") && /\|/.test(value || "");
}

function hasFence(value) {
  return /```/.test(value || "");
}

function hasMarkdownHeading(value) {
  return /(^|\n)\s{0,6}#{2,6}\s+\S/.test(value || "");
}

function hasMarkdownList(value) {
  return /(^|\n)\s*(?:[-*]|\d+[.)])\s+\S/.test(value || "");
}

function activeInTrainer(item) {
  if (item.kind === "task" && item.type === "implement") return false;
  if (item.kind === "card" && item.dataset === "dsa") return false;
  const title = item.kind === "card" ? item.question?.en : item.title?.en;
  if (/how do you solve or implement/i.test(title || "")) return false;
  return true;
}

function contentFields(item) {
  if (item.kind === "card") return ["questionContent", "answerContent", "explanationContent"];
  return ["titleContent", "promptContent", "expectedAnswerContent", "explanationContent"];
}

function inspectBlocks(blocks) {
  const result = { total: 0, text: 0, code: 0, table: 0, list: 0, invalid: 0 };
  if (!Array.isArray(blocks)) return result;
  for (const block of blocks) {
    result.total += 1;
    if (!block || !["text", "code", "table", "list"].includes(block.type)) {
      result.invalid += 1;
      continue;
    }
    result[block.type] += 1;
    if (block.type === "text" && !block.text?.en) result.invalid += 1;
    if (block.type === "code" && !block.code?.en) result.invalid += 1;
    if (block.type === "table" && (!Array.isArray(block.headers) || !Array.isArray(block.rows))) result.invalid += 1;
    if (block.type === "list" && !Array.isArray(block.items)) result.invalid += 1;
  }
  return result;
}

function pushLimited(bucket, item, limit = 20) {
  bucket.count += 1;
  if (bucket.examples.length < limit) bucket.examples.push(item);
}

function issueBucket() {
  return { count: 0, examples: [] };
}

const decks = readDecks();
const items = [];

for (const { dataset, file, deck } of decks) {
  for (const card of deck.cards || []) {
    items.push({ ...card, dataset, file, kind: "card", topicTitle: deck.topic?.title?.en || deck.topic?.id || card.topicId });
  }
  for (const task of deck.tasks || []) {
    items.push({ ...task, dataset, file, kind: "task", topicTitle: deck.topic?.title?.en || deck.topic?.id || task.topicId });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    decks: decks.length,
    items: items.length,
    cards: items.filter((item) => item.kind === "card").length,
    tasks: items.filter((item) => item.kind === "task").length,
    activeTrainerItems: items.filter(activeInTrainer).length,
  },
  byDataset: {},
  byTopic: {},
  issues: {
    duplicateIds: issueBucket(),
    duplicateQuestionsEn: issueBucket(),
    duplicateQuestionsRu: issueBucket(),
    duplicateTaskPromptsEn: issueBucket(),
    emptyRequiredEn: issueBucket(),
    emptyRequiredRu: issueBucket(),
    emptyExplanationEn: issueBucket(),
    emptyExplanationRu: issueBucket(),
    exactAnswerExplanationDuplicateEn: issueBucket(),
    exactAnswerExplanationDuplicateRu: issueBucket(),
    nearAnswerExplanationDuplicateEn: issueBucket(),
    nearAnswerExplanationDuplicateRu: issueBucket(),
    veryLongAnswerEn: issueBucket(),
    veryLongAnswerRu: issueBucket(),
    rawMarkdownTable: issueBucket(),
    asciiTable: issueBucket(),
    fencedCodeInString: issueBucket(),
    markdownHeading: issueBucket(),
    markdownList: issueBucket(),
    highEnglishInRu: issueBucket(),
    suspiciousRuTerms: issueBucket(),
    implementationLikeCard: issueBucket(),
    invalidTypedContent: issueBucket(),
  },
  typedContent: { itemsWithTypedContent: 0, blocks: { total: 0, text: 0, code: 0, table: 0, list: 0, invalid: 0 } },
};

const idMap = new Map();
const questionEnMap = new Map();
const questionRuMap = new Map();
const taskPromptMap = new Map();

function addMap(map, key, item) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(item);
}

for (const item of items) {
  const datasetStats = (report.byDataset[item.dataset] ||= { items: 0, cards: 0, tasks: 0, activeTrainerItems: 0 });
  datasetStats.items += 1;
  datasetStats[item.kind === "card" ? "cards" : "tasks"] += 1;
  if (activeInTrainer(item)) datasetStats.activeTrainerItems += 1;

  const topicStats = (report.byTopic[item.topicId] ||= { title: item.topicTitle, dataset: item.dataset, items: 0, cards: 0, tasks: 0, activeTrainerItems: 0 });
  topicStats.items += 1;
  topicStats[item.kind === "card" ? "cards" : "tasks"] += 1;
  if (activeInTrainer(item)) topicStats.activeTrainerItems += 1;

  addMap(idMap, item.id, item);
  if (item.kind === "card") {
    addMap(questionEnMap, normalize(local(item.question, "en")), item);
    addMap(questionRuMap, normalize(local(item.question, "ru")), item);
  } else {
    addMap(taskPromptMap, normalize(`${local(item.prompt, "en")} ${item.code || ""}`), item);
  }

  const fields = textFieldsByKind[item.kind];
  for (const field of fields) {
    for (const language of languages) {
      const value = local(item[field], language);
      const base = { id: item.id, file: item.file, dataset: item.dataset, topic: item.topicId, kind: item.kind, field, language };
      if (language === "en" && !String(value || "").trim()) pushLimited(report.issues.emptyRequiredEn, base);
      if (language === "ru" && !String(value || "").trim()) pushLimited(report.issues.emptyRequiredRu, base);
      if (field === "explanation" && language === "en" && !String(value || "").trim()) pushLimited(report.issues.emptyExplanationEn, base);
      if (field === "explanation" && language === "ru" && !String(value || "").trim()) pushLimited(report.issues.emptyExplanationRu, base);
      if (hasMarkdownTable(value)) pushLimited(report.issues.rawMarkdownTable, base);
      if (hasAsciiTable(value)) pushLimited(report.issues.asciiTable, base);
      if (hasFence(value)) pushLimited(report.issues.fencedCodeInString, base);
      if (hasMarkdownHeading(value)) pushLimited(report.issues.markdownHeading, base);
      if (hasMarkdownList(value)) pushLimited(report.issues.markdownList, base);
      if (language === "ru" && latinRatio(value) > 0.45 && normalize(value).length > 80) pushLimited(report.issues.highEnglishInRu, { ...base, latinRatio: Number(latinRatio(value).toFixed(2)) });
      if (language === "ru" && /(срез|сращив|обещани|обратн[а-я ]+вызов|прослушивател|сервисн[а-я ]+работник|почтов[а-я ]+сообщени|стрингификац)/i.test(value || "")) {
        pushLimited(report.issues.suspiciousRuTerms, base);
      }
    }
  }

  const answerField = item.kind === "card" ? "answer" : "expectedAnswer";
  for (const language of languages) {
    const answer = local(item[answerField], language);
    const explanation = local(item.explanation, language);
    if (!answer || !explanation) continue;
    const base = { id: item.id, file: item.file, dataset: item.dataset, topic: item.topicId, kind: item.kind, language };
    if (normalize(answer) === normalize(explanation)) {
      pushLimited(report.issues[`exactAnswerExplanationDuplicate${language === "en" ? "En" : "Ru"}`], base);
    } else if (similarity(answer, explanation) >= 0.86) {
      pushLimited(report.issues[`nearAnswerExplanationDuplicate${language === "en" ? "En" : "Ru"}`], { ...base, similarity: Number(similarity(answer, explanation).toFixed(2)) });
    }
    if (answer.length > 1200) pushLimited(report.issues[`veryLongAnswer${language === "en" ? "En" : "Ru"}`], { ...base, length: answer.length });
  }

  if (item.kind === "card" && /how do you solve or implement/i.test(local(item.question, "en"))) {
    pushLimited(report.issues.implementationLikeCard, { id: item.id, file: item.file, dataset: item.dataset, topic: item.topicId });
  }

  let hasTyped = false;
  for (const field of contentFields(item)) {
    if (!item[field]) continue;
    hasTyped = true;
    const inspected = inspectBlocks(item[field]);
    for (const key of Object.keys(report.typedContent.blocks)) {
      report.typedContent.blocks[key] += inspected[key];
    }
    if (inspected.invalid) {
      pushLimited(report.issues.invalidTypedContent, { id: item.id, file: item.file, dataset: item.dataset, topic: item.topicId, field, invalid: inspected.invalid });
    }
  }
  if (hasTyped) report.typedContent.itemsWithTypedContent += 1;
}

function collectDuplicates(map, bucket) {
  for (const [key, matches] of map) {
    if (!key || matches.length < 2) continue;
    pushLimited(bucket, {
      normalized: key.slice(0, 120),
      ids: matches.map((item) => item.id),
      files: [...new Set(matches.map((item) => item.file))],
    });
  }
}

collectDuplicates(idMap, report.issues.duplicateIds);
collectDuplicates(questionEnMap, report.issues.duplicateQuestionsEn);
collectDuplicates(questionRuMap, report.issues.duplicateQuestionsRu);
collectDuplicates(taskPromptMap, report.issues.duplicateTaskPromptsEn);

if (summaryOnly) {
  console.log(
    JSON.stringify(
      {
        generatedAt: report.generatedAt,
        totals: report.totals,
        byDataset: report.byDataset,
        byTopic: report.byTopic,
        issueCounts: Object.fromEntries(Object.entries(report.issues).map(([key, value]) => [key, value.count])),
        typedContent: report.typedContent,
      },
      null,
      2,
    ),
  );
} else {
  console.log(JSON.stringify(report, null, 2));
}
