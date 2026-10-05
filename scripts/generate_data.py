"""
Main Data Generation Pipeline for Game History Exhibition.
Executes data collection, normalization, validation, and writes updated JSON outputs
to both data/ and public/data/ directories.
"""

import sys
import os
import json
import argparse
from typing import List, Dict, Any

from normalize import normalize_record
from validate_data import run_validation

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
PUBLIC_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")


def generate(live_fetch: bool = False):
    games_path = os.path.join(DATA_DIR, "games.json")
    print("=" * 60)
    print("GAME HISTORY EXHIBITION — DATA PIPELINE")
    print("=" * 60)

    if not os.path.exists(games_path):
        print(f"Error: {games_path} not found.")
        sys.exit(1)

    with open(games_path, "r", encoding="utf-8") as f:
        existing_games = json.load(f)

    print(f"Loaded {len(existing_games)} existing records from {games_path}.")

    if live_fetch:
        print("Live fetch flag enabled. Querying Wikidata SPARQL & Wikimedia APIs...")
        try:
            from fetch_games import fetch_all_core_games
            fetched = fetch_all_core_games()
            # Merge while preserving curated fields
            by_id = {g["id"]: g for g in existing_games}
            for new_g in fetched:
                if new_g["id"] in by_id:
                    # Update with latest API dates/sources without overwriting curated descriptions
                    old = by_id[new_g["id"]]
                    old["sources"] = new_g["sources"]
                    old["lastUpdated"] = new_g["lastUpdated"]
                else:
                    existing_games.append(new_g)
        except Exception as e:
            print(f"Live fetch error: {e}. Falling back to normalizing existing dataset.")

    # Normalize all records
    normalized_games = []
    seen_ids = set()
    for g in existing_games:
        if g.get("id") in seen_ids:
            continue
        seen_ids.add(g.get("id"))
        normalized_games.append(normalize_record(g))

    # Sort chronologically
    normalized_games.sort(key=lambda x: (x.get("releaseYear", 0), x.get("releaseDate", "")))

    # Write to data/games.json
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(os.path.join(DATA_DIR, "games.json"), "w", encoding="utf-8") as f:
        json.dump(normalized_games, f, ensure_ascii=False, indent=2)

    # Write to public/data/games.json
    os.makedirs(PUBLIC_DATA_DIR, exist_ok=True)
    with open(os.path.join(PUBLIC_DATA_DIR, "games.json"), "w", encoding="utf-8") as f:
        json.dump(normalized_games, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(normalized_games)} normalized records to data/ and public/data/.")

    # Run validation
    print("\nRunning verification test suite...")
    valid = run_validation(DATA_DIR)
    if not valid:
        print("Pipeline aborted: Data validation failed.")
        sys.exit(1)

    print("\nPipeline completed successfully!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Game History Exhibition dataset.")
    parser.add_argument("--live", action="store_true", help="Fetch live data from Wikidata & Wikimedia APIs")
    args = parser.parse_args()
    generate(live_fetch=args.live)
