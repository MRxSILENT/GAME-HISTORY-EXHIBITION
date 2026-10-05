"""
Game Fetcher Orchestrator for Game History Exhibition.
Queries Wikidata SPARQL, enriches each entity with Wikipedia article extracts
and Wikimedia Commons licensing metadata, and returns unified records.
"""

import sys
import os
import json
import time
from typing import List, Dict, Any

from wikidata import fetch_game_by_qid, query_sparql, build_game_sparql_query
from wikipedia import fetch_wikipedia_summary
from wikimedia import fetch_commons_image_info
from normalize import normalize_record


# Primary historical games anchor list (Wikidata QIDs)
CORE_LANDMARK_QIDS = [
    "Q2631916",   # Bertie the Brain (1950)
    "Q1064273",   # Nimrod (1951)
    "Q240683",    # Tennis for Two (1958)
    "Q234479",    # Spacewar! (1962)
    "Q1122268",   # Computer Space (1971)
    "Q216293",    # Pong (1972)
    "Q725654",    # Space Invaders (1978)
    "Q52815",     # Pac-Man (1980)
    "Q6399",      # Donkey Kong (1981)
    "Q564403",    # Tetris (1984)
    "Q11168",     # Super Mario Bros. (1985)
    "Q12384",     # The Legend of Zelda (1986)
    "Q12398",     # Metroid (1986)
    "Q18482",     # Sonic the Hedgehog (1991)
    "Q72488",     # Street Fighter II (1991)
    "Q206121",    # Doom (1993)
    "Q213912",    # Chrono Trigger (1995)
    "Q214170",    # Super Mario 64 (1996)
    "Q214172",    # Final Fantasy VII (1997)
    "Q214174",    # The Legend of Zelda: Ocarina of Time (1998)
    "Q279446",    # Half-Life (1998)
    "Q193630",    # Halo: Combat Evolved (2001)
    "Q14920",     # Grand Theft Auto III (2001)
    "Q131501",    # World of Warcraft (2004)
    "Q22998",     # Minecraft (2011)
    "Q170624",    # Dark Souls (2011)
    "Q171457",    # The Legend of Zelda: Breath of the Wild (2017)
    "Q106317440", # Elden Ring (2022)
    "Q63983137",  # Baldur's Gate 3 (2023)
    "Q125586940", # Black Myth: Wukong (2024)
    "Q110822602", # Grand Theft Auto VI (2026)
]


def fetch_and_enrich_game(qid: str) -> Dict[str, Any]:
    """Fetch Wikidata entity, enrich with Wikipedia summary and Wikimedia license."""
    print(f"Fetching entity {qid} from Wikidata...")
    wiki_data = fetch_game_by_qid(qid)
    if not wiki_data:
        raise ValueError(f"Could not retrieve entity {qid}")

    # Enrich from Wikipedia
    wp_url = wiki_data.get("wikipediaUrl")
    if wp_url:
        print(f"  Enriching from Wikipedia: {wp_url}")
        summary = fetch_wikipedia_summary(wp_url)
        if summary:
            if not wiki_data.get("description") or wiki_data.get("description") == "Historical video game entry.":
                wiki_data["description"] = summary.get("extract") or summary.get("description")
            if summary.get("thumbnail") and not wiki_data.get("imageUrl"):
                wiki_data["imageUrl"] = summary.get("thumbnail")

    # Enrich image licensing from Wikimedia Commons
    img_url = wiki_data.get("imageUrl")
    if img_url:
        print(f"  Verifying media licensing on Wikimedia Commons...")
        img_info = fetch_commons_image_info(img_url)
        if img_info:
            wiki_data["imageUrl"] = img_info.get("url") or wiki_data["imageUrl"]
            wiki_data["imageCredit"] = img_info.get("credit")
            wiki_data["imageLicense"] = img_info.get("license")

    return normalize_record(wiki_data)


def fetch_all_core_games() -> List[Dict[str, Any]]:
    """Fetch all landmark games with rate limiting."""
    results = []
    for qid in CORE_LANDMARK_QIDS:
        try:
            game = fetch_and_enrich_game(qid)
            results.append(game)
            time.sleep(0.3)
        except Exception as e:
            print(f"Warning: Failed to fetch {qid}: {e}")
    return results


if __name__ == "__main__":
    games = fetch_all_core_games()
    print(f"Successfully fetched and normalized {len(games)} games.")
