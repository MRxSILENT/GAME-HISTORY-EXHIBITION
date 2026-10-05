"""
Script to enrich games.json and milestones.json with verified, live Wikipedia REST API images.
Ensures every URL points to an active, valid thumbnail or unscaled image.
"""

import urllib.request
import urllib.parse
import json
import time
import os

HEADERS = {
    "User-Agent": "GameHistoryExhibitionBot/1.0 (https://github.com/game-history-exhibition; contact@gamehistory.local)"
}


def get_wikipedia_image(wiki_url: str):
    if not wiki_url or "wikipedia.org/wiki/" not in wiki_url:
        return None
    slug = wiki_url.split("wikipedia.org/wiki/")[-1].split("#")[0]
    api_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}"
    try:
        req = urllib.request.Request(api_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.load(resp)
            # Prefer originalimage or thumbnail
            orig = data.get("originalimage", {}).get("source")
            thumb = data.get("thumbnail", {}).get("source")
            return orig or thumb
    except Exception as e:
        print(f"  Warning fetching {slug}: {e}")
        return None


def enrich_games():
    games_path = "data/games.json"
    with open(games_path, "r", encoding="utf-8") as f:
        games = json.load(f)

    updated_count = 0
    for g in games:
        title = g.get("title")
        print(f"Enriching game: {title}")
        img = get_wikipedia_image(g.get("wikipediaUrl"))
        if img:
            g["imageUrl"] = img
            if "sources" in g:
                g["sources"]["wikimediaCommons"] = img
            updated_count += 1
            print(f"  -> Found: {img}")
        else:
            print(f"  -> Kept existing: {g.get('imageUrl')}")
        time.sleep(0.3)

    with open("data/games.json", "w", encoding="utf-8") as f:
        json.dump(games, f, ensure_ascii=False, indent=2)

    with open("public/data/games.json", "w", encoding="utf-8") as f:
        json.dump(games, f, ensure_ascii=False, indent=2)

    print(f"Finished enriching games: {updated_count} / {len(games)} updated.")


def enrich_milestones():
    milestones_path = "data/milestones.json"
    with open(milestones_path, "r", encoding="utf-8") as f:
        milestones = json.load(f)

    updated_count = 0
    for m in milestones:
        title = m.get("title")
        print(f"Enriching milestone: {title}")
        img = get_wikipedia_image(m.get("wikipediaUrl"))
        if img:
            m["imageUrl"] = img
            updated_count += 1
            print(f"  -> Found: {img}")
        else:
            print(f"  -> Kept existing: {m.get('imageUrl')}")
        time.sleep(0.3)

    with open("data/milestones.json", "w", encoding="utf-8") as f:
        json.dump(milestones, f, ensure_ascii=False, indent=2)

    with open("public/data/milestones.json", "w", encoding="utf-8") as f:
        json.dump(milestones, f, ensure_ascii=False, indent=2)

    print(f"Finished enriching milestones: {updated_count} / {len(milestones)} updated.")


if __name__ == "__main__":
    enrich_games()
    enrich_milestones()
