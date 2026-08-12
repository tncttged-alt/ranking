from pathlib import Path
import json
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "rankings" / "_template"
ARTICLES_FILE = ROOT / "data" / "articles.json"


def main():
    if len(sys.argv) < 4:
        print("使い方: python tools/new_ranking.py URLスラッグ 記事タイトル タイトル読み")
        print('例: python tools/new_ranking.py sample-work "サンプル作品 強さランキングTOP30" "さんぷるさくひん"')
        raise SystemExit(1)

    slug, title, title_kana = sys.argv[1:4]
    destination = ROOT / "rankings" / slug

    if destination.exists():
        raise SystemExit(f"作成先がすでに存在します: {destination}")

    shutil.copytree(TEMPLATE, destination)

    for html_file in destination.glob("page-*.html"):
        content = html_file.read_text(encoding="utf-8")
        content = content.replace("作品名 強さランキングTOP30", title)
        html_file.write_text(content, encoding="utf-8")

    articles = json.loads(ARTICLES_FILE.read_text(encoding="utf-8"))
    articles.append(
        {
            "title": title,
            "titleKana": title_kana,
            "url": f"rankings/{slug}/page-30-25.html",
            "description": "記事の説明を入力してください。",
            "views": {"all": 0, "month": 0, "week": 0},
        }
    )
    ARTICLES_FILE.write_text(
        json.dumps(articles, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"作成しました: {destination}")
    print("ranking-data.jsonと各HTMLの導入・評価基準を編集してください。")


if __name__ == "__main__":
    main()
