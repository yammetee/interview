#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import shutil
from collections import defaultdict
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "external" / "sudheerj-datastructures-algorithms"
README = SOURCE / "README.md"
SRC = SOURCE / "src"
OUT = ROOT / "data" / "dsa"
MATERIAL = ROOT / "docs" / "card-material"
COPIED_SOURCE = ROOT / "data" / "coding-exercise" / "sudheerj-dsa"


TOPICS = {
    "dsa-data-structures": "Data Structures",
    "dsa-array": "Array Algorithms",
    "dsa-string": "String Algorithms",
    "dsa-dynamic-programming": "Dynamic Programming",
    "dsa-binary": "Binary Algorithms",
    "dsa-stack": "Stack Algorithms",
    "dsa-linked-list": "Linked List Algorithms",
    "dsa-tree": "Tree Algorithms",
    "dsa-graph": "Graph Algorithms",
    "dsa-matrix": "Matrix Algorithms",
    "dsa-interval": "Interval Algorithms",
    "dsa-hash-table": "Hash Table Algorithms",
    "dsa-sorting": "Sorting",
    "dsa-misc": "Misc Algorithms",
}


SUBTOPIC_TO_TOPIC = {
    "Stack": "dsa-stack",
    "Queue": "dsa-data-structures",
    "SinglyLinkedList": "dsa-linked-list",
    "DoublyLinkedList": "dsa-linked-list",
    "LinkedList": "dsa-linked-list",
    "Tree": "dsa-tree",
    "Graphs": "dsa-graph",
    "Graph": "dsa-graph",
    "HashTable": "dsa-hash-table",
    "Array": "dsa-array",
    "String": "dsa-string",
    "Dynamic programming": "dsa-dynamic-programming",
    "Binary": "dsa-binary",
    "Matrix": "dsa-matrix",
    "Interval": "dsa-interval",
    "Sorting": "dsa-sorting",
    "Misc": "dsa-misc",
}


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"`([^`]+)`", r"\1", value)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "item"


def clean_cell(value: str) -> str:
    value = re.sub(r"<br\s*/?>", " ", value, flags=re.I)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def extract_link(cell: str) -> tuple[str, str | None]:
    match = re.search(r"\[([^\]]+)\]\(([^)]+)\)", cell)
    if not match:
        text = clean_cell(re.sub(r"`", "", cell))
        return text, None
    return clean_cell(match.group(1)), match.group(2)


def local_path_from_github_url(url: str | None) -> Path | None:
    if not url:
        return None
    marker = "/blob/master/"
    if marker not in url:
        return None
    rel = unquote(url.split(marker, 1)[1])
    return SOURCE / rel


def find_existing_path(path: Path | None, row: dict, suffix: str) -> Path | None:
    if path and path.exists():
        return path
    if not path:
        return None

    parent = path.parent
    candidates = [
        parent / f"{path.stem}{suffix}",
        parent / "README.md" if suffix == ".md" else parent / f"{path.stem}{suffix}",
    ]

    try:
        number = int(row.get("no", "0"))
    except ValueError:
        number = 0
    if number:
        for base in (parent, parent.parent):
            if not base.exists():
                continue
            for numbered_dir in base.glob(f"{number}.*"):
                if numbered_dir.is_dir():
                    candidates.extend(
                        [
                            numbered_dir / f"{numbered_dir.name.split('.', 1)[1]}{suffix}",
                            numbered_dir / f"{path.stem}{suffix}",
                            numbered_dir / "README.md" if suffix == ".md" else numbered_dir / f"{path.stem}{suffix}",
                        ]
                    )

    search_root = parent.parent if parent.parent.exists() else path.parents[0]
    if search_root.exists():
        candidates.extend(search_root.glob(f"**/{path.stem}{suffix}"))
        normalized_name = slugify(row.get("name", "")).replace("-", "")
        for candidate in search_root.glob(f"**/*{suffix}"):
            if slugify(candidate.stem).replace("-", "") == normalized_name:
                candidates.append(candidate)

    for candidate in candidates:
        if candidate and candidate.exists() and candidate.is_file():
            return candidate
    return None


def plain_excerpt(markdown: str, limit: int = 900) -> str:
    text = re.sub(r"```[\s\S]*?```", " ", markdown)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"[*_>#`|]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0] + "..."


def read_text(path: Path | None) -> str:
    if not path or not path.exists() or not path.is_file():
        return ""
    return path.read_text(errors="replace").strip()


def difficulty(value: str) -> str:
    normalized = value.strip().lower()
    if normalized in {"easy", "medium", "hard"}:
        return normalized
    return "medium"


def parse_table_row(line: str) -> list[str]:
    return [clean_cell(cell) for cell in line.strip().strip("|").split("|")]


