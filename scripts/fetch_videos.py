"""Busca os vídeos mais recentes de canais de aulas de jiu-jitsu e salva em data/videos.json.

Usa o feed RSS público de cada canal do YouTube (não precisa de chave).
Os canais ficam em CHANNELS; o ID de cada um é descoberto pelo @nome e guardado em
data/video_channels.json para não precisar procurar de novo.
"""

import json
import re
import time
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "data" / "videos.json"
CACHE = ROOT / "data" / "video_channels.json"
HEADERS = {"User-Agent": "Mozilla/5.0 (cohab-team)", "Accept-Language": "pt-BR,pt;q=0.9"}

# @nome do canal, nome exibido e idioma das aulas
CHANNELS = [
    ("@fluidocaiman", "Fluído Caiman (Cohab)", "pt"),
    ("@KnightJiuJitsu", "Knight Jiu-Jitsu", "en"),
    ("@Chewjitsu", "Chewjitsu", "en"),
    ("@grapplearts", "Grapplearts (Stephan Kesting)", "en"),
    ("@GracieBreakdown", "Gracie Breakdown", "en"),
    ("@BernardoFariaBJJ", "Bernardo Faria", "en"),
    ("@JiuJitsuBrasil", "Jiu-Jitsu Brasil", "pt"),
    ("@gfteamoficial", "GF Team", "pt"),
]

# assunto de cada vídeo, pelas palavras do título (português e inglês)
TOPICS = [
    ("Iniciantes", r"iniciante|beginner|b[aá]sic|fundament|faixa branca|white belt|primeira aula|first class"),
    ("Finalizações", r"finaliza|choke|estrangula|armbar|armlock|tri[aâ]ngul|triangle|kimura|americana|omoplata|mata.?le[aã]o|rear naked|leg ?lock|heel hook|chave|guillotine|guilhotina|submission"),
    ("Passagem", r"passag|pass(ing)?\b|guard pass|torean"),
    ("Raspagem", r"raspag|sweep"),
    ("Guarda", r"guarda|guard|de la riva|spider|aranha|la[cç]o|lasso|butterfly|borboleta|x.?guard|half.?guard|meia.?guarda"),
    ("Quedas", r"queda|takedown|single leg|double leg|wrestling|judo|throw"),
    ("Defesa e saídas", r"defes|escape|sa[ií]da|fuga|defend|survival"),
    ("Costas e montada", r"costas|back take|back control|montada|mount"),
]


def get(url, tries=3):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as r:
                return r.read()
        except Exception:
            time.sleep(2 + 2 * k)
    return b""


def channel_id(handle, cache):
    if handle in cache:
        return cache[handle]
    page = get(f"https://www.youtube.com/{handle}").decode("utf-8", "replace")
    m = re.search(r'"(?:channelId|externalId)":"(UC[\w-]{22})"', page)
    if m:
        cache[handle] = m.group(1)
    return cache.get(handle)


def topic_of(title):
    t = title.lower()
    return next((name for name, pat in TOPICS if re.search(pat, t)), "Dicas e treino")


def main():
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015",
          "media": "http://search.yahoo.com/mrss/"}
    videos = []
    for handle, name, lang in CHANNELS:
        cid = channel_id(handle, cache)
        if not cid:
            print(f"[aviso] canal não encontrado: {handle}")
            continue
        raw = get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}")
        if not raw:
            print(f"[aviso] feed vazio: {handle}")
            continue
        root = ET.fromstring(raw)
        count = 0
        for e in root.findall("a:entry", ns):
            vid = e.findtext("yt:videoId", namespaces=ns)
            title = e.findtext("a:title", namespaces=ns) or ""
            link = e.find("a:link", ns)
            if not vid or (link is not None and "/shorts/" in link.get("href", "")):
                continue  # pula os shorts
            videos.append({"id": vid, "title": title, "channel": name, "lang": lang,
                           "published": e.findtext("a:published", namespaces=ns), "topic": topic_of(title)})
            count += 1
        print(f"{name}: {count} vídeos")
    CACHE.write_text(json.dumps(cache, indent=1), encoding="utf-8")
    if not videos and OUTPUT.exists():
        print("[aviso] nenhum vídeo lido; mantendo o arquivo anterior")
        return
    videos.sort(key=lambda v: v["published"] or "", reverse=True)
    OUTPUT.write_text(json.dumps({"updated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "videos": videos[:200]},
                                 ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"total: {len(videos[:200])} vídeos")


if __name__ == "__main__":
    main()
