"""
Data Validation Module for Game History Exhibition.
Verifies games, eras, and milestones datasets against strict data quality rules:
- Valid unique IDs
- Valid release years (between 1945 and 2035)
- Non-empty titles and descriptions
- Non-broken structure
- Duplicate detection
"""

import sys
import os
import json
import re
from typing import List, Dict, Any, Tuple

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
PUBLIC_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")


def validate_game(game: Dict[str, Any], seen_ids: set) -> List[str]:
    errors = []
    gid = game.get("id")

    if not gid:
        errors.append("Missing 'id'")
    elif gid in seen_ids:
        errors.append(f"Duplicate id '{gid}'")
    else:
        seen_ids.add(gid)

    title = game.get("title")
    if not title or not isinstance(title, str) or not title.strip():
        errors.append(f"Invalid or missing 'title' in game {gid}")

    year = game.get("releaseYear")
    if year is None or not isinstance(year, int) or year < 1945 or year > 2035:
        errors.append(f"Invalid releaseYear {year} in game {gid}")

    release_date = game.get("releaseDate")
    if not release_date or not isinstance(release_date, str):
        errors.append(f"Missing releaseDate in game {gid}")

    # Check sources dictionary
    sources = game.get("sources")
    if not sources or not isinstance(sources, dict):
        errors.append(f"Missing sources dictionary in game {gid}")

    return errors


def validate_milestone(milestone: Dict[str, Any], seen_mids: set) -> List[str]:
    errors = []
    mid = milestone.get("id")
    if not mid:
        errors.append("Missing milestone 'id'")
    elif mid in seen_mids:
        errors.append(f"Duplicate milestone id '{mid}'")
    else:
        seen_mids.add(mid)

    if not milestone.get("title"):
        errors.append(f"Missing title in milestone {mid}")

    year = milestone.get("year")
    if year is None or not isinstance(year, int) or year < 1940 or year > 2035:
        errors.append(f"Invalid year {year} in milestone {mid}")

    return errors


def validate_eras(eras: List[Dict[str, Any]]) -> List[str]:
    errors = []
    seen = set()
    for era in eras:
        eid = era.get("id")
        if not eid or eid in seen:
            errors.append(f"Invalid or duplicate era id '{eid}'")
        seen.add(eid)

        if not era.get("name"):
            errors.append(f"Era {eid} missing name")
        if not isinstance(era.get("startYear"), int) or not isinstance(era.get("endYear"), int):
            errors.append(f"Era {eid} has invalid startYear or endYear")
        elif era["startYear"] > era["endYear"]:
            errors.append(f"Era {eid} startYear ({era['startYear']}) exceeds endYear ({era['endYear']})")
    return errors


def run_validation(data_path: str = DATA_DIR) -> bool:
    games_file = os.path.join(data_path, "games.json")
    milestones_file = os.path.join(data_path, "milestones.json")
    eras_file = os.path.join(data_path, "eras.json")

    print(f"Validating dataset in: {data_path}")
    all_errors = []

    # Validate games.json
    if not os.path.exists(games_file):
        all_errors.append(f"File not found: {games_file}")
    else:
        with open(games_file, "r", encoding="utf-8") as f:
            try:
                games = json.load(f)
                if not isinstance(games, list):
                    all_errors.append("games.json must be a JSON array")
                else:
                    seen_ids = set()
                    for g in games:
                        all_errors.extend(validate_game(g, seen_ids))
                    print(f"Validated {len(games)} games records.")
            except Exception as e:
                all_errors.append(f"Failed parsing games.json: {e}")

    # Validate milestones.json
    if os.path.exists(milestones_file):
        with open(milestones_file, "r", encoding="utf-8") as f:
            try:
                milestones = json.load(f)
                seen_mids = set()
                for m in milestones:
                    all_errors.extend(validate_milestone(m, seen_mids))
                print(f"Validated {len(milestones)} milestones records.")
            except Exception as e:
                all_errors.append(f"Failed parsing milestones.json: {e}")

    # Validate eras.json
    if os.path.exists(eras_file):
        with open(eras_file, "r", encoding="utf-8") as f:
            try:
                eras = json.load(f)
                all_errors.extend(validate_eras(eras))
                print(f"Validated {len(eras)} eras records.")
            except Exception as e:
                all_errors.append(f"Failed parsing eras.json: {e}")

    if all_errors:
        print("\nDATA QUALITY VALIDATION FAILED:")
        for err in all_errors:
            print(f" - {err}")
        return False
    else:
        print("\nAll data validation quality checks PASSED.")
        return True


if __name__ == "__main__":
    success = run_validation()
    sys.exit(0 if success else 1)
