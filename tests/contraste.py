"""Contraste WCAG dos pares de cor do CSS. Uso: python -I tests/contraste.py"""
import re
import sys
from pathlib import Path

CSS = Path(__file__).resolve().parent.parent / "jogo" / "estilo.css"
MINIMO = 7.0


def luminancia(hex_):
    h = hex_.lstrip("#")
    canais = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in canais]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def razao(a, b):
    la, lb = sorted((luminancia(a), luminancia(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def token(css, nome):
    m = re.search(r"--%s\s*:\s*(#[0-9a-fA-F]{6})" % nome, css)
    return m.group(1) if m else None


def main():
    css = CSS.read_text(encoding="utf-8")
    falhas = []
    pares = [("creme", "painel"), ("ouro", "painel"), ("creme", "noite"), ("creme", "painel2"), ("ouro", "painel2"), ("brasa", "painel2")]
    for fg, bg in pares:
        a, b = token(css, fg), token(css, bg)
        if not a or not b:
            falhas.append(f"token --{fg} ou --{bg} ausente em estilo.css")
            continue
        r = razao(a, b)
        if r < MINIMO:
            falhas.append(f"contraste {fg} sobre {bg} = {r:.2f} (< {MINIMO})")
    if falhas:
        print("\n".join(falhas))
        sys.exit(1)
    print("OK")


if __name__ == "__main__":
    main()
