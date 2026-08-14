from __future__ import annotations

import json
import re
import shutil
import sys
import unicodedata
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any

INPUT_FILE_NAME = "input.txt"
ARTICLES_FILE = Path("data/articles.json")
RANKINGS_DIRECTORY = Path("rankings")
RESERVED_HEADINGS = {
    "タイトル",
    "概要",
    "URLスラッグ",
    "タイトル読み",
    "順位",
    "キャラ名",
    "評価",
}


def application_directory() -> Path:
    # Return the directory from which the user launched the tool.
    return Path.cwd()


def read_input_file(project_root: Path) -> str:
    input_path = project_root / INPUT_FILE_NAME
    if not input_path.exists():
        raise FileNotFoundError(
            f"{input_path} が見つかりません。EXEまたはスクリプトと同じカレントにinput.txtを置いてください。"
        )
    return input_path.read_text(encoding="utf-8-sig")


def parse_sections(text: str) -> list[tuple[str, str]]:
    # Parse heading blocks while preserving multiline values.
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    pattern = re.compile(r"^【([^】]+)】\s*$", re.MULTILINE)
    matches = list(pattern.finditer(normalized))
    sections: list[tuple[str, str]] = []

    for index, match in enumerate(matches):
        heading = match.group(1).strip()
        value_start = match.end()
        value_end = matches[index + 1].start() if index + 1 < len(matches) else len(normalized)
        value = normalized[value_start:value_end].strip()
        sections.append((heading, value))

    return sections


def normalize_score(value: str) -> str:
    return value.strip() or "未設定"


def parse_article(text: str) -> dict[str, Any]:
    sections = parse_sections(text)
    article: dict[str, Any] = {
        "title": "",
        "summary": "",
        "slug": "",
        "titleKana": "",
        "characters": [],
    }
    current_character: dict[str, Any] | None = None
    reading_character = False

    for heading, value in sections:
        if heading == "タイトル":
            article["title"] = value
            reading_character = False
        elif heading == "概要":
            article["summary"] = value
            reading_character = False
        elif heading == "URLスラッグ":
            article["slug"] = value
            reading_character = False
        elif heading == "タイトル読み":
            article["titleKana"] = value
            reading_character = False
        elif heading == "順位":
            if current_character is not None:
                article["characters"].append(current_character)
            try:
                rank = int(value.replace("位", "").strip())
            except ValueError as error:
                raise ValueError(f"順位は整数で入力してください: {value}") from error
            current_character = {
                "rank": rank,
                "name": "",
                "statuses": {},
                "evaluation": "",
            }
            reading_character = True
        elif heading == "キャラ名":
            if current_character is None:
                raise ValueError("【キャラ名】より前に【順位】が必要です。")
            current_character["name"] = value
            reading_character = True
        elif heading == "評価":
            if current_character is None:
                raise ValueError("【評価】より前に【順位】と【キャラ名】が必要です。")
            current_character["evaluation"] = value
            reading_character = False
        elif reading_character and current_character is not None and heading not in RESERVED_HEADINGS:
            current_character["statuses"][heading] = normalize_score(value)

    if current_character is not None:
        article["characters"].append(current_character)

    validate_article(article)
    article["characters"].sort(key=lambda character: character["rank"], reverse=True)
    return article


def validate_article(article: dict[str, Any]) -> None:
    if not article["title"]:
        raise ValueError("【タイトル】が未入力です。")
    if not article["summary"]:
        raise ValueError("【概要】が未入力です。")
    if not article["characters"]:
        raise ValueError("キャラクターが1件もありません。")

    ranks: set[int] = set()
    for character in article["characters"]:
        if not character["name"]:
            raise ValueError(f"{character['rank']}位の【キャラ名】が未入力です。")
        if not character["evaluation"]:
            raise ValueError(f"{character['rank']}位の【評価】が未入力です。")
        if character["rank"] in ranks:
            raise ValueError(f"順位が重複しています: {character['rank']}位")
        ranks.add(character["rank"])


def sanitize_slug(raw_slug: str) -> str:
    normalized = unicodedata.normalize("NFKC", raw_slug).lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    if slug:
        return slug
    return f"ranking-{datetime.now().strftime('%Y%m%d-%H%M%S')}"


def split_into_pages(characters: list[dict[str, Any]], page_size: int = 6) -> list[list[dict[str, Any]]]:
    return [characters[index:index + page_size] for index in range(0, len(characters), page_size)]


def create_menu(root_path: str) -> str:
    return f'''<header class="header">
  <button id="menuBtn" class="menuBtn" aria-label="メニューを開く" aria-expanded="false">☰</button>
  <a class="brand" href="{root_path}index.html">ランキングデータベース</a>
</header>
<div id="overlay" class="overlay"></div>
<aside id="drawer" class="drawer" aria-label="サイトメニュー">
  <div class="drawerHeader">
    <h2>メニュー</h2>
    <button id="close" class="close" aria-label="メニューを閉じる">×</button>
  </div>
  <nav class="drawerNav">
    <a href="{root_path}index.html">タイトルに戻る</a>
    <a href="{root_path}articles.html">記事一覧</a>
  </nav>
  <h3>週間ランキング上位の記事</h3>
  <div id="weekly" class="weeklyLinks"></div>
</aside>'''


