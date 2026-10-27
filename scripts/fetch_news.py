"""Busca manchetes recentes por tema e salva em data/news.json.

Fonte padrão: Google News RSS (não precisa de chave).
Se a variável de ambiente NEWSAPI_KEY existir, usa a NewsAPI.
"""

import json
import os
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import quote_plus

import requests

# Edite aqui os temas e as buscas de cada um
TOPICS = {
    "Jiu-Jitsu": '"jiu-jitsu" OR "jiu jitsu" OR "jiujitsu"',
    "Campeonatos em SP": '("jiu-jitsu" OR "jiu jitsu") (campeonato OR copa OR open OR torneio OR "paulista" OR FPJJ OR FESP) ("São Paulo" OR paulista) when:21d',
    "CBJJE, IBJJF e ADCC": 'CBJJE OR IBJJF OR ADCC OR "Mundial de Jiu-Jitsu" OR "Pan-Americano de Jiu-Jitsu" when:14d',
    "MMA e grappling": 'MMA OR UFC OR grappling when:2d',
}

LIMITS = {"Campeonatos em SP": 10, "Jiu-Jitsu": 10}

MAX_PER_TOPIC = 6
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "news.json"
HEADERS = {"User-Agent": "news-portfolio/1.0 (+https://pages.github.com)"}


def from_google_news(query, limit):
    if "when:" not in query:
        query += " when:2d"
    url = (
        "https://news.google.com/rss/search?q="
        + quote_plus(query)
        + "&hl=pt-BR&gl=BR&ceid=BR:pt-419"
    )
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    root = ET.fromstring(resp.content)

    articles = []
    for item in root.findall("./channel/item")[:limit]:
        title = item.findtext("title", "").strip()
        source = item.findtext("source", "").strip()
        # O Google News coloca " - Fonte" no fim do título
        if source and title.endswith(" - " + source):
            title = title[: -len(" - " + source)]
        pub = item.findtext("pubDate")
        articles.append(
            {
                "title": title,
                "url": item.findtext("link", "").strip(),
                "source": source,
                "published": parsedate_to_datetime(pub).isoformat() if pub else None,
            }
        )
    return articles


def from_newsapi(query, key, limit):
    resp = requests.get(
        "https://newsapi.org/v2/everything",
        params={
            "q": query.split(" when:")[0],
            "language": "pt",
            "sortBy": "publishedAt",
            "pageSize": limit,
        },
        headers={**HEADERS, "X-Api-Key": key},
        timeout=20,
    )
    resp.raise_for_status()
    return [
        {
            "title": a["title"],
            "url": a["url"],
            "source": (a.get("source") or {}).get("name", ""),
            "published": a.get("publishedAt"),
        }
        for a in resp.json().get("articles", [])
        if a.get("title") and a["title"] != "[Removed]"
    ]


def main():
    key = os.environ.get("NEWSAPI_KEY")
    previous = {}
    if OUTPUT.exists():
        previous = json.loads(OUTPUT.read_text(encoding="utf-8")).get("topics", {})

    topics = {}
    for name, query in TOPICS.items():
        try:
            limit = LIMITS.get(name, MAX_PER_TOPIC)
            articles = from_newsapi(query, key, limit) if key else from_google_news(query, limit)
        except Exception as exc:  # mantém as notícias antigas se um tema falhar
            print(f"[aviso] {name}: {exc}")
            articles = previous.get(name, [])
        topics[name] = articles
        print(f"{name}: {len(articles)} notícias")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(
            {
                "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "source": "NewsAPI" if key else "Google News",
                "topics": topics,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
