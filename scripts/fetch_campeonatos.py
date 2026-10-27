"""Busca os próximos campeonatos publicados no Meu Combate e salva em data/campeonatos.json."""

import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent.parent / "data" / "campeonatos.json"
API = "https://api.meucombate.com.br/api:0VrKOQzz/events/events?page={page}&filter_status_events=active"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (cohab-team)", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read().decode("utf-8"))


def main():
    events, page = [], 1
    while page:
        d = get(API.format(page=page))
        events += d.get("items", [])
        page = d.get("nextPage")
    if not events and OUTPUT.exists():
        print("[aviso] lista vazia; mantendo o arquivo anterior")
        return
    today = datetime.now(timezone.utc).timestamp() * 1000
    out = []
    for e in events:
        if e["events_last_day"] < today - 86_400_000 or e["events_name"].strip().lower() == "meu combate":
            continue  # já passou, ou é o evento de teste da plataforma
        org = (e.get("organizations_slug") or "cbjje").split("_")[0]
        out.append({
            "name": e["events_name"].strip(),
            "first_day": datetime.fromtimestamp(e["events_first_day"] / 1000, timezone.utc).date().isoformat(),
            "last_day": datetime.fromtimestamp(e["events_last_day"] / 1000, timezone.utc).date().isoformat(),
            "city": e.get("cities_name") or "",
            "state": e.get("states_acronym") or "",
            "org": org.upper(),
            "cbjje": "cbjje" in (e.get("organizations_slug") or ""),
            "open": bool(e.get("events_inscriptions_opened")),
            "banner": e.get("events_banner_url") or "",
            "url": f"https://www.meucombate.com.br/{org}/evento/{e['events_id']}/informacoes/",
        })
    out.sort(key=lambda x: x["first_day"])
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({"updated": datetime.now(timezone.utc).isoformat(timespec="seconds"), "events": out},
                                 ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(out)} campeonatos")


if __name__ == "__main__":
    main()
