"""
Wikimedia Commons API Client for Game History Exhibition.
Retrieves authentic file metadata, author attribution, and license details.
"""

import os
import json
import urllib.parse
import hashlib
import time
import requests
from typing import Dict, Any, Optional

WIKIMEDIA_API_URL = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "GameHistoryExhibitionBot/1.0 (https://github.com/game-history-exhibition; contact@gamehistory.local)"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", ".cache", "wikimedia")

os.makedirs(CACHE_DIR, exist_ok=True)


def _get_cache_path(filename: str) -> str:
    key = hashlib.sha256(filename.encode("utf-8")).hexdigest()
    return os.path.join(CACHE_DIR, f"{key}.json")


def fetch_commons_image_info(image_url_or_filename: str, use_cache: bool = True) -> Optional[Dict[str, Any]]:
    """Query Wikimedia Commons API for licensing, author, and direct image URL."""
    if not image_url_or_filename:
        return None

    # Extract filename from URL or Special:FilePath
    if "/" in image_url_or_filename:
        filename = image_url_or_filename.split("/")[-1]
    else:
        filename = image_url_or_filename

    filename = urllib.parse.unquote(filename)
    if not filename.startswith("File:"):
        filename = f"File:{filename}"

    cache_path = _get_cache_path(filename)
    if use_cache and os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    params = {
        "action": "query",
        "titles": filename,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|user|size",
        "format": "json"
    }
    headers = {"User-Agent": USER_AGENT}

    try:
        response = requests.get(WIKIMEDIA_API_URL, params=params, headers=headers, timeout=20)
        if response.status_code == 200:
            data = response.json()
            pages = data.get("query", {}).get("pages", {})
            for _, page in pages.items():
                imageinfo = page.get("imageinfo", [])
                if imageinfo:
                    info = imageinfo[0]
                    extmeta = info.get("extmetadata", {})
                    license_short = extmeta.get("LicenseShortName", {}).get("value", "Public Domain")
                    artist = extmeta.get("Artist", {}).get("value", "Unknown")
                    credit = extmeta.get("Credit", {}).get("value", artist)

                    result = {
                        "url": info.get("url"),
                        "descriptionUrl": info.get("descriptionurl"),
                        "license": license_short,
                        "credit": credit,
                        "artist": artist
                    }
                    with open(cache_path, "w", encoding="utf-8") as f:
                        json.dump(result, f, ensure_ascii=False, indent=2)
                    time.sleep(0.5)
                    return result
    except requests.RequestException:
        pass

    return None
