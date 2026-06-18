import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "cards");
const write = process.argv.includes("--write");
const languages = ["en", "ru"];

function normalizeText(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*|__|#+|>|[-–—]{2,}/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizePlain(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizePlainComparable(value) {
  return normalizePlain(value).replace(/\s+/g, " ").trim().toLowerCase();
}

function tokenEntries(value) {
  const entries = [];
  const pattern = /[\p{L}\p{N}_.$]+/gu;
  let match;
  while ((match = pattern.exec(value))) {
    const token = normalizeText(match[0]);
    if (token) {
      entries.push({
        token,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }
  return entries;
}

function trimAfterCut(value, cutIndex) {
  return value
    .slice(cutIndex)
    .replace(/^[\s:;,.|)\]}*_`#>–—-]+/u, "")
    .trim();
}

function removeDuplicatePrefix(answer, explanation) {
  const answerTokens = tokenEntries(answer);
  const explanationTokens = tokenEntries(explanation);

  if (answerTokens.length < 8 || explanationTokens.length <= answerTokens.length) {
    return null;
  }

  for (let index = 0; index < answerTokens.length; index += 1) {
    if (answerTokens[index].token !== explanationTokens[index]?.token) {
      return null;
    }
  }

  const next = trimAfterCut(explanation, explanationTokens[answerTokens.length - 1].end);
  if (normalizeText(next).length < 40) {
    return null;
  }

  return next;
}

function cleanupLocalizedExplanation(item, answerFieldName) {
  const changed = [];
  const answer = item[answerFieldName];
  const explanation = item.explanation;
  if (!answer || !explanation) return changed;

  for (const language of languages) {
    const answerText = answer[language];
    const explanationText = explanation[language];
    if (!answerText || !explanationText) continue;

    const answerNorm = normalizePlainComparable(answerText);
    const explanationNorm = normalizePlainComparable(explanationText);
    if (!answerNorm || !explanationNorm) continue;

    if (answerNorm === explanationNorm) {
      explanation[language] = "";
      changed.push({ language, action: "removed-full-duplicate" });
      continue;
    }

    const trimmed = removeDuplicatePrefix(answerText, explanationText);
    if (trimmed) {
      explanation[language] = trimmed;
      changed.push({ language, action: "removed-prefix-duplicate" });
    }
  }

  return changed;
}

function cleanupDeck(deck, file) {
  const changes = [];
  for (const card of deck.cards || []) {
    const changed = cleanupLocalizedExplanation(card, "answer");
    if (changed.length) {
      changes.push({ file, kind: "card", id: card.id, changes: changed });
    }
  }

  return changes;
}

const files = fs
  .readdirSync(dataDir)
  .filter((file) => file.endsWith(".json") && file !== "index.json")
  .sort();

const allChanges = [];

for (const file of files) {
  const fullPath = path.join(dataDir, file);
  const deck = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const changes = cleanupDeck(deck, file);
  allChanges.push(...changes);

  if (write && changes.length) {
    fs.writeFileSync(fullPath, `${JSON.stringify(deck, null, 2)}\n`);
  }
}

const summary = allChanges.reduce(
  (acc, item) => {
    acc.items += 1;
    for (const change of item.changes) {
      acc.actions[change.action] = (acc.actions[change.action] || 0) + 1;
      acc.languages[change.language] = (acc.languages[change.language] || 0) + 1;
    }
    return acc;
  },
  { mode: write ? "write" : "dry-run", items: 0, actions: {}, languages: {}, changes: allChanges },
);

console.log(JSON.stringify(summary, null, 2));