def parse_readme_rows() -> list[dict]:
    rows: list[dict] = []
    current_area = ""
    current_subtopic = ""
    headers: list[str] = []
    in_table = False

    for line in README.read_text().splitlines():
        h2 = re.match(r"^##\s+(.+)$", line)
        h3 = re.match(r"^###\s+(.+)$", line)
        if h2:
            current_area = h2.group(1).strip()
            current_subtopic = current_area if current_area == "Sorting" else ""
            headers = []
            in_table = False
            continue
        if h3:
            current_subtopic = h3.group(1).strip()
            headers = []
            in_table = False
            continue
        if not line.startswith("|"):
            continue

        cells = parse_table_row(line)
        if not cells:
            continue
        first = cells[0].lower().strip()
        if first in {"no.", "no"}:
            headers = [re.sub(r"[^a-z0-9]+", "_", cell.lower()).strip("_") for cell in cells]
            in_table = True
            continue
        if in_table and re.match(r"^:?-{3,}:?$", cells[0]):
            continue
        if not in_table or not headers or not cells[0].strip().isdigit():
            continue

        while len(cells) < len(headers):
            cells.append("")
        row = dict(zip(headers, cells))
        row["area"] = current_area
        row["subtopic"] = current_subtopic or current_area
        rows.append(row)

    return rows


def topic_for(area: str, subtopic: str) -> str:
    if area == "Data Structures":
        return "dsa-data-structures"
    if area == "Sorting":
        return "dsa-sorting"
    return SUBTOPIC_TO_TOPIC.get(subtopic, "dsa-misc")


def build_answer(row: dict, doc_excerpt: str) -> str:
    parts = []
    level = clean_cell(row.get("level", ""))
    pattern = clean_cell(row.get("pattern", "") or row.get("complexity", ""))
    hint = clean_cell(row.get("hint", ""))
    if level and level != "-":
        parts.append(f"Level: {level}.")
    if pattern and pattern != "-":
        parts.append(f"Pattern/complexity: {pattern}.")
    if hint and hint != "-":
        parts.append(f"Hint: {hint}.")
    if doc_excerpt:
        parts.append(doc_excerpt)
    return " ".join(parts).strip() or "See the imported source and documentation for the solution."


def build_items(rows: list[dict]) -> tuple[list[dict], list[dict], list[dict]]:
    cards: list[dict] = []
    tasks: list[dict] = []
    skipped: list[dict] = []
    seen: dict[str, str] = {}

    for row in rows:
        name = clean_cell(row.get("name", ""))
        if not name:
            continue
        _, source_url = extract_link(row.get("source", ""))
        _, doc_url = extract_link(row.get("documentation", ""))
        source_path = find_existing_path(local_path_from_github_url(source_url), row, ".js")
        doc_path = find_existing_path(local_path_from_github_url(doc_url), row, ".md")
        if not doc_path and source_path:
            doc_path = find_existing_path(source_path.with_suffix(".md"), row, ".md")
        source_text = read_text(source_path)
        doc_text = read_text(doc_path)
        doc_excerpt = plain_excerpt(doc_text)
        topic_id = topic_for(row.get("area", ""), row.get("subtopic", ""))
        level = difficulty(row.get("level", "medium"))
        unique_key = re.sub(r"[^a-z0-9]+", " ", f"{row.get('area')} {row.get('subtopic')} {name}".lower()).strip()
        item_id = f"sudheerj-dsa-{topic_id.removeprefix('dsa-')}-{slugify(row.get('subtopic', 'topic'))}-{int(row.get('no', '0')):03d}-{slugify(name)[:50]}"

        if unique_key in seen:
            skipped.append({"duplicateOf": seen[unique_key], "name": name, "subtopic": row.get("subtopic")})
            continue
        seen[unique_key] = item_id

        source_rel = source_path.relative_to(SOURCE).as_posix() if source_path and source_path.exists() else None
        doc_rel = doc_path.relative_to(SOURCE).as_posix() if doc_path and doc_path.exists() else None
        answer = build_answer(row, doc_excerpt)
        tags = [
            "sudheerj",
            "dsa",
            slugify(row.get("area", "")),
            slugify(row.get("subtopic", "")),
            topic_id,
        ]

        cards.append(
            {
                "id": item_id,
                "source": {
                    "repo": "sudheerj/datastructures-algorithms",
                    "path": "README.md",
                    "sourcePath": source_rel,
                    "documentationPath": doc_rel,
                    "sourceUrl": source_url,
                    "documentationUrl": doc_url,
                },
                "topicId": topic_id,
                "subtopic": row.get("subtopic", ""),
                "difficulty": level,
                "question": {"en": f"How do you solve or implement `{name}`?"},
                "answer": {"en": answer},
                "explanation": {"en": doc_text or answer},
                "tags": tags,
            }
        )

        tasks.append(
            {
                "id": f"{item_id}-task",
                "source": {
                    "repo": "sudheerj/datastructures-algorithms",
                    "sourcePath": source_rel,
                    "documentationPath": doc_rel,
                    "sourceUrl": source_url,
                    "documentationUrl": doc_url,
                },
                "topicId": topic_id,
                "subtopic": row.get("subtopic", ""),
                "type": "implement",
                "difficulty": level,
                "title": {"en": name},
                "prompt": {"en": f"Implement `{name}` using the imported SudheerJ reference as the expected solution."},
                "code": source_text or None,
                "expectedAnswer": {"en": source_text or answer},
                "explanation": {"en": doc_text or answer},
                "tags": tags + ["coding-exercise"],
            }
        )

    return cards, tasks, skipped


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def copy_source() -> None:
    if COPIED_SOURCE.exists():
        shutil.rmtree(COPIED_SOURCE)
    shutil.copytree(SRC, COPIED_SOURCE)


