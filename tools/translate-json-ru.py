#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
CACHE_PATH = ROOT / ".cache" / "translation-en-ru.json"
DATA_DIRS = [ROOT / "data" / "cards", ROOT / "data" / "dsa"]

TEXT_FIELDS = {
    "question",
    "answer",
    "explanation",
    "title",
    "prompt",
    "expectedAnswer",
}

PLACEHOLDER_PREFIX = "ZXQPH"
PLACEHOLDER_SUFFIX = "QXZ"


def load_cache() -> dict[str, str]:
    if not CACHE_PATH.exists():
        return {}
    return json.loads(CACHE_PATH.read_text())


def save_cache(cache: dict[str, str]) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n")


def cache_key(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def is_code_like(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return False
    if len(stripped) > 250 and re.search(r"\b(function|const|let|var|class|import|export|return)\b", stripped):
        code_marks = len(re.findall(r"[{}();=>]", stripped))
        return code_marks / max(len(stripped), 1) > 0.018
    return False


def protect_markdown(text: str) -> tuple[str, dict[str, str]]:
    protected: dict[str, str] = {}

    def stash(match: re.Match[str]) -> str:
        token = f"{PLACEHOLDER_PREFIX}{len(protected):05d}{PLACEHOLDER_SUFFIX}"
        protected[token] = match.group(0)
        return token

    patterns = [
        r"```[\s\S]*?```",
        r"`[^`\n]+`",
        r"https?://[^\s)]+",
    ]
    result = text
    for pattern in patterns:
        result = re.sub(pattern, stash, result)
    return result, protected


def restore_markdown(text: str, protected: dict[str, str]) -> str:
    result = text
    for token, value in protected.items():
        loose = r"\s*".join(map(re.escape, token))
        result = re.sub(loose, value, result, flags=re.I)
        result = result.replace(token, value)
    return result


def split_text(text: str, limit: int = 4300) -> list[str]:
    if len(text) <= limit:
        return [text]

    chunks: list[str] = []
    current = ""
    parts = re.split(r"(\n{2,})", text)
    for part in parts:
        if len(part) > limit:
            sentences = re.split(r"(?<=[.!?])\s+", part)
            for sentence in sentences:
                if len(current) + len(sentence) + 1 > limit and current:
                    chunks.append(current)
                    current = ""
                if len(sentence) > limit:
                    for i in range(0, len(sentence), limit):
                        if current:
                            chunks.append(current)
                            current = ""
                        chunks.append(sentence[i : i + limit])
                else:
                    current += ("" if not current else " ") + sentence
            continue
        if len(current) + len(part) > limit and current:
            chunks.append(current)
            current = part
        else:
            current += part
    if current:
        chunks.append(current)
    return chunks


def google_translate_chunk(text: str, retries: int = 4) -> str:
    params = urlencode(
        {
            "client": "gtx",
            "sl": "en",
            "tl": "ru",
            "dt": "t",
            "q": text,
        }
    )
    url = f"https://translate.googleapis.com/translate_a/single?{params}"
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            with urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
            return "".join(part[0] for part in payload[0] if part and part[0])
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Translation failed: {last_error}")


def translate_text(text: str, cache: dict[str, str]) -> str:
    if not text.strip():
        return text
    if is_code_like(text):
        return text

    key = cache_key(text)
    if key in cache:
        return cache[key]

    protected_text, protected = protect_markdown(text)
    translated_chunks = []
    for chunk in split_text(protected_text):
        translated_chunks.append(google_translate_chunk(chunk))
        time.sleep(0.08)
    translated = restore_markdown("".join(translated_chunks), protected)
    cache[key] = translated
    save_cache(cache)
    return translated


def translate_localized(value: object, cache: dict[str, str], force: bool) -> bool:
    if not isinstance(value, dict):
        return False
    en = value.get("en")
    if not isinstance(en, str) or not en.strip():
        return False
    if value.get("ru") and not force:
        return False
    value["ru"] = translate_text(en, cache)
    return True


def walk_json(value: object, cache: dict[str, str], force: bool) -> int:
    changed = 0
    if isinstance(value, dict):
        for key, child in value.items():
            if key in TEXT_FIELDS:
                changed += int(translate_localized(child, cache, force))
            else:
                changed += walk_json(child, cache, force)
    elif isinstance(value, list):
        for item in value:
            changed += walk_json(item, cache, force)
    return changed


def item_needs_translation(item: object, force: bool) -> bool:
    if not isinstance(item, dict):
        return False
    for key in TEXT_FIELDS:
        value = item.get(key)
        if not isinstance(value, dict):
            continue
        en = value.get("en")
        if isinstance(en, str) and en.strip() and (force or not value.get("ru")):
            return True
    return False


def translate_file(path: Path, cache: dict[str, str], force: bool, max_items: int | None) -> tuple[int, int]:
    data = json.loads(path.read_text())
    changed_fields = 0
    changed_items = 0

    if max_items is None:
        changed_fields = walk_json(data, cache, force)
        if changed_fields:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        return changed_fields, changed_items

    if isinstance(data, dict):
        changed_fields += walk_json(data.get("topic"), cache, force)
        for section in ("topics",):
            changed_fields += walk_json(data.get(section), cache, force)

        for collection_name in ("cards", "tasks"):
            collection = data.get(collection_name)
            if not isinstance(collection, list):
                continue
            for item in collection:
                if changed_items >= max_items:
                    break
                if not item_needs_translation(item, force):
                    continue
                changed_fields += walk_json(item, cache, force)
                changed_items += 1
                path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
            if changed_items >= max_items:
                break

    if changed_fields:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    return changed_fields, changed_items


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Overwrite existing ru fields")
    parser.add_argument("--max-items", type=int, default=None, help="Translate at most N cards/tasks that still miss ru fields")
    args = parser.parse_args()

    cache = load_cache()
    total_fields = 0
    total_items = 0
    files = [path for directory in DATA_DIRS for path in sorted(directory.glob("*.json"))]
    for index, path in enumerate(files, 1):
        remaining = None if args.max_items is None else max(args.max_items - total_items, 0)
        if remaining == 0:
            break
        changed_fields, changed_items = translate_file(path, cache, args.force, remaining)
        total_fields += changed_fields
        total_items += changed_items
        save_cache(cache)
        print(
            f"[{index}/{len(files)}] {path.relative_to(ROOT)}: "
            f"{changed_fields} fields, {changed_items} items"
        )
    print(f"Translated/filled {total_fields} fields in {total_items} items. Cache entries: {len(cache)}")


if __name__ == "__main__":
    main()
