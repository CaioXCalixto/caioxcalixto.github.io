"""Abre PT e EN no Chrome e falha se houver mensagem de console, requisicao 404 ou peso acima do limite.
Uso: python -I tests/erros.py"""
import http.server
import shutil
import socketserver
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
LIMITE_BYTES = 1_000_000
visto, faltando = {}, []


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(RAIZ), **k)

    def log_message(self, fmt, *args):
        caminho, codigo = self.path, str(args[1]) if len(args) > 1 else ""
        if codigo == "404":
            faltando.append(caminho)
        elif codigo in ("200", "304"):
            f = RAIZ / caminho.lstrip("/").split("?")[0]
            if f.is_file():
                visto[caminho] = f.stat().st_size


def abrir(porta, caminho):
    perfil = Path(tempfile.mkdtemp(prefix="portfolio-erros-"))
    p = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", f"--user-data-dir={perfil}", "--enable-logging", "--v=0",
                          "--virtual-time-budget=6000", f"http://127.0.0.1:{porta}{caminho}"],
                         stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(9)
    p.kill()
    time.sleep(0.5)
    log = perfil / "chrome_debug.log"
    texto = log.read_text(errors="ignore") if log.exists() else ""
    shutil.rmtree(perfil, ignore_errors=True)
    return [l for l in texto.splitlines() if "CONSOLE" in l or "ERR_" in l]


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    problemas = []
    for pagina in ("/index.html", "/en/index.html"):
        problemas += [f"{pagina}: {l[-160:]}" for l in abrir(srv.server_address[1], pagina)]
    srv.shutdown()
    problemas += [f"404: {c}" for c in faltando]
    total = sum(visto.values())
    if total > LIMITE_BYTES:
        problemas.append(f"peso {total} bytes acima de {LIMITE_BYTES}")
    print(f"arquivos servidos: {len(visto)}, total {total} bytes")
    if problemas:
        print("\n".join(problemas))
        sys.exit(1)
    print("OK")
