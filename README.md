<p align="center">
  <img src="./assets/banner.svg" width="100%" alt="Cohab Team · Brazilian Jiu-Jitsu" />
</p>

<p align="center">
  <a href="https://yagoxavier10.github.io/cohab-team/"><img src="https://img.shields.io/badge/🌐_Ver_o_site-ao_vivo-7b3fe4?style=for-the-badge&labelColor=0d0b2e" alt="Ver o site" /></a>
  <a href="https://github.com/YagoXavier10/cohab-team/actions/workflows/update-news.yml"><img src="https://github.com/YagoXavier10/cohab-team/actions/workflows/update-news.yml/badge.svg" alt="update-news.yml" /></a>
  <a href="https://github.com/YagoXavier10/cohab-team/actions/workflows/update-cohab.yml"><img src="https://github.com/YagoXavier10/cohab-team/actions/workflows/update-cohab.yml/badge.svg" alt="update-cohab.yml" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-0d0b2e?style=for-the-badge&logo=javascript&logoColor=f7df1e" alt="JavaScript" />
  <img src="https://img.shields.io/badge/HTML5-0d0b2e?style=for-the-badge&logo=html5&logoColor=e34f26" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-0d0b2e?style=for-the-badge&logo=css&logoColor=1572b6" alt="CSS3" />
  <img src="https://img.shields.io/badge/Python-0d0b2e?style=for-the-badge&logo=python&logoColor=ffd43b" alt="Python" />
  <img src="https://img.shields.io/badge/GitHub_Actions-0d0b2e?style=for-the-badge&logo=githubactions&logoColor=2088ff" alt="GitHub Actions" />
  <img src="https://img.shields.io/badge/Firebase-0d0b2e?style=for-the-badge&logo=firebase&logoColor=ffca28" alt="Firebase" />
</p>

Site da Cohab Team, equipe de jiu-jitsu de Itaquera (São Paulo), desde 1998.

## 📸 Prévia

<p align="center">
  <a href="https://yagoxavier10.github.io/cohab-team/"><img src="./assets/preview.png" width="90%" alt="Prévia do site" /></a>
</p>

## 🗂️ Páginas

🌐 https://yagoxavier10.github.io/cohab-team/

- `index.html` — página inicial: números, últimos títulos, próximo campeonato e notícias
- `historia.html` — história, mestres, linhagem e linha do tempo
- `conquistas.html` — títulos, pódios e medalhas em todas as federações
- `atletas.html` — busca de atletas (nomes de crianças abreviados)
- `campeonatos.html` — próximos campeonatos da CBJJE e calendários das federações
- `noticias.html` — notícias de jiu-jitsu, buscar e salvar para ler depois
- `quiz.html` — quiz da Cohab

## 🤖 Automação

- `.github/workflows/update-news.yml` — todo dia às 07:00: notícias (`scripts/fetch_news.py`) e campeonatos (`scripts/fetch_campeonatos.py`)
- `.github/workflows/update-cohab.yml` — toda segunda às 06:00: conquistas (`scripts/update_cohab.py`), com dados brutos em `data/cohab/`

## 💻 Rodar localmente

```bash
python -m http.server 8000   # abra http://localhost:8000
```

Feito por [Yago dos Santos](https://yagoxavier10.github.io/portfolio-noticias/).

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).
