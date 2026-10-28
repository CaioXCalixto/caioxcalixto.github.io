"""Roda toda a suite. Uso: python -I tests/tudo.py   (precisa do Chrome instalado para os testes de navegador)"""
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
PASSOS = [
    ("estrutura.py", []),
    ("contraste.py", []),
    ("navegador.py", ["navegador.html"]),
    ("navegador.py", ["largura.html"]),
    ("navegador.py", ["integracao.html"]),
    ("erros.py", []),
]
ok = True
for nome, args in PASSOS:
    r = subprocess.run([sys.executable, "-I", str(AQUI / nome), *args], capture_output=True, text=True)
    saida = (r.stdout.strip() or r.stderr.strip())[:300]
    print(f"{nome} {' '.join(args)}: {saida}")
    ok = ok and r.returncode == 0
sys.exit(0 if ok else 1)
