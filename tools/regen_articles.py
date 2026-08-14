from pathlib import Path
import json
import sys

# Import functions from create_article.py
from create_article import RANKINGS_DIRECTORY, create_ranking_script, build_page

ROOT = Path.cwd()
RANKINGS = ROOT / RANKINGS_DIRECTORY


def regen_all():
    if not RANKINGS.exists():
        print("No rankings directory found.")
        return 1
    for sub in RANKINGS.iterdir():
        if not sub.is_dir():
            continue
        data_file = sub / 'ranking-data.json'
        if not data_file.exists():
            continue
        print(f"Regenerating: {sub}")
        data = json.loads(data_file.read_text(encoding='utf-8'))
        pages = data.get('pages', [])
        if not pages:
            continue
        file_names = [f"page-{p[0]['rank']}-{p[-1]['rank']}.html" for p in pages]
        # Reconstruct article shape expected by build_page
        characters = []
        for p in pages:
            characters.extend(p)
        article = {
            'title': data.get('title', ''),
            'summary': data.get('summary', ''),
            'characters': characters,
        }
        # Write ranking.js
        (sub / 'ranking.js').write_text(create_ranking_script(), encoding='utf-8')
        # Write pages
        for idx, page in enumerate(pages):
            html = build_page(article, page, idx, pages, file_names)
            (sub / file_names[idx]).write_text(html, encoding='utf-8')
    return 0


if __name__ == '__main__':
    sys.exit(regen_all())
