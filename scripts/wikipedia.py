"""
Wikipedia REST API Client for Game History Exhibition.
Retrieves article lead extracts and descriptions without scraping HTML pages.
"""

import os
import json
import urllib.parse
import hashlib
import time
import requests
from typing import Dict, Any, Optional

WIKIPEDIA_API_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary"
USER_AGENT = "GameHistoryExhibitionBot/1.0 (https://github.com/game-history-exhibition; contact@gamehistory.local)"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", ".cache", "wikipedia")

os.makedirs(CACHE_DIR, exist_ok=True)


def _get_cache_path(title: str) -> str:
    key = hashlib.sha256(title.encode("utf-8")).hexdigest()
    return os.path.join(CACHE_DIR, f"{key}.json")


def fetch_wikipedia_summary(article_title_or_url: str, use_cache: bool = True) -> Optional[Dict[str, Any]]:
    """Retrieve structured summary from English Wikipedia REST API."""
    if not article_title_or_url:
        return None

    # Extract title from full URL if needed
    if "wikipedia.org/wiki/" in article_title_or_url:
        title = article_title_or_url.split("wikipedia.org/wiki/")[-1]
    else:
        title = article_title_or_url

    title = urllib.parse.unquote(title)
    encoded_title = urllib.parse.quote(title)

    cache_path = _get_cache_path(title)
    if use_cache and os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    url = f"{WIKIPEDIA_API_BASE}/{encoded_title}"
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}

    try:
        response = requests.get(url, headers=headers, timeout=20)
        if response.status_code == 200:
            data = response.json()
            result = {
                "title": data.get("title"),
                "extract": data.get("extract", ""),
                "description": data.get("description", ""),
                "thumbnail": data.get("thumbnail", {}).get("source"),
                "pageUrl": data.get("content_urls", {}).get("desktop", {}).get("page")
            }
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            time.sleep(0.5)
            return result
    except requests.RequestException:
        pass

    return None
