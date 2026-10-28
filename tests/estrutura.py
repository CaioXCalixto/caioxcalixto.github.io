"""Verificacoes estaticas das paginas PT e EN. Uso: python -I tests/estrutura.py"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
IDS_FASES = ["inicio", "fase-1", "fase-2", "fase-3", "fase-4", "contato"]
PROIBIDAS = ["telefone", "(21)"]
ENDERECO = re.compile(r"\brua\s+[^<>,\n]{2,40},?\s*\d+")  # qualquer "Rua X, 123": o endereco nao vai para o site


class Coletor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.pilha = []
        self.numeros_soltos = []
        self.h1 = 0
        self.ids = []
        self.canvas = []
        self.css = []
        self.scripts = []
        self.hreflang = False
        self.texto = []

    def handle_endtag(self, tag):
        for i in range(len(self.pilha) - 1, -1, -1):
            if self.pilha[i][0] == tag:
                del self.pilha[i:]
                break

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag not in ("meta", "link", "br", "img", "input", "canvas"):
            self.pilha.append((tag, (a.get("class") or "").split()))
        if tag == "h1":
            self.h1 += 1
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "canvas":
            self.canvas.append(a)
        if tag == "link" and a.get("rel") == "stylesheet":
            self.css.append(a.get("href", ""))
        if tag == "link" and a.get("hreflang"):
            self.hreflang = True
        if tag == "script" and a.get("src"):
            self.scripts.append(a["src"])

    def handle_data(self, data):
        self.texto.append(data)
        tags = [t for t, _ in self.pilha]
        classes = [c for _, cs in self.pilha for c in cs]
        dentro_main = "main" in tags
        fonte_titulo = any(t in ("h1", "h2", "h3", "b", "a") for t in tags) or "num" in classes or "btn" in classes
        if dentro_main and not fonte_titulo and re.search(r"\d{4}|\dFA", data):
            self.numeros_soltos.append(data.strip()[:50])


def ler(caminho):
    c = Coletor()
    c.feed(Path(caminho).read_text(encoding="utf-8"))
    return c


def checar_html(caminho):
    caminho = Path(caminho)
    prefixo = "../jogo/" if caminho.parent.name == "en" else "jogo/"
    c = ler(caminho)
    falhas = []
    if c.h1 != 1:
        falhas.append(f"{caminho.name}: esperado 1 <h1>, achei {c.h1}")
    for i in IDS_FASES:
        if i not in c.ids:
            falhas.append(f"{caminho}: falta o id '{i}'")
    ordem = [i for i in c.ids if i in IDS_FASES]
    if ordem != [i for i in IDS_FASES if i in ordem]:
        falhas.append(f"{caminho}: ids de fase fora de ordem: {ordem}")
    if not any(cv.get("id") == "ceu" and cv.get("aria-hidden") == "true" for cv in c.canvas):
        falhas.append(f"{caminho}: falta <canvas id=\"ceu\" aria-hidden=\"true\">")
    if not any(cv.get("id") == "astronauta" and cv.get("aria-hidden") == "true" for cv in c.canvas):
        falhas.append(f"{caminho}: falta <canvas id=\"astronauta\" aria-hidden=\"true\">")
    for recurso in c.css + c.scripts:
        if recurso.startswith("http") or recurso.startswith("//"):
            falhas.append(f"{caminho}: recurso externo {recurso}")
        elif not recurso.startswith(prefixo):
            falhas.append(f"{caminho}: caminho inesperado {recurso} (esperado {prefixo}...)")
        elif not (caminho.parent / recurso).exists():
            falhas.append(f"{caminho}: arquivo inexistente {recurso}")
    if not any(r.endswith("estilo.css") for r in c.css):
        falhas.append(f"{caminho}: falta link para estilo.css")
    for nome in ["ceu.js", "sprites.js", "jogo.js"]:
        if not any(s.endswith(nome) for s in c.scripts):
            falhas.append(f"{caminho}: falta script {nome}")
    if not c.hreflang:
        falhas.append(f"{caminho}: falta hreflang")
    for trecho in c.numeros_soltos:
        falhas.append(f"{caminho}: numero fora da fonte pixel clara (.num): '{trecho}'")
    texto = " ".join(c.texto).lower()
    for p in PROIBIDAS:
        if p in texto:
            falhas.append(f"{caminho}: texto proibido '{p}'")
    if ENDERECO.search(texto):
        falhas.append(f"{caminho}: parece conter um endereco de rua")
    return falhas


def checar_conteudo(caminho):
    """Conteudo exigido pelo Caio: enfase em LLMs/RAG, Lopes Bahia como estagio atual, FAETEC 2022-2024, dados do curriculo novo."""
    caminho = Path(caminho)
    s = caminho.read_text(encoding="utf-8")
    en = caminho.parent.name == "en"
    atual = "current" if en else "atual"
    f = []

    def sem_tags(t):
        return re.sub(r"\s+([,.;:)])", r"\1", re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t)))

    lead = re.search(r'<p class="lead">(.*?)</p>', s, re.S)
    lead = sem_tags(lead.group(1)) if lead else ""
    for termo in ("LLMs", "RAG"):
        if termo not in lead:
            f.append(f"{caminho.name}: a apresentacao (lead) deve citar {termo}")
    if "Claude Code" in lead:
        f.append(f"{caminho.name}: a apresentacao nao deve mais ter enfase em Claude Code")
    desc = re.search(r'<meta name="description" content="([^"]*)"', s)
    if not desc or "LLM" not in desc.group(1) or "RAG" not in desc.group(1):
        f.append(f"{caminho.name}: meta description deve citar LLMs e RAG")
    if '"LLMs"' not in s.split("application/ld+json")[1]:
        f.append(f"{caminho.name}: JSON-LD knowsAbout deve incluir LLMs")

    def item(titulo):
        m = re.search(r'<article class="painel-item">\s*<h3>(?:<a[^>]*>)?' + titulo + r".*?</article>", s, re.S)
        return sem_tags(m.group(0)) if m else ""

    lopes, atletica, faetec = item("Lopes Bahia"), item(r"(Atl\S+tica|UERJ Student)"), item("Adventures")
    if atual not in lopes.lower():
        f.append(f"{caminho.name}: Lopes Bahia deve estar marcada como estagio {atual}")
    if "RAG" not in lopes:
        f.append(f"{caminho.name}: Lopes Bahia deve citar o chatbot de IA com RAG")
    if atual not in atletica.lower():
        f.append(f"{caminho.name}: Atletica deve estar marcada como {atual}")
    if not re.search(r"2022\D+2024", faetec) or re.search(r"2024\s+(?:a|to)\s+2024", faetec):
        f.append(f"{caminho.name}: FAETEC deve ser 2022 a 2024")
    # Fighting Space foi feito so em 2024; o estagio na FAETEC foi de 2022 a 2024 (nao misturar os dois periodos).
    em = "In" if en else "Em"
    if not re.search(("Developed in" if en else "Desenvolvido em") + r"\s*2024", item("Fighting Space")):
        f.append(f"{caminho.name}: o projeto Fighting Space deve dizer que foi desenvolvido em 2024")
    if not re.search(em + r"\s*2024,.*Fighting Space", faetec):
        f.append(f"{caminho.name}: na FAETEC, o Fighting Space deve aparecer como feito em 2024 ('{em} 2024, ...')")
    fase4 = re.search(r'<section id="fase-4".*?</section>', s, re.S)
    fase4 = sem_tags(fase4.group(0)) if fase4 else ""
    for termo in ("Prompt engineering", "RAG", "11/2028", "Antigravity"):
        if termo not in fase4:
            f.append(f"{caminho.name}: fase 4 deve citar {termo}")
    fase1 = re.search(r'<section id="fase-1".*?</section>', s, re.S)
    fase1 = sem_tags(fase1.group(0)) if fase1 else ""
    for termo in ("RAG", "prompt" if not en else "prompt"):
        if termo.lower() not in fase1.lower():
            f.append(f"{caminho.name}: fase 1 deve resumir a experiencia com LLMs ({termo})")
    return f


def ordem_igual():
    pt, en = ler(RAIZ / "index.html"), ler(RAIZ / "en" / "index.html")
    f = [i for i in pt.ids if i in IDS_FASES]
    e = [i for i in en.ids if i in IDS_FASES]
    return [] if f == e else [f"ids de fase diferentes entre PT {f} e EN {e}"]


if __name__ == "__main__":
    falhas = (checar_html(RAIZ / "index.html") + checar_html(RAIZ / "en" / "index.html") + ordem_igual()
              + checar_conteudo(RAIZ / "index.html") + checar_conteudo(RAIZ / "en" / "index.html"))
    if falhas:
        print("\n".join(falhas))
        sys.exit(1)
    print("OK")