def build_page(
    article: dict[str, Any],
    page: list[dict[str, Any]],
    page_index: int,
    pages: list[list[dict[str, Any]]],
    file_names: list[str],
) -> str:
    start_rank = page[0]["rank"]
    end_rank = page[-1]["rank"]
    navigation = "".join(
        f'<a class="{"active" if index == page_index else ""}" href="{name}">{part[0]["rank"]}～{part[-1]["rank"]}位</a>'
        for index, (name, part) in enumerate(zip(file_names, pages))
    )

    if page_index == len(pages) - 1:
        summary_items = "".join(
            f'<li>{character["rank"]}位 {escape(character["name"])}</li>'
            for character in sorted(article["characters"], key=lambda item: item["rank"])
        )
        ending = f'<section class="summary"><h2>順位まとめ</h2><ol>{summary_items}</ol></section>'
    else:
        ending = f'''<div class="guide"><b>順位まとめは最終ページで公開します。</b><p>最後まで読み進めると全順位を確認できます。</p><a href="{file_names[-1]}">最終ページへ</a></div>'''

    title = escape(article["title"])
    summary = escape(article["summary"])
    return f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title}｜ランキングデータベース</title>
  <meta name="description" content="{summary}">
  <link rel="stylesheet" href="../../assets/style.css">
</head>
<body data-root="../../" data-page-index="{page_index}">
  {create_menu('../../')}
  <main class="main">
    <article class="article">
      <h1>{title}</h1>
      <p>{summary}</p>
      <h2>{start_rank}位～{end_rank}位</h2>
      <div id="rankingList"></div>
      <nav class="pages" aria-label="ランキングページ">{navigation}</nav>
      {ending}
    </article>
  </main>
  <footer class="footer">© Ranking Database</footer>
  <script src="../../assets/menu.js"></script>
  <script src="ranking.js"></script>
</body>
</html>
'''


def create_ranking_script() -> str:
    return '''const rankingList = document.querySelector("#rankingList");
const pageIndex = Number(document.body.dataset.pageIndex);

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function createStatus(statusName, statusValue) {
  return `
    <span class="score">
      ${escapeHtml(statusName)}: ${escapeHtml(statusValue)}
    </span>
  `;
}

function createRankingItem(character) {
  const statuses = Object.entries(character.statuses)
    .map(([name, value]) => createStatus(name, value))
    .join("");

  return `
    <section class="rank">
      <h3>
        <span class="num">${character.rank}位</span>
        ${escapeHtml(character.name)}
      </h3>
      <div class="scores">${statuses}</div>
      <p>${escapeHtml(character.evaluation).replaceAll("\\n", "<br>")}</p>
    </section>
  `;
}

fetch("ranking-data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`ランキングデータを取得できませんでした: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const currentPage = data.pages[pageIndex] || [];
    rankingList.innerHTML = currentPage.map(createRankingItem).join("");
  })
  .catch((error) => {
    console.error(error);
    rankingList.innerHTML = "<p>ランキングを読み込めませんでした。</p>";
  });
'''


def register_article(project_root: Path, article: dict[str, Any], slug: str, first_page: str) -> None:
    articles_path = project_root / ARTICLES_FILE
    articles = json.loads(articles_path.read_text(encoding="utf-8"))
    url = f"rankings/{slug}/{first_page}"

    if any(item.get("url") == url for item in articles):
        raise ValueError(f"記事一覧に同じURLが登録済みです: {url}")

    articles.append(
        {
            "title": article["title"],
            "titleKana": article["titleKana"] or article["title"],
            "url": url,
            "description": article["summary"],
            "views": {"all": 0, "month": 0, "week": 0},
        }
    )
    articles_path.write_text(
        json.dumps(articles, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def create_article(project_root: Path, article: dict[str, Any]) -> Path:
    slug = sanitize_slug(article["slug"])
    article_directory = project_root / RANKINGS_DIRECTORY / slug
    if article_directory.exists():
        raise FileExistsError(f"出力先がすでに存在します: {article_directory}")

    pages = split_into_pages(article["characters"])
    file_names = [f"page-{page[0]['rank']}-{page[-1]['rank']}.html" for page in pages]
    article_directory.mkdir(parents=True)

    output_data = {
        "title": article["title"],
        "summary": article["summary"],
        "slug": slug,
        "pages": pages,
    }
    (article_directory / "ranking-data.json").write_text(
        json.dumps(output_data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (article_directory / "ranking.js").write_text(create_ranking_script(), encoding="utf-8")

    for index, page in enumerate(pages):
        html = build_page(article, page, index, pages, file_names)
        (article_directory / file_names[index]).write_text(html, encoding="utf-8")

    register_article(project_root, article, slug, file_names[0])
    return article_directory


def pause_on_windows() -> None:
    if sys.platform == "win32":
        input("Enterキーで終了します...")


def main() -> int:
    project_root = application_directory()
    try:
        text = read_input_file(project_root)
        article = parse_article(text)
        output_directory = create_article(project_root, article)
        print("記事を作成しました。")
        print(f"出力先: {output_directory}")
        print("data/articles.jsonにも記事を登録しました。")
        pause_on_windows()
        return 0
    except Exception as error:
        print(f"エラー: {error}", file=sys.stderr)
        pause_on_windows()
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
