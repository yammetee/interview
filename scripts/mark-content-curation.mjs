import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dirs = [path.join(root, "data", "cards"), path.join(root, "data", "dsa")];
const write = process.argv.includes("--write");

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
  return normalized ? normalized.split(" ").filter((token) => token.length > 1) : [];
}

function similarity(a, b) {
  const left = new Set(tokens(a));
  const right = new Set(tokens(b));
  if (!left.size || !right.size) return 0;
  let common = 0;
  for (const token of left) {
    if (right.has(token)) common += 1;
  }
  return common / Math.min(left.size, right.size);
}

function latinRatio(value) {
  const letters = String(value || "").match(/\p{L}/gu) || [];
  if (!letters.length) return 0;
  return letters.filter((letter) => /[A-Za-z]/.test(letter)).length / letters.length;
}

function hasTypedCode(item) {
  const fields = ["questionContent", "answerContent", "explanationContent", "titleContent", "promptContent", "expectedAnswerContent"];
  return fields.some((field) => Array.isArray(item[field]) && item[field].some((block) => block?.type === "code"));
}

function hasTypedContent(item) {
  const fields = ["questionContent", "answerContent", "explanationContent", "titleContent", "promptContent", "expectedAnswerContent"];
  return fields.some((field) => Array.isArray(item[field]) && item[field].length > 0);
}

function wantsCodeExample(item, answerFieldName) {
  if (hasTypedCode(item)) return false;
  const question = item.question?.en || item.title?.en || "";
  const answer = item[answerFieldName]?.en || "";
  const explanation = item.explanation?.en || "";
  const combined = `${question}\n${answer}\n${explanation}`;

  if (/```/.test(combined)) return false;
  if (/\b(example|syntax|usage|how do you|how to|write|create|implement|invoke|call|access|delete|submit|detect|generate|compare|convert|parse|stringify|flatten|clone|merge|sort|filter|map|reduce)\b/i.test(combined)) {
    return true;
  }
  if (/\b(Array\.|Object\.|Promise\.|Math\.|JSON\.|document\.|window\.|localStorage|sessionStorage|addEventListener|setTimeout|setInterval|fetch|new\s+[A-Z]\w+|=>|function\s+\w*)\b/.test(combined)) {
    return true;
  }
  return false;
}

function hasRawFormatting(item) {
  const values = ["question", "answer", "expectedAnswer", "title", "prompt", "explanation"].flatMap((field) => [item[field]?.en || "", item[field]?.ru || ""]);
  return values.some((value) => /```|\n\s*\|.+\|\s*\n\s*\|?[\s:|-]{6,}\||(^|\n)\s{0,6}#{2,6}\s+\S|(^|\n)\s*(?:[-*]|\d+[.)])\s+\S/.test(value));
}

function needsTranslationReview(item) {
  const values = ["question", "answer", "expectedAnswer", "title", "prompt", "explanation"].map((field) => item[field]?.ru || "").filter(Boolean);
  return values.some((value) => {
    if (latinRatio(value) > 0.45 && normalize(value).length > 80) return true;
    return /(срез|сращив|обещани|обратн[а-я ]+вызов|прослушивател|сервисн[а-я ]+работник|почтов[а-я ]+сообщени|стрингификац)/i.test(value);
  });
}

function curationForItem(item, answerFieldName) {
  const answerEn = item[answerFieldName]?.en || "";
  const explanationEn = item.explanation?.en || "";
  const reasons = [];
  const curation = {};

  if (!explanationEn.trim()) {
    curation.needsExplanation = true;
    reasons.push("empty-explanation-en");
  } else if (answerEn && similarity(answerEn, explanationEn) >= 0.86) {
    curation.needsExplanation = true;
    reasons.push("answer-explanation-overlap-en");
  }

  if (wantsCodeExample(item, answerFieldName)) {
    curation.needsCodeExample = true;
    reasons.push("code-example-useful");
  }

  if (hasRawFormatting(item) && !hasTypedContent(item)) {
    curation.needsTypedContent = true;
    reasons.push("raw-markdown-or-code-in-string-fields");
  }

  if (needsTranslationReview(item)) {
    curation.needsTranslationReview = true;
    reasons.push("ru-translation-review");
  }

  if (answerEn.length > 1200) {
    curation.needsAnswerReview = true;
    reasons.push("answer-too-long-en");
  }

  if (reasons.length) {
    curation.reviewReasons = [...new Set(reasons)].sort();
    return curation;
  }
  return undefined;
}

const summary = {
  mode: write ? "write" : "dry-run",
  items: 0,
  markedItems: 0,
  flags: {
    needsCodeExample: 0,
    needsExplanation: 0,
    needsTypedContent: 0,
    needsTranslationReview: 0,
    needsAnswerReview: 0,
  },
  byFile: {},
};

for (const dir of dirs) {
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".json") && name !== "index.json").sort()) {
    const fullPath = path.join(dir, file);
    const deck = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    const fileSummary = (summary.byFile[file] = { items: 0, markedItems: 0, ...Object.fromEntries(Object.keys(summary.flags).map((key) => [key, 0])) });

    for (const card of deck.cards || []) {
      summary.items += 1;
      fileSummary.items += 1;
      const curation = curationForItem(card, "answer");
      if (curation) {
        card.curation = curation;
        summary.markedItems += 1;
        fileSummary.markedItems += 1;
        for (const key of Object.keys(summary.flags)) {
          if (curation[key]) {
            summary.flags[key] += 1;
            fileSummary[key] += 1;
          }
        }
      } else {
        delete card.curation;
      }
    }

    for (const task of deck.tasks || []) {
      summary.items += 1;
      fileSummary.items += 1;
      const curation = curationForItem(task, "expectedAnswer");
      if (curation) {
        task.curation = curation;
        summary.markedItems += 1;
        fileSummary.markedItems += 1;
        for (const key of Object.keys(summary.flags)) {
          if (curation[key]) {
            summary.flags[key] += 1;
            fileSummary[key] += 1;
          }
        }
      } else {
        delete task.curation;
      }
    }

    if (write) {
      fs.writeFileSync(fullPath, `${JSON.stringify(deck, null, 2)}\n`);
    }
  }
}

console.log(JSON.stringify(summary, null, 2));
