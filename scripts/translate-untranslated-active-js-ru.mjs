import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const dataDir = path.join(root, "data", "cards");
const cachePath = path.join(root, ".cache", "translation-en-ru-scoped.json");
const write = process.argv.includes("--write");
const threshold = Number(process.argv.find((arg) => arg.startsWith("--threshold="))?.split("=")[1] ?? 0.55);

function loadCache() {
  if (!fs.existsSync(cachePath)) return {};
  return JSON.parse(fs.readFileSync(cachePath, "utf8"));
}

function saveCache(cache) {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function latinRatio(value) {
  const letters = [...value].filter((char) => /[A-Za-zА-Яа-яЁё]/.test(char));
  if (!letters.length) return 0;
  return letters.filter((char) => /[A-Za-z]/.test(char)).length / letters.length;
}

function shouldTranslate(value) {
  return typeof value === "string" && value.length > 60 && latinRatio(value) > threshold;
}

function protectMarkdown(value) {
  const protectedValues = new Map();
  let index = 0;
  const stash = (match) => {
    const token = `ZXQPH${String(index).padStart(5, "0")}QXZ`;
    protectedValues.set(token, match);
    index += 1;
    return token;
  };

  const text = value
    .replace(/```[\s\S]*?```/g, stash)
    .replace(/`[^`\n]+`/g, stash)
    .replace(/https?:\/\/[^\s)]+/g, stash);

  return { text, protectedValues };
}

function restoreMarkdown(value, protectedValues) {
  let text = value;
  for (const [token, original] of protectedValues.entries()) {
    const loose = token
      .split("")
      .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("\\s*");
    text = text.replace(new RegExp(loose, "gi"), original).replaceAll(token, original);
  }
  return text;
}

async function translateText(value, cache) {
  const key = hash(value);
  if (cache[key]) return cache[key];

  const { text, protectedValues } = protectMarkdown(value);
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", "ru");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`Translation failed: ${response.status}`);
  const payload = await response.json();
  const translated = restoreMarkdown(payload[0].map((part) => part?.[0] ?? "").join(""), protectedValues);
  cache[key] = translated;
  saveCache(cache);
  await new Promise((resolve) => setTimeout(resolve, 90));
  return translated;
}

async function translateLocalized(value, cache) {
  if (!value?.en || !shouldTranslate(value.ru ?? "")) return 0;
  const next = await translateText(value.en, cache);
  if (next && next !== value.ru) {
    value.ru = next;
    return 1;
  }
  return 0;
}

async function translateBlocks(blocks, cache) {
  if (!Array.isArray(blocks)) return 0;
  let changed = 0;

  for (const block of blocks) {
    if (block.type === "text" && block.text?.en && (!block.text.ru || shouldTranslate(block.text.ru))) {
      block.text.ru = await translateText(block.text.en, cache);
      changed += 1;
    }
    if (block.type === "list") {
      for (const item of block.items ?? []) {
        if (item.en && (!item.ru || shouldTranslate(item.ru))) {
          item.ru = await translateText(item.en, cache);
          changed += 1;
        }
      }
    }
    if (block.type === "table") {
      for (const cell of [...(block.headers ?? []), ...(block.rows ?? []).flat()]) {
        if (cell.en && (!cell.ru || shouldTranslate(cell.ru))) {
          cell.ru = await translateText(cell.en, cache);
          changed += 1;
        }
      }
    }
  }

  return changed;
}

const cache = loadCache();
const summary = { mode: write ? "write" : "dry-run", changed: 0, cards: [] };

for (const file of fs.readdirSync(dataDir).filter((name) => name.endsWith(".json") && name !== "index.json").sort()) {
  const fullPath = path.join(dataDir, file);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  let fileChanged = 0;

  for (const card of data.cards ?? []) {
    if (!shouldTranslate(card.answer?.ru ?? "")) continue;
    const changed =
      (await translateLocalized(card.answer, cache)) +
      (await translateBlocks(card.answerContent, cache)) +
      (await translateBlocks(card.explanationContent, cache));
    if (changed) {
      fileChanged += changed;
      summary.cards.push({ file, id: card.id, changed });
    }
  }

  if (write && fileChanged) fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`);
  summary.changed += fileChanged;
}

console.log(JSON.stringify(summary, null, 2));
