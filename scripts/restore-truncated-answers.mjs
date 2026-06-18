import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDirs = [path.join(root, "data", "cards"), path.join(root, "data", "dsa")];
const write = process.argv.includes("--write");
const languages = ["en", "ru"];

function isTruncated(value) {
  return typeof value === "string" && /(?:\.\.\.|…)\s*$/.test(value.trim());
}

function cleanMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]+]\([^)]*\)/g, (match) => match.match(/\[([^\]]+)]/)?.[1] ?? " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function localized(value, language, allowFallback = false) {
  if (!value) return "";
  return value[language] || (allowFallback ? value.en || value.ru || "" : "");
}

function blocksToPlain(blocks, language) {
  if (!Array.isArray(blocks)) return "";
  const parts = [];

  for (const block of blocks) {
    if (block.type === "code") continue;
    if (block.type === "text") {
      const text = localized(block.text, language);
      if (text) parts.push(text);
      continue;
    }
    if (block.type === "list") {
      const items = block.items.map((item) => localized(item, language)).filter(Boolean);
      if (items.length) parts.push(items.map((item) => `- ${item}`).join("\n"));
      continue;
    }
    if (block.type === "table") {
      const rows = [
        block.headers?.map((cell) => localized(cell, language)).filter(Boolean).join(" | "),
        ...(block.rows ?? []).map((row) => row.map((cell) => localized(cell, language)).filter(Boolean).join(" | ")),
      ].filter(Boolean);
      if (rows.length) parts.push(rows.join("\n"));
    }
  }

  return cleanMarkdown(parts.join("\n\n"));
}

function replacementText(item, answerField, language) {
  const contentField = answerField === "answer" ? "answerContent" : "expectedAnswerContent";
  const fromAnswerBlocks = blocksToPlain(item[contentField], language);
  const fromExplanationBlocks = blocksToPlain(item.explanationContent, language);
  const fromExplanation = cleanMarkdown(localized(item.explanation, language));
  const current = localized(item[answerField], language);
  const continuation = fromExplanation && !isTruncated(fromExplanation) && isTruncated(current) ? cleanMarkdown(`${current.replace(/(?:\.\.\.|…)\s*$/, "")} ${fromExplanation}`) : "";

  return [fromAnswerBlocks, fromExplanationBlocks, fromExplanation, continuation]
    .filter((candidate) => candidate && !isTruncated(candidate))
    .sort((left, right) => right.length - left.length)[0] || "";
}

function restoreItem(item, answerField) {
  let changed = 0;
  if (!item[answerField]) return changed;

  for (const language of languages) {
    const current = item[answerField][language];
    if (!isTruncated(current)) continue;

    const next = replacementText(item, answerField, language);
    if (next && next.length > current.length) {
      item[answerField][language] = next;
      changed += 1;
    }
  }

  return changed;
}

const summary = { mode: write ? "write" : "dry-run", changed: 0, unresolved: [], byFile: {} };

for (const dir of dataDirs) {
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".json") && name !== "index.json").sort()) {
    const fullPath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    let changed = 0;

    for (const card of data.cards ?? []) changed += restoreItem(card, "answer");
    for (const task of data.tasks ?? []) changed += restoreItem(task, "expectedAnswer");

    for (const card of data.cards ?? []) {
      for (const language of languages) {
        if (isTruncated(card.answer?.[language])) summary.unresolved.push({ file: path.relative(root, fullPath), id: card.id, language, field: "answer" });
      }
    }
    for (const task of data.tasks ?? []) {
      for (const language of languages) {
        if (isTruncated(task.expectedAnswer?.[language])) summary.unresolved.push({ file: path.relative(root, fullPath), id: task.id, language, field: "expectedAnswer" });
      }
    }

    if (write && changed) fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`);
    summary.changed += changed;
    summary.byFile[path.relative(root, fullPath)] = changed;
  }
}

console.log(JSON.stringify(summary, null, 2));
