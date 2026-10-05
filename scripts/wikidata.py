"""
Wikidata SPARQL Client for Game History Exhibition.
Queries the official Wikidata Query Service (https://query.wikidata.org/sparql)
to retrieve structured video game entities, properties, and relationships.
Includes caching, retry logic, and user-agent adherence.
"""

import os
import json
import time
import hashlib
import requests
from typing import Dict, Any, List, Optional

WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql"
USER_AGENT = "GameHistoryExhibitionBot/1.0 (https://github.com/game-history-exhibition; contact@gamehistory.local)"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", ".cache", "wikidata")

os.makedirs(CACHE_DIR, exist_ok=True)


def _get_cache_path(query: str) -> str:
    key = hashlib.sha256(query.encode("utf-8")).hexdigest()
    return os.path.join(CACHE_DIR, f"{key}.json")


def query_sparql(query: str, use_cache: bool = True) -> Dict[str, Any]:
    """Execute a SPARQL query against Wikidata with rate limiting and local caching."""
    cache_path = _get_cache_path(query)
    if use_cache and os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/sparql-results+json"
    }

    max_retries = 3
    backoff = 2
    for attempt in range(max_retries):
        try:
            response = requests.get(
                WIKIDATA_SPARQL_URL,
                params={"query": query, "format": "json"},
                headers=headers,
                timeout=45
            )
            if response.status_code == 200:
                data = response.json()
                with open(cache_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                # Respect rate limits
                time.sleep(1)
                return data
            elif response.status_code == 429:
                time.sleep(backoff)
                backoff *= 2
            else:
                response.raise_for_status()
        except requests.RequestException as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(backoff)
            backoff *= 2

    return {"results": {"bindings": []}}


def build_game_sparql_query(limit: int = 100) -> str:
    """Build SPARQL query to retrieve prominent video games with metadata."""
    return f"""
    SELECT DISTINCT ?game ?gameLabel ?pubDate ?developerLabel ?publisherLabel ?platformLabel ?genreLabel ?image ?enWiki WHERE {{
      ?game wdt:P31/wdt:P279* wd:Q7889 .       # Instance of video game
      ?game wdt:P577 ?pubDate .                 # Publication date
      OPTIONAL {{ ?game wdt:P178 ?developer . }} # Developer
      OPTIONAL {{ ?game wdt:P123 ?publisher . }} # Publisher
      OPTIONAL {{ ?game wdt:P400 ?platform . }}  # Platform
      OPTIONAL {{ ?game wdt:P136 ?genre . }}     # Genre
      OPTIONAL {{ ?game wdt:P18 ?image . }}      # Image
      OPTIONAL {{
        ?enWiki schema:about ?game ;
                schema:isPartOf <https://en.wikipedia.org/> .
      }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
    }}
    ORDER BY ?pubDate
    LIMIT {limit}
    """


def fetch_game_by_qid(qid: str, use_cache: bool = True) -> Optional[Dict[str, Any]]:
    """Query detailed metadata for an individual Wikidata entity ID (e.g. Q11168)."""
    query = f"""
    SELECT DISTINCT ?gameLabel ?pubDate ?developerLabel ?publisherLabel ?countryLabel ?platformLabel ?genreLabel ?seriesLabel ?image ?enWiki WHERE {{
      VALUES ?game {{ wd:{qid} }}
      OPTIONAL {{ ?game wdt:P577 ?pubDate . }}
      OPTIONAL {{ ?game wdt:P178 ?developer . }}
      OPTIONAL {{ ?game wdt:P123 ?publisher . }}
      OPTIONAL {{ ?game wdt:P495 ?country . }}
      OPTIONAL {{ ?game wdt:P400 ?platform . }}
      OPTIONAL {{ ?game wdt:P136 ?genre . }}
      OPTIONAL {{ ?game wdt:P179 ?series . }}
      OPTIONAL {{ ?game wdt:P18 ?image . }}
      OPTIONAL {{
        ?enWiki schema:about ?game ;
                schema:isPartOf <https://en.wikipedia.org/> .
      }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
    }}
    """
    data = query_sparql(query, use_cache=use_cache)
    bindings = data.get("results", {}).get("bindings", [])
    if not bindings:
        return None

    # Aggregate multi-value fields
    first = bindings[0]
    title = first.get("gameLabel", {}).get("value", qid)
    image = first.get("image", {}).get("value")
    en_wiki = first.get("enWiki", {}).get("value")
    country = first.get("countryLabel", {}).get("value")

    dates = set()
    developers = set()
    publishers = set()
    platforms = set()
    genres = set()
    series = set()

    for b in bindings:
        if "pubDate" in b:
            dates.add(b["pubDate"]["value"])
        if "developerLabel" in b:
            developers.add(b["developerLabel"]["value"])
        if "publisherLabel" in b:
            publishers.add(b["publisherLabel"]["value"])
        if "platformLabel" in b:
            platforms.add(b["platformLabel"]["value"])
        if "genreLabel" in b:
            genres.add(b["genreLabel"]["value"])
        if "seriesLabel" in b:
            series.add(b["seriesLabel"]["value"])

    sorted_dates = sorted(list(dates))
    earliest_date = sorted_dates[0] if sorted_dates else "Unknown"

    return {
        "id": qid,
        "title": title,
        "releaseDate": earliest_date.split("T")[0] if "T" in earliest_date else earliest_date,
        "dates": sorted_dates,
        "developers": sorted(list(developers)),
        "publishers": sorted(list(publishers)),
        "platforms": sorted(list(platforms)),
        "genres": sorted(list(genres)),
        "series": sorted(list(series)),
        "country": country,
        "imageUrl": image,
        "wikipediaUrl": en_wiki,
        "wikidataUrl": f"https://www.wikidata.org/wiki/{qid}"
    }
