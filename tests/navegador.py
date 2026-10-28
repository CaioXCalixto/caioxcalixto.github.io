"""Roda uma pagina de teste no Chrome headless e imprime a linha RESULTADO do console.
Uso: python -I tests/navegador.py [pagina]   (inicia sozinho o servidor http local na raiz do projeto)"""
import http.server
import re
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


class Quieto(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(RAIZ), **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def rodar(pagina):
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(("127.0.0.1", 0), Quieto)
    porta = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    perfil = Path(tempfile.mkdtemp(prefix="portfolio-chrome-"))
    # Paginas que dependem de quadros de animacao reais (integracao) rodam em tempo real; as demais, em tempo virtual.
    tempo = [] if pagina.startswith("integracao") else ["--virtual-time-budget=40000"]
    p = subprocess.Popen(
        [CHROME, "--headless=new", "--disable-gpu", f"--user-data-dir={perfil}", "--enable-logging", "--v=0",
         *tempo, f"http://127.0.0.1:{porta}/tests/{pagina}"],
        stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    log, linha = perfil / "chrome_debug.log", None
    for _ in range(40):
        time.sleep(1)
        if log.exists():
            m = re.search(r'CONSOLE:\d+\] "(RESULTADO:[^\n]*?)", source:', log.read_text(errors="ignore"))
            if m:
                linha = m.group(1)
                break
    p.kill()
    srv.shutdown()
    time.sleep(0.5)
    shutil.rmtree(perfil, ignore_errors=True)
    return linha


if __name__ == "__main__":
    linha = rodar(sys.argv[1] if len(sys.argv) > 1 else "navegador.html")
    print(linha or "RESULTADO: FALHA sem resultado no log")
    sys.exit(0 if linha and linha.startswith("RESULTADO: OK") else 1)
