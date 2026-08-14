from __future__ import annotations

import json
from pathlib import Path
from typing import Any
import sys
from datetime import datetime

TEMPLATES = Path("templates")
PROJECT_ROOT = Path.cwd()


def load_template(name: str) -> str:
    path = TEMPLATES / name
    if not path.exists():
        raise FileNotFoundError(f"テンプレートが見つかりません: {path}")
    return path.read_text(encoding="utf-8")


def append_article_index(meta: dict[str, Any]) -> None:
    path = PROJECT_ROOT / "data" / "articles.json"
    arr = json.loads(path.read_text(encoding="utf-8"))
    arr.append(meta)
    path.write_text(json.dumps(arr, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def generate(slug: str, title: str, summary: str) -> None:
    template = load_template("article_template.html")
    # minimal placeholder replacement
    content = f"<main><article><h1>{title}</h1><p>{summary}</p></article></main>"
    page_html = template.replace("{{TITLE}}", title).replace("{{DATE}}", datetime.now().strftime("%Y-%m-%d")).replace("{{CONTENT}}", content).replace("{{RELATED_JSON}}", "[]")
    out_dir = PROJECT_ROOT / "rankings" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "page-1.html").write_text(page_html, encoding="utf-8")
    append_article_index({"title": title, "url": f"rankings/{slug}/page-1.html", "description": summary})
    print("作成しました:", out_dir)


def main() -> int:
    if len(sys.argv) < 4:
        print("使い方: python make_article.py slug title summary")
        return 1
    _, slug, title, summary = sys.argv[:4]
    generate(slug, title, summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
