#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "external" / "sudheerj-javascript-interview-questions"
README = SOURCE / "README.md"
EXERCISES = SOURCE / "coding-exercise"
OUT = ROOT / "data" / "cards"
MATERIAL = ROOT / "docs" / "card-material"
COPIED_EXERCISES = ROOT / "data" / "coding-exercise" / "sudheerj"


TOPICS = {
    "js-core-1": {
        "title": "Scope, Hoisting, TDZ, Closures",
        "keywords": [
            "scope",
            "hoist",
            "temporal",
            "dead zone",
            "closure",
            "var",
            "let",
            "const",
            "iife",
            "lexical",
            "global variable",
            "global object",
        ],
    },
    "js-core-2": {
        "title": "this, call, apply, bind",
        "keywords": [
            "this",
            "call",
            "apply",
            "bind",
            "arrow function",
            "lambda",
            "context",
            "currying",
            "higher order",
            "first class",
            "pure function",
            "function",
        ],
    },
    "prototypes": {
        "title": "Prototype, Prototype Chain, Class",
        "keywords": [
            "prototype",
            "class",
            "constructor",
            "inheritance",
            "object.create",
            "__proto__",
            "instanceof",
            "extends",
            "super",
        ],
    },
    "async-js": {
        "title": "Event Loop, Promise, async/await",
        "keywords": [
            "promise",
            "async",
            "await",
            "event loop",
            "eventloop",
            "microtask",
            "macrotask",
            "callback",
            "settimeout",
            "queue",
            "timer",
            "debounce",
            "throttle",
            "observable",
        ],
    },
    "react": {
        "title": "React, Rendering, Memoization",
        "keywords": [
            "react",
            "render",
            "memo",
            "component",
            "jsx",
            "hook",
            "state",
            "props",
        ],
    },
    "browser": {
        "title": "Browser, Networking, Storage",
        "keywords": [
            "dom",
            "browser",
            "cookie",
            "storage",
            "indexeddb",
            "service worker",
            "web worker",
            "bom",
            "url",
            "http",
            "https",
            "cors",
            "fetch",
            "ajax",
            "xmlhttprequest",
            "event",
            "window",
            "document",
            "cache",
            "post message",
            "websocket",
            "server sent",
            "history",
            "navigator",
        ],
    },
}

DEFAULT_TOPIC = "js-core-2"


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"`([^`]+)`", r"\1", value)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "item"


def clean_body(body: str) -> str:
    body = re.sub(r"\n\s*\*\*\[⬆ Back to Top\]\(#table-of-contents\)\*\*\s*", "\n", body)
    body = body.strip()
    return body


def plain_excerpt(markdown: str, limit: int = 700) -> str:
    text = re.sub(r"```[\s\S]*?```", " ", markdown)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"[*_>#`|]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0] + "..."


def assign_topic(question: str, body: str) -> str:
    haystack = f"{question} {body[:1200]}".lower()
    scores: dict[str, int] = {}
    for topic, meta in TOPICS.items():
        score = 0
        for keyword in meta["keywords"]:
            if keyword in haystack:
                score += 1
        scores[topic] = score
    best = max(scores.items(), key=lambda item: item[1])
    return best[0] if best[1] else DEFAULT_TOPIC


def parse_readme() -> list[dict]:
    text = README.read_text()
    headings = list(re.finditer(r"(?m)^\s*(\d+)\.\s+###\s+(.+)$", text))
    questions: list[dict] = []
    for index, match in enumerate(headings):
        number = int(match.group(1))
        question = match.group(2).strip()
        start = match.end()
        end = headings[index + 1].start() if index + 1 < len(headings) else text.find("### Coding Exercise")
        if end == -1:
            end = len(text)
        body = clean_body(text[start:end])
        if not body:
            body = "No explanation body was provided in the imported README section."
        topic = assign_topic(question, body)
        answer_excerpt = plain_excerpt(body) or "See imported explanation body."
        item_id = f"sudheerj-q-{number:03d}-{slugify(question)[:70]}"
        questions.append(
            {
                "id": item_id,
                "source": {
                    "repo": "sudheerj/javascript-interview-questions",
                    "path": "README.md",
                    "number": number,
                },
                "topicId": topic,
                "subtopic": "Imported",
                "difficulty": "medium",
                "question": {"en": question},
                "answer": {"en": answer_excerpt},
                "explanation": {"en": body},
                "tags": ["sudheerj", "imported", topic],
            }
        )
    return questions


def read_exercise(path: Path) -> dict:
    rel = path.relative_to(EXERCISES)
    text = path.read_text()
    stem = rel.parent.name if path.name.lower() == "readme.md" else path.stem
    title = stem.replace("-", " ").replace("_", " ").strip().title()
    topic = assign_topic(title, text)
    ext = path.suffix.lower()
    task_type = "implement" if ext in {".js", ".ts"} else "explain"
    return {
        "id": f"sudheerj-ex-{slugify(str(rel.with_suffix('')))}",
        "source": {
            "repo": "sudheerj/javascript-interview-questions",
            "path": f"coding-exercise/{rel.as_posix()}",
        },
        "topicId": topic,
        "subtopic": "Imported Exercise",
        "type": task_type,
        "difficulty": "medium",
        "title": {"en": title},
        "prompt": {"en": f"Imported coding exercise from `{rel.as_posix()}`."},
        "code": text if ext in {".js", ".ts"} else None,
        "expectedAnswer": {"en": text},
        "explanation": {"en": text},
        "tags": ["sudheerj", "imported", "coding-exercise", topic],
    }


