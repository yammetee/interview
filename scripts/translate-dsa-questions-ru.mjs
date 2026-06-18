import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "dsa");
const write = process.argv.includes("--write");

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function question(en) {
  const source = clean(en);
  const task = source.match(/^How do you solve or implement `(.+)`\??$/);
  if (task) return `Как решить или реализовать задачу \`${task[1]}\`?`;
  return source;
}

const summary = { mode: write ? "write" : "dry-run", changed: 0, byFile: {} };

for (const file of fs.readdirSync(dataDir).filter((name) => name.endsWith(".json") && name !== "index.json").sort()) {
  const fullPath = path.join(dataDir, file);
  const deck = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  let changed = 0;

  for (const card of deck.cards || []) {
    const next = question(card.question?.en || "");
    if (!next || next === card.question?.ru) continue;
    card.question.ru = next;
    changed += 1;
  }

  if (write && changed) fs.writeFileSync(fullPath, `${JSON.stringify(deck, null, 2)}\n`);
  summary.changed += changed;
  summary.byFile[file] = changed;
}

console.log(JSON.stringify(summary, null, 2));
