import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "cards");
const write = process.argv.includes("--write");
const fields = [
  { source: "answer", content: "answerContent" },
  { source: "explanation", content: "explanationContent" },
];

function cleanupText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => !/^\s*!\[[^\]]*]\([^)]+\)\s*$/.test(line))
    .join("\n")
    .replace(/^\s{4,}/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|\n)\s{0,6}#{1,6}\s+/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectLanguage(label) {
  const value = String(label || "").trim().toLowerCase();
  if (["javascript", "js"].includes(value)) return "js";
  if (["typescript", "ts"].includes(value)) return "ts";
  if (["jsx", "tsx", "html", "css", "json"].includes(value)) return value;
  return "text";
}

function normalizeCode(value) {
  const lines = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/^\n+|\n+$/g, "")
    .split("\n")
    .map((line) => line.trimEnd());

  const indentedLines = lines.filter((line) => line.trim());
  const commonIndent = indentedLines.reduce((min, line) => {
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    return Math.min(min, indent);
  }, Infinity);

  if (!Number.isFinite(commonIndent) || commonIndent === 0) {
    return lines.join("\n").trim();
  }

  return lines.map((line) => line.slice(commonIndent)).join("\n").trim();
}

function parseFencedBlocks(value) {
  const source = String(value || "").replace(/\r\n/g, "\n");
  const blocks = [];
  const pattern = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let cursor = 0;
  let match;

  while ((match = pattern.exec(source))) {
    const before = cleanupText(source.slice(cursor, match.index));
    if (before) {
      blocks.push({ type: "text", text: before });
    }

    const code = normalizeCode(match[2]);
    if (code.trim()) {
      blocks.push({ type: "code", language: detectLanguage(match[1]), code });
    }
    cursor = match.index + match[0].length;
  }

  const after = cleanupText(source.slice(cursor));
  if (after) {
    blocks.push({ type: "text", text: after });
  }

  return blocks;
}

function parseLooseCodeBlock(value) {
  const source = String(value || "").replace(/\r\n/g, "\n").trim();
  const match = source.match(/^([a-zA-Z][a-zA-Z0-9_-]*)\n([\s\S]*?)```$/);
  if (!match) return [];

  const language = detectLanguage(match[1]);
  const code = normalizeCode(match[2]);
  if (!code) return [];
  return [{ type: "code", language, code }];
}

function mergeLocalizedBlocks(enBlocks, ruBlocks) {
  if (!enBlocks.length) return [];
  const sameShape =
    enBlocks.length === ruBlocks.length &&
    enBlocks.every((block, index) => block.type === ruBlocks[index]?.type && (block.type !== "code" || block.language === ruBlocks[index]?.language));

  return enBlocks.map((block, index) => {
    const ruBlock = sameShape ? ruBlocks[index] : undefined;
    if (block.type === "code") {
      return {
        type: "code",
        language: block.language,
        code: {
          en: block.code,
          ...(ruBlock?.type === "code" && ruBlock.code !== block.code ? { ru: ruBlock.code } : {}),
        },
      };
    }

    return {
      type: "text",
      text: {
        en: block.text,
        ...(ruBlock?.type === "text" && ruBlock.text !== block.text ? { ru: ruBlock.text } : {}),
      },
    };
  });
}

function blocksWithLooseFallback(value) {
  const blocks = parseFencedBlocks(value);
  if (blocks.some((block) => block.type === "code")) return blocks;
  const looseBlocks = parseLooseCodeBlock(value);
  return looseBlocks.length ? looseBlocks : blocks;
}

function migrateItem(item) {
  const changes = [];
  for (const field of fields) {
    if (item[field.content]?.length) continue;
    const en = item[field.source]?.en || "";
    const ru = item[field.source]?.ru || "";
    if (!/```/.test(en) && !/```/.test(ru)) continue;

    const enBlocks = blocksWithLooseFallback(en);
    const ruBlocks = blocksWithLooseFallback(ru);
    const content = mergeLocalizedBlocks(enBlocks, ruBlocks);
    if (!content.some((block) => block.type === "code")) continue;

    item[field.content] = content;
    if (item.curation?.needsTypedContent) {
      item.curation.reviewReasons = item.curation.reviewReasons?.filter((reason) => reason !== "raw-markdown-or-code-in-string-fields");
      if (!item.curation.reviewReasons?.length) delete item.curation.reviewReasons;
      delete item.curation.needsTypedContent;
    }
    changes.push(field.content);
  }
  return changes;
}

const summary = {
  mode: write ? "write" : "dry-run",
  itemsChanged: 0,
  fieldsChanged: 0,
  byFile: {},
};

for (const file of fs.readdirSync(dataDir).filter((name) => name.endsWith(".json") && name !== "index.json").sort()) {
  const fullPath = path.join(dataDir, file);
  const deck = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const fileSummary = (summary.byFile[file] = { itemsChanged: 0, fieldsChanged: 0 });

  for (const collection of [deck.cards || [], deck.tasks || []]) {
    for (const item of collection) {
      const changes = migrateItem(item);
      if (!changes.length) continue;
      summary.itemsChanged += 1;
      summary.fieldsChanged += changes.length;
      fileSummary.itemsChanged += 1;
      fileSummary.fieldsChanged += changes.length;
    }
  }

  if (write && fileSummary.itemsChanged) {
    fs.writeFileSync(fullPath, `${JSON.stringify(deck, null, 2)}\n`);
  }
}

console.log(JSON.stringify(summary, null, 2));
