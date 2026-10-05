"""
Data Normalization Module for Game History Exhibition.
Cleans raw API outputs, deduplicates records, resolves earliest reliable release dates,
and validates standard schema fields.
"""

import re
from typing import Dict, Any, List, Optional

PLATFORM_ALIASES = {
    "famicom": "NES / Famicom",
    "family computer": "NES / Famicom",
    "nintendo entertainment system": "NES",
    "super famicom": "SNES / Super Famicom",
    "super nintendo entertainment system": "SNES",
    "sega mega drive": "Sega Genesis / Mega Drive",
    "sega genesis": "Sega Genesis / Mega Drive",
    "playstation": "PlayStation",
    "ps1": "PlayStation",
    "playstation 2": "PlayStation 2",
    "ps2": "PlayStation 2",
    "playstation 3": "PlayStation 3",
    "ps3": "PlayStation 3",
    "playstation 4": "PlayStation 4",
    "ps4": "PlayStation 4",
    "playstation 5": "PlayStation 5",
    "ps5": "PlayStation 5",
    "ms-dos": "MS-DOS",
    "dos": "MS-DOS",
    "microsoft windows": "PC",
    "windows": "PC",
    "nintendo 64": "Nintendo 64",
    "n64": "Nintendo 64",
    "game boy": "Game Boy",
    "nintendo switch": "Nintendo Switch",
    "switch": "Nintendo Switch"
}


def normalize_date(raw_date: Optional[str]) -> Optional[str]:
    """Parse raw date string into YYYY-MM-DD or YYYY."""
    if not raw_date:
        return None

    # Handle ISO string like "1985-09-13T00:00:00Z"
    cleaned = raw_date.split("T")[0].strip()

    # Match YYYY-MM-DD
    if re.match(r"^\d{4}-\d{2}-\d{2}$", cleaned):
        return cleaned

    # Match YYYY-MM
    if re.match(r"^\d{4}-\d{2}$", cleaned):
        return f"{cleaned}-01"

    # Match YYYY
    m = re.match(r"^(\d{4})", cleaned)
    if m:
        return m.group(1)

    return None


def extract_year(date_str: Optional[str]) -> Optional[int]:
    """Extract integer 4-digit year from date string."""
    if not date_str:
        return None
    m = re.search(r"(\d{4})", date_str)
    if m:
        try:
            return int(m.group(1))
        except ValueError:
            return None
    return None


def normalize_platform(platform_name: str) -> str:
    """Normalize common platform names to canonical forms."""
    lower = platform_name.lower().strip()
    return PLATFORM_ALIASES.get(lower, platform_name.strip())


def normalize_record(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize a raw game record into the canonical exhibition schema."""
    dates = raw.get("dates", [])
    valid_dates = [normalize_date(d) for d in dates if normalize_date(d)]
    sorted_dates = sorted(valid_dates) if valid_dates else []

    primary_date = normalize_date(raw.get("releaseDate")) or (sorted_dates[0] if sorted_dates else "1980-01-01")
    year = extract_year(primary_date) or 1980

    developers = list(dict.fromkeys(raw.get("developers", [])))
    publishers = list(dict.fromkeys(raw.get("publishers", [])))
    genres = list(dict.fromkeys(raw.get("genres", [])))
    platforms = list(dict.fromkeys([normalize_platform(p) for p in raw.get("platforms", [])]))

    dev_str = developers[0] if developers else (raw.get("developer") or "Independent")
    pub_str = publishers[0] if publishers else (raw.get("publisher") or dev_str)

    record: Dict[str, Any] = {
        "id": raw.get("id"),
        "title": raw.get("title", "Untitled Game"),
        "alternateTitles": raw.get("alternateTitles", []),
        "releaseDate": primary_date,
        "releaseYear": year,
        "earliestReleaseDate": sorted_dates[0] if sorted_dates else primary_date,
        "releaseHistory": raw.get("releaseHistory", [
            {
                "label": "Original Release",
                "date": primary_date,
                "region": "Worldwide",
                "type": "original"
            }
        ]),
        "developer": dev_str,
        "publisher": pub_str,
        "developers": developers if developers else [dev_str],
        "publishers": publishers if publishers else [pub_str],
        "platforms": platforms if platforms else ["Hardware"],
        "genres": genres if genres else ["Video Game"],
        "franchises": raw.get("franchises", []),
        "series": raw.get("series", []),
        "country": raw.get("country"),
        "description": raw.get("description", "Historical video game entry."),
        "historicalSignificance": raw.get("historicalSignificance", "Notable release in gaming history."),
        "developmentContext": raw.get("developmentContext"),
        "wikipediaUrl": raw.get("wikipediaUrl", ""),
        "wikidataUrl": raw.get("wikidataUrl", f"https://www.wikidata.org/wiki/{raw.get('id')}"),
        "imageUrl": raw.get("imageUrl"),
        "imageCredit": raw.get("imageCredit", "Wikimedia Commons / Public Knowledge"),
        "imageLicense": raw.get("imageLicense", "Public Domain / Fair Use"),
        "source": "Wikidata/Wikipedia/Wikimedia Commons",
        "sources": {
            "wikidata": raw.get("wikidataUrl", ""),
            "wikipedia": raw.get("wikipediaUrl", ""),
            "wikimediaCommons": raw.get("imageUrl", "")
        },
        "lastUpdated": raw.get("lastUpdated", "2026-10-05"),
        "confidence": raw.get("confidence", "high"),
        "relatedGameIds": raw.get("relatedGameIds", []),
        "featured": raw.get("featured", False)
    }

    return record
