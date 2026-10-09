"""Gera as páginas HTML de cada escalão (index.html e tabela.html).

Uso: python3 scripts/gerar_paginas.py
Edite este ficheiro (e não os .html) para mudar títulos, textos ou o cabeçalho.
"""
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SITE = "https://rugby-sub18.vercel.app"
VERSAO = "7"  # mude para obrigar os browsers a descarregar CSS/JS novos
EPOCA = "2026/27"
NOME_SITE = "Rugby Sub-18 e Sub-16 · Campeonatos Nacionais"

ESCALOES = [
    {
        "id": "sub18", "nome": "Sub-18", "pasta": "", "imagem": "assets/partilha.png",
        "clubes": "Direito, CDUL, Agronomia, Belenenses, Cascais, Académica, CDUP, Sport, Santarém, Técnico e São Miguel",
    },
    {
        "id": "sub16", "nome": "Sub-16", "pasta": "sub16/", "imagem": "assets/partilha-sub16.png",
        "clubes": "Direito, CDUL, Agronomia, Belenenses, Cascais, Académica, CDUP, Sport, Santarém, Técnico, São Miguel e CRE",
    },
]

FONTES = ("https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800;900"
          "&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap")

CORPO_JORNADAS = """  <section class="round-nav" aria-label="Escolher jornada">
    <div class="phase-tabs" id="phase-tabs" role="tablist"></div>
    <div class="round-strip">
      <button class="arrow" id="prev" aria-label="Jornada anterior">&#8592;</button>
      <div class="rounds" id="rounds"></div>
      <button class="arrow" id="next" aria-label="Jornada seguinte">&#8594;</button>
    </div>
  </section>
  <section class="round-head" id="round-head" aria-live="polite"></section>
  <section id="matches"></section>"""

CORPO_TABELA = """  <div class="phase-tabs phase-tabs--page" id="phase-tabs" role="tablist"></div>
  <section id="panel" aria-live="polite"></section>
  <details class="rules">
    <summary>Critérios de pontuação e desempate</summary>
    <p>Vitória 4 pontos, empate 2, derrota 0. Bónus ofensivo (+1) ao marcar pelo menos 4 ensaios e pelo menos 3 ensaios a mais do que o adversário; bónus defensivo (+1) ao perder por 7 pontos ou menos.</p>
    <p>Em caso de igualdade: diferença de pontos, pontos marcados, ensaios marcados.</p>
  </details>"""


def pagina(e, tipo):
    n = e["nome"]
    nh = n.replace("-", "‑")  # hífen que não parte a linha
    root = "../" * e["pasta"].count("/")
    ficheiro = "" if tipo == "jornadas" else "tabela.html"
    url = f"{SITE}/{e['pasta']}{ficheiro}"
    if tipo == "jornadas":
        titulo = f"Rugby {n} · Campeonato Nacional {EPOCA} · Resultados por jornada"
        desc = (f"Resultados, jogos e calendário do Campeonato Nacional de Rugby {n} {EPOCA}, "
                f"jornada a jornada: {e['clubes']}.")
    else:
        titulo = f"Classificação · Campeonato Nacional de Rugby {n} {EPOCA}"
        desc = (f"Classificação do Campeonato Nacional de Rugby {n} {EPOCA}: tabela da fase regular "
                f"e da Final 6, com pontos, bónus ofensivo e defensivo e forma das equipas.")
    cur = ' aria-current="page"'
    escaloes = "\n".join(
        f'      <a href="{root + o["pasta"] + ficheiro or "./"}"{cur if o is e else ""}>{o["nome"]}</a>'
        for o in ESCALOES)
    ld = ""
    if tipo == "jornadas" and not e["pasta"]:
        ld = ('<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite",'
              f'"name":"{NOME_SITE}","url":"{SITE}/","inLanguage":"pt-PT"}}</script>\n')
    v = VERSAO
    return f"""<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titulo}</title>
<meta name="description" content="{desc}">
<meta name="google-site-verification" content="qMNDaPv_n4s8xUjDLk_QIbVwMfUueHqk075moEz9dtM">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_PT">
<meta property="og:site_name" content="{NOME_SITE}">
<meta property="og:title" content="{titulo}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/{e['imagem']}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#11130f">
<link rel="icon" href="{root}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTES}" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/style.css?v={v}">
{ld}</head>
<body class="page-{tipo}" data-escalao="{e['id']}" data-root="{root}">
<a class="skip" href="#main">Saltar para o conteúdo</a>
<header class="masthead">
  <div class="wrap mast-top">
    <nav class="esc" aria-label="Escalão">
{escaloes}
    </nav>
    <a class="brand" href="./">
      <span class="brand-kicker">Campeonato Nacional · <span data-epoca></span></span>
      <span class="brand-title">Rugby <em>{nh}</em></span>
    </a>
    <nav class="nav" aria-label="Principal">
      <a href="./"{cur if tipo == "jornadas" else ""}>Jornadas</a>
      <a href="tabela.html"{cur if tipo == "tabela" else ""}>Classificação</a>
    </nav>
  </div>
  <div class="wrap"><ol class="phase-track" id="phase-track" aria-label="Fases do campeonato"></ol></div>
</header>
<main id="main" class="wrap">
  <div id="status"></div>
{CORPO_JORNADAS if tipo == "jornadas" else CORPO_TABELA}
</main>
<footer class="foot wrap">
  <p>Campeonato Nacional {nh} · <span data-epoca></span></p>
  <p>Resultados e classificação do Campeonato Nacional de Rugby {nh}</p>
</footer>
<script src="{root}assets/config.js?v={v}"></script>
<script src="{root}assets/app.js?v={v}"></script>
<script src="{root}assets/{tipo}.js?v={v}"></script>
<script>window.va = window.va || function () {{ (window.vaq = window.vaq || []).push(arguments); }};</script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
"""


def main():
    urls = []
    for e in ESCALOES:
        for tipo, nome in (("jornadas", "index.html"), ("tabela", "tabela.html")):
            destino = RAIZ / e["pasta"] / nome
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_text(pagina(e, tipo), encoding="utf-8")
            urls.append(f"{SITE}/{e['pasta']}{'' if tipo == 'jornadas' else 'tabela.html'}")
            print("escrito", destino.relative_to(RAIZ))
    linhas = "\n".join(f"  <url><loc>{u}</loc><changefreq>weekly</changefreq></url>" for u in urls)
    (RAIZ / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{linhas}\n</urlset>\n", encoding="utf-8")
    print("escrito sitemap.xml")


if __name__ == "__main__":
    main()
