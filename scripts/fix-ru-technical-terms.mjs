import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDirs = [path.join(root, "data", "cards"), path.join(root, "data", "dsa")];
const write = process.argv.includes("--write");

const cyr = (source) => new RegExp(`(^|[^А-Яа-яЁё])(${source})(?=$|[^А-Яа-яЁё])`, "g");

const replacements = [
  // Promise terminology.
  [cyr("[Оо]бещани(?:е|я|ю|ем|и|й|ям|ями|ях|ем|ями|ях|й)"), "$1Promise"],
  [cyr("[Оо]бещан(?:ий|ия|ию|ием|ии)"), "$1Promise"],
  [cyr("[Пп]ромис(?:ы|ов|ам|ами|ах|ом|е)?"), "$1Promise"],
  [cyr("[Пп]ромис(?:а|у|ом|е)"), "$1Promise"],
  [cyr("[Пп]ромис"), "$1Promise"],

  // Callback terminology.
  [cyr("[Оо]братн(?:ый|ого|ому|ым|ом|ые|ых|ыми|ая|ую|ой|ые)\\s+вызов(?:ы|ов|ам|ами|ах|а|у|ом|е)?"), "$1callback"],
  [cyr("[Аа]д\\s+callback"), "$1callback hell"],
  [cyr("[Аа]д\\s+обратных\\s+вызовов"), "$1callback hell"],

  // Browser/platform/API names.
  [cyr("[Сс]ервисн(?:ый|ого|ому|ым|ом|ые|ых|ыми)\\s+работник(?:и|ов|ам|ами|ах|а|у|ом|е)?"), "$1Service Worker"],
  [cyr("[Сс]ервисн(?:ый|ого|ому|ым|ом|ые|ых|ыми)\\s+воркер(?:ы|ов|ам|ами|ах|а|у|ом|е)?"), "$1Service Worker"],
  [cyr("[Рр]аботник(?:и|ов|ам|ами|ах|а|у|ом|е)?\\s+служб(?:ы|е|ой|у)?"), "$1Service Worker"],
  [cyr("[Пп]очтов(?:ое|ого|ому|ым|ом|ые|ых|ыми)\\s+сообщени(?:е|я|ю|ем|и|й|ям|ями|ях)"), "$1postMessage"],
  [cyr("[Пп]рослушивател(?:ь|и|я|ей|ю|ем|ям|ями|ях)\\s+событи(?:й|я|ю|ем|ями|ях)?"), "$1event listener"],
  [cyr("[Пп]рослушивател(?:ь|и|я|ей|ю|ем|ям|ями|ях)"), "$1event listener"],
  [cyr("[Пп]рослушивани(?:е|я|ю|ем|и)\\s+событи(?:й|я|ю|ем|ями|ях)?"), "$1event listening"],
  [cyr("[Сс]лушател(?:ь|и|я|ей|ю|ем|ям|ями|ях)"), "$1event listener"],
  [cyr("[Цц]икл\\s+событий"), "$1event loop"],
  [cyr("[Сс]обытийн(?:ого|ому|ым|ом)\\s+цикл(?:а|у|ом|е)?"), "$1event loop"],
  [cyr("[Сс]обытийн(?:ый|ого|ому|ым|ом)\\s+цикл"), "$1event loop"],
  [cyr("[Оо]чередь\\s+событий"), "$1event queue"],
  [cyr("[Оо]череди\\s+событий"), "$1event queue"],
  [cyr("[Мм]икрозадач(?:а|и|у|ей|е|ам|ами|ах)"), "$1microtask"],
  [cyr("[Мм]икрозадач"), "$1microtask"],
  [cyr("[Оо]чередь\\s+microtask"), "$1microtask queue"],
  [cyr("[Оо]чередь\\s+микрозадач"), "$1microtask queue"],
  [cyr("[Оо]череди\\s+микрозадач"), "$1microtask queue"],
  [/очередьМикрозадача\(\)/g, "queueMicrotask()"],
  [/ОчередьМикрозадача\(\)/g, "queueMicrotask()"],
  [/\b[Оо]жидайте:\b/g, "await:"],
  [/метод Done/g, "метод done()"],
  [/методом Done/g, "методом done()"],
  [/метод done(?!\()/g, "метод done()"],
  [/методом done(?!\()/g, "методом done()"],
  [/готовый блок/g, "done-блок"],
  [/Готовый блок/g, "done-блок"],
  [/блок «Готово»/g, "done-блок"],
  [/блок «Тогда»/g, "then-блок"],
  [/пустым уловом/g, "пустым catch"],

  // Language/tool names.
  [cyr("[Мм]ашинописн(?:ый|ого|ому|ым|ом|ая|ой|ую|ые|ых|ыми)\\s+(?:текст|скрипт|код)"), "$1TypeScript"],
  [cyr("[Мм]ашинописн(?:ом|ого|ому|ым|ой|ую|ые|ых|ыми)"), "$1TypeScript"],
  [cyr("[Мм]ашинописн(?:ый|ая|ое|ые)\\s+текст"), "$1TypeScript"],
  [cyr("[Мм]ашинописн(?:ый|ая|ое|ые)\\s+скрипт"), "$1TypeScript"],
  [/\bTypescript\b/g, "TypeScript"],
  [/\btypescript\b/g, "TypeScript"],
  [/\bJavascript\b/g, "JavaScript"],
  [/\bjavascript\b/g, "JavaScript"],
  [/\bNodejs\b/g, "Node.js"],
  [/\bNodeJS\b/g, "Node.js"],
  [cyr("[Вв]авилон"), "$1Babel"],

  // JS API/method names that should stay as API names.
  [cyr("[Сс]рез(?:а|у|ом|е|ы|ов|ам|ами|ах)?"), "$1slice"],
  [cyr("[Сс]ращивани(?:е|я|ю|ем|и|й|ям|ями|ях)"), "$1splice"],
  [cyr("[Пп]одъем"), "$1hoisting"],
  [cyr("[Пп]одъема"), "$1hoisting"],
  [cyr("[Пп]одъему"), "$1hoisting"],
  [cyr("[Пп]одъемом"), "$1hoisting"],
  [cyr("[Пп]одняты"), "$1hoisted"],
  [cyr("[Пп]однимаются"), "$1hoisted"],
  [cyr("[Пп]однимается"), "$1hoisted"],
  [cyr("[Пп]еречислени(?:е|я|ю|ем|и|й|ям|ями|ях)"), "$1enum"],
  [cyr("[Зз]аморозк(?:а|и|у|ой|е)"), "$1Object.freeze()"],
  [cyr("[Зз]апечатывани(?:е|я|ю|ем|и)"), "$1Object.seal()"],
  [cyr("[Рр]аспространени(?:е|я|ю|ем|и)"), "$1spread"],
  [cyr("[Сс]окращени(?:е|я|ю|ем|и)"), "$1reduce"],
  [cyr("[Уу]меньшени(?:е|я|ю|ем|и)"), "$1reduce"],
  [cyr("[Оо]тображени(?:е|я|ю|ем|и)"), "$1map"],
  [cyr("[Фф]ильтраци(?:я|и|ю|ей|е)"), "$1filter"],
  [cyr("[Сс]трингификаци(?:я|и|ю|ей|е)"), "$1JSON.stringify()"],

  // Common method-name artifacts.
  [/\bметод(?:ы|ов|ам|ами|ах|а|у|ом|е)?\s+среза\b/g, "метод slice()"],
  [/\bметод(?:ы|ов|ам|ами|ах|а|у|ом|е)?\s+splice\b/g, "метод splice()"],
  [/\bметод(?:ы|ов|ам|ами|ах|а|у|ом|е)?\s+карты\b/g, "метод map()"],
  [/\bметод(?:ы|ов|ам|ами|ах|а|у|ом|е)?\s+фильтра\b/g, "метод filter()"],
  [/\bметод(?:ы|ов|ам|ами|ах|а|у|ом|е)?\s+сокращения\b/g, "метод reduce()"],
  [/\bметод(?:ы|ов|ам|ами|ах|а|у|ом|е)?\s+обратной\b/g, "метод reverse()"],
];

function fixText(value) {
  let next = value;
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }

  return next
    .replace(/\bPromise Promise\b/g, "Promise")
    .replace(/\bcallback callback\b/g, "callback")
    .replace(/\bmicrotask microtask\b/g, "microtask")
    .replace(/\bTypeScript TypeScript\b/g, "TypeScript")
    .replace(/\bPromise\.all\b/g, "Promise.all")
    .replace(/\bPromise\.race\b/g, "Promise.race")
    .replace(/ФункцияqueueMicrotask/g, "Функция queueMicrotask")
    .replace(/ЦельqueueMicrotask/g, "Цель queueMicrotask")
    .replace(/очереди microtask/g, "microtask queue")
    .replace(/очередь microtask/g, "microtask queue")
    .replace(/очереди microtask queue/g, "microtask queue")
    .replace(/очередь microtask queue/g, "microtask queue");
}

function visit(value) {
  if (!value || typeof value !== "object") return 0;
  let changed = 0;

  if (typeof value.ru === "string") {
    const next = fixText(value.ru);
    if (next !== value.ru) {
      value.ru = next;
      changed += 1;
    }
  }

  for (const nested of Object.values(value)) {
    changed += visit(nested);
  }

  return changed;
}

const summary = { mode: write ? "write" : "dry-run", changed: 0, byFile: {} };

for (const dir of dataDirs) {
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".json") && name !== "index.json").sort()) {
    const fullPath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    const changed = visit(data);

    if (write && changed) fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`);

    summary.changed += changed;
    summary.byFile[path.relative(root, fullPath)] = changed;
  }
}

console.log(JSON.stringify(summary, null, 2));