def write_topic_files(cards: list[dict], tasks: list[dict], skipped: list[dict]) -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    files = []
    for topic_id, title in TOPICS.items():
        topic_cards = [item for item in cards if item["topicId"] == topic_id]
        topic_tasks = [item for item in tasks if item["topicId"] == topic_id]
        if not topic_cards and not topic_tasks:
            continue
        filename = f"{topic_id}.json"
        write_json(
            OUT / filename,
            {
                "topic": {"id": topic_id, "title": {"en": title}},
                "cards": topic_cards,
                "tasks": topic_tasks,
            },
        )
        files.append(filename)

    write_json(
        OUT / "index.json",
        {
            "source": {
                "repo": "sudheerj/datastructures-algorithms",
                "localPath": "external/sudheerj-datastructures-algorithms",
                "license": "MIT",
            },
            "topics": [{"id": topic_id, "title": {"en": title}} for topic_id, title in TOPICS.items()],
            "counts": {
                "cards": len(cards),
                "tasks": len(tasks),
                "skippedDuplicateItems": len(skipped),
            },
            "files": files,
        },
    )


def write_report(rows: list[dict], cards: list[dict], tasks: list[dict], skipped: list[dict]) -> None:
    MATERIAL.mkdir(parents=True, exist_ok=True)
    by_topic = defaultdict(int)
    docs = sum(1 for item in cards if item["source"].get("documentationPath"))
    source_files = sum(1 for item in tasks if item["source"].get("sourcePath"))
    for item in cards:
        by_topic[item["topicId"]] += 1

    lines = [
        "# SudheerJ DSA Import Report",
        "",
        "Source: `external/sudheerj-datastructures-algorithms`",
        "Repository: `sudheerj/datastructures-algorithms`",
        "License: MIT (`external/sudheerj-datastructures-algorithms/src/LICENSE.md`)",
        "",
        "The DSA material is imported as a separate dataset and does not replace the JavaScript interview cards.",
        "",
        "## Counts",
        "",
        f"- README table rows parsed: {len(rows)}",
        f"- Imported DSA cards: {len(cards)}",
        f"- Imported DSA implementation tasks: {len(tasks)}",
        f"- Items with local documentation: {docs}",
        f"- Items with local source code: {source_files}",
        f"- Skipped duplicate items: {len(skipped)}",
        "",
        "## Cards By Topic",
        "",
    ]
    for topic_id in TOPICS:
        lines.append(f"- `{topic_id}`: {by_topic[topic_id]}")
    lines += [
        "",
        "## Generated Files",
        "",
        "- `data/dsa/*.json`",
        "- `data/coding-exercise/sudheerj-dsa/**`",
        "",
        "## Duplicate Policy",
        "",
        "Duplicates are removed by normalized `(area, subtopic, name)` so similarly named tasks in different topics stay available.",
        "",
    ]
    (MATERIAL / "sudheerj-dsa-import-report.md").write_text("\n".join(lines) + "\n")


def validate(cards: list[dict], tasks: list[dict]) -> None:
    ids = [item["id"] for item in cards + tasks]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate ids in DSA import")
    for item in cards:
        if not item["question"]["en"] or not item["answer"]["en"] or not item["explanation"]["en"]:
            raise ValueError(f"Bad card: {item['id']}")
    for item in tasks:
        if not item["prompt"]["en"] or not item["expectedAnswer"]["en"] or not item["explanation"]["en"]:
            raise ValueError(f"Bad task: {item['id']}")


def main() -> None:
    rows = parse_readme_rows()
    cards, tasks, skipped = build_items(rows)
    validate(cards, tasks)
    copy_source()
    write_topic_files(cards, tasks, skipped)
    write_report(rows, cards, tasks, skipped)
    print(
        f"Imported {len(cards)} DSA cards and {len(tasks)} tasks from {len(rows)} README rows; "
        f"skipped {len(skipped)} duplicates"
    )


if __name__ == "__main__":
    main()
