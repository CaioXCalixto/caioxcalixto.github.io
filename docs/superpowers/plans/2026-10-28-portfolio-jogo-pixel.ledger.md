# SDD ledger — plan: docs/superpowers/plans/2026-10-28-portfolio-jogo-pixel.md
Spec: docs/superpowers/specs/2026-10-28-portfolio-jogo-pixel-design.md (lida)
Ruling: trabalhar na branch jogo-pixel, main fica como versao de seguranca — spec exige manter a versao atual — custo se errado: um merge/rebase
Pre-flight: T3 produz Ceu.faixas/estrelas/quantidade -> T4 consome: assinaturas iguais, ok
Pre-flight: T5 produz Sprites.desenhar(ctx,matriz,x,y,escala) -> T4 (lua/cidade) e T6 (astronauta) consomem: T4 roda antes de T5; ruling: T4 usa Sprites se existir e testa so o fundo; lua/cidade ligadas na T5 — custo: um passo extra
Pre-flight: T2 produz ids #ceu, #astronauta, #hud-fase, #hud-altitude, nav.fases -> T6 consome: ok
Task 1: Ruling: task-done exige teste verde, mas estrutura.py so passa apos a Task 2 (fases no HTML) — usei como comando de conclusao a checagem do esqueleto (arquivos existem) e registrei o RED de estrutura.py (22 falhas esperadas) — custo se errado: nenhum
Task 1: complete (commits ee87d6d..b65c089, tests: bash -c 'for f in jogo/estilo.css jogo/ceu.js jogo/jogo.js jogo/sprites.js tests/estrutura.py; do test -f $f || exit 1; done; echo esqueleto-ok' → esqueleto-ok)
Task 2: Ruling: fontes do espelho Fontsource (jsdelivr), woff2 latin, 28 KB, com autorizacao do Caio — custo se errado: trocar arquivos
Task 2: Ruling: adicionados tests/largura.html (iframes 320/360/390/768 via http 8767) e tests/tudo.py; corrigido overflow real (.btn do e-mail, grades) — custo se errado: nenhum
Task 2: Ruling: contraste tambem testa --painel2 e brasa — custo se errado: nenhum
Task 2: complete (commits b65c089..9aa9a34, tests: /c/Users/user/AppData/Local/Programs/Python/Python312/python.exe -I tests/tudo.py → contraste.py: OK)
Task 3: Ruling: executor .ps1 bloqueado pela politica de execucao do Windows (nao alterei a politica); troquei por tests/navegador.py (servidor http proprio em porta livre, Chrome headless, le RESULTADO do log) — custo se errado: nenhum
Task 3: complete (commits 9aa9a34..f325897, tests: /c/Users/user/AppData/Local/Programs/Python/Python312/python.exe -I tests/navegador.py navegador.html → RESULTADO: OK (5 testes))
Task 4: Ruling: Ceu.desenhar aceita opcoes.alcance (altura total/viewport - 1) para a cidade rolar a 100% — o plano nao listava o campo; default 4 — custo se errado: cidade sai mais rapido/lento
Task 4: Ruling: lua/cidade desenhadas so se window.Sprites existir (Task 5 as fornece); verificacao visual por tests/amostra.html (6 posicoes) porque jogo.js so alimenta o canvas na Task 6 — custo se errado: nenhum
Task 4: Ruling: apos sprites, polir a nebulosa (formas circulares demais) — anotado como possivel polimento, nao bloqueia
Task 4: complete (commits f325897..4f10daf, tests: /c/Users/user/AppData/Local/Programs/Python/Python312/python.exe -I tests/navegador.py navegador.html → RESULTADO: OK (12 testes))
Task 5: Ruling: cidade e lua geradas por codigo (matrizes montadas em criaCidade/criaLua, deterministicas) em vez de literais — mantem a interface Sprites.cidade/lua: string[] — custo se errado: nenhum
Task 5: complete (commits 4f10daf..ce3de5b, tests: /c/Users/user/AppData/Local/Programs/Python/Python312/python.exe -I tests/navegador.py navegador.html → RESULTADO: OK (17 testes))
Task 6: Ruling: testes de DOM em tests/integracao.html (iframe, rolagem real); roda em tempo real porque o tempo virtual do Chrome headless para de produzir quadros e gerava falso negativo (provado com log de rAF) — custo se errado: nenhum
Task 6: Ruling: cidade reduzida a metade (Ceu.escalaCidade) e repetida em faixas, apos ver captura (dominava a tela) — fora do plano, dentro da spec (silhueta no chao) — custo se errado: um numero
Task 6: Ruling: tests/tudo.py agora roda a suite completa (estatico, unitario, largura, integracao)
Task 6: complete (commits ce3de5b..b5577ae, tests: /c/Users/user/AppData/Local/Programs/Python/Python312/python.exe -I tests/tudo.py → navegador.py integracao.html: RESULTADO: OK)
Task 7: Ruling: anos e numeros do corpo em Press Start 2P (.num) — Pixelify Sans confunde 5/S, 2/8, 7/1 (visto em captura) — custo se errado: so estilo
Task 7: Ruling: digitacao so nos h2; h1 nunca animado (capturas/previas/PDF mostravam a pagina sem o nome) + rede de seguranca de 1s nos h2 — a spec dizia 'titulo de cada fase'; o hero fica fora — custo se errado: perde um efeito no hero
Task 7: Ruling: favicon SVG embutido (404 em /favicon.ico detectado por tests/erros.py); peso total 70 KB; sem erros de console
Task 7: Ruling: caso sem JS verificado com copia sem <script> (o flag do Chrome headless nao desliga JS); reduzir movimento coberto por testes unitarios (reduzido) e screenshot com --force-prefers-reduced-motion
Task 7: complete (commits b5577ae..9d48e0c, tests: /c/Users/user/AppData/Local/Programs/Python/Python312/python.exe -I tests/tudo.py → OK)
Final review: fresh reviewer (fable), report received
Final: fixed reduced-motion still had scroll parallax — test 'com reduzido, rolar nao desloca estrelas' + 'deslocamento' + 'lua na posicao final' RED→GREEN, suite 6/6
Final: fixed astronaut covered panel text between 641px and ~1276px — integracao 'astronauta visivel em 1000px' RED→GREEN (agora display:none ate 1280px), suite 6/6
Final: fixed HUD measured 105px vs --hud-altura 92px — integracao 'HUD mede' RED→GREEN (default 105px + jogo.js mede e ajusta), suite 6/6
Final: Ruling: hreflang absoluto/x-default/canonical nao feito — depende do dominio final, que ainda nao existe; herdado da main, nao e regressao — custo se errado: SEO de idioma menos preciso ate publicar
Final: minor (deferred): resize por barra de URL do celular limpa o canvas e refaz medicoes (pode piscar)
Final: minor (deferred): menu horizontal nao rola ate o link ativo em 320px
Final: minor (deferred): link "pular para o conteudo" vai para #fase-1 e pula a apresentacao
Final: minor (deferred): aria-label dos links PT/EN nao contem o texto visivel (WCAG 2.5.3)
Final: minor (deferred): digitacao do h2 pode piscar (visivel, some e digita)
Final: minor (deferred): aria-current="true" poderia ser "location"
Final: minor (deferred): estado do mouse pode virar NaN com innerWidth 0
Final: minor (deferred): redesenho continuo ~8x/s por causa do piscar (dentro da spec)
Final: minor (deferred): lacunas de teste (rAF real em erros.py, 0x0 via Ceu.iniciar, reduzir movimento em pagina real)