def parse_exercises() -> list[dict]:
    return [read_exercise(path) for path in sorted(EXERCISES.rglob("*")) if path.is_file()]


def dedupe_questions(questions: list[dict]) -> tuple[list[dict], list[dict]]:
    seen: dict[str, dict] = {}
    kept: list[dict] = []
    skipped: list[dict] = []
    for item in questions:
        key = re.sub(r"[^a-z0-9]+", " ", item["question"]["en"].lower()).strip()
        if key in seen:
            skipped.append({"duplicateOf": seen[key]["id"], **item})
        else:
            seen[key] = item
            kept.append(item)
    return kept, skipped


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def write_topic_files(questions: list[dict], exercises: list[dict], skipped: list[dict]) -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    files = []
    for topic, meta in TOPICS.items():
        topic_questions = [q for q in questions if q["topicId"] == topic]
        topic_tasks = [t for t in exercises if t["topicId"] == topic]
        deck = {
            "topic": {"id": topic, "title": {"en": meta["title"]}},
            "cards": topic_questions,
            "tasks": topic_tasks,
        }
        filename = f"{topic}.json"
        write_json(OUT / filename, deck)
        files.append(filename)

    index = {
        "source": {
            "repo": "sudheerj/javascript-interview-questions",
            "localPath": "external/sudheerj-javascript-interview-questions",
        },
        "topics": [{"id": topic, "title": {"en": meta["title"]}} for topic, meta in TOPICS.items()],
        "counts": {
            "cards": len(questions),
            "tasks": len(exercises),
            "skippedDuplicateQuestions": len(skipped),
        },
        "files": files,
    }
    write_json(OUT / "index.json", index)


def copy_exercises() -> None:
    if COPIED_EXERCISES.exists():
        shutil.rmtree(COPIED_EXERCISES)
    shutil.copytree(EXERCISES, COPIED_EXERCISES)


def write_material_report(questions: list[dict], exercises: list[dict], skipped: list[dict]) -> None:
    MATERIAL.mkdir(parents=True, exist_ok=True)
    by_topic = {topic: 0 for topic in TOPICS}
    ex_by_topic = {topic: 0 for topic in TOPICS}
    for q in questions:
        by_topic[q["topicId"]] += 1
    for t in exercises:
        ex_by_topic[t["topicId"]] += 1

    lines = [
        "# SudheerJ Import Report",
        "",
        "Source: `external/sudheerj-javascript-interview-questions`",
        "",
        "This project now uses imported SudheerJ questions/exercises as the card source.",
        "The previously hand-written question base was removed.",
        "",
        "## Counts",
        "",
        f"- Imported README questions: {len(questions)}",
        f"- Skipped duplicate README questions: {len(skipped)}",
        f"- Imported coding exercise files: {len(exercises)}",
        "",
        "## Questions By Topic",
        "",
    ]
    for topic, count in by_topic.items():
        lines.append(f"- `{topic}`: {count}")
    lines += ["", "## Exercises By Topic", ""]
    for topic, count in ex_by_topic.items():
        lines.append(f"- `{topic}`: {count}")
    lines += [
        "",
        "## Generated Files",
        "",
        "- `data/cards/*.json`",
        "- `data/coding-exercise/sudheerj/**`",
        "",
        "## Duplicate Policy",
        "",
        "Duplicate README questions are removed by normalized question text.",
        "Exercises are imported as separate tasks and are not deduplicated because filenames/contexts are part of the exercise material.",
        "",
    ]
    write_path = MATERIAL / "sudheerj-import-report.md"
    write_path.write_text("\n".join(lines) + "\n")


def validate(questions: list[dict], exercises: list[dict]) -> None:
    ids = [item["id"] for item in questions + exercises]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate ids")
    q = [item["question"]["en"].lower() for item in questions]
    if len(q) != len(set(q)):
        raise ValueError("Duplicate question text after dedupe")
    for item in questions:
        if not item["answer"]["en"] or not item["explanation"]["en"]:
            raise ValueError(f"Missing answer/explanation for {item['id']}")
    for item in exercises:
        if not item["expectedAnswer"]["en"] or not item["explanation"]["en"]:
            raise ValueError(f"Missing exercise material for {item['id']}")


def main() -> None:
    questions_raw = parse_readme()
    questions, skipped = dedupe_questions(questions_raw)
    exercises = parse_exercises()
    validate(questions, exercises)
    copy_exercises()
    write_topic_files(questions, exercises, skipped)
    write_material_report(questions, exercises, skipped)
    print(
        f"Imported {len(questions)} questions, {len(exercises)} exercise files, "
        f"skipped {len(skipped)} duplicate questions"
    )


if __name__ == "__main__":
    main()
