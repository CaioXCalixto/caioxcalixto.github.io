# Portfólio em formato de jogo (pixel art): plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o portfólio PT/EN em uma página de rolagem com céu estrelado em pixel art, parallax por posição, HUD e painéis de destaque.

**Architecture:** O HTML continua sendo o conteúdo (seções semânticas). `jogo/ceu.js` desenha um canvas fixo a partir de um número `t` (0..1) e não conhece o conteúdo. `jogo/jogo.js` lê a rolagem, calcula `t` e a fase atual e atualiza HUD e personagem. `jogo/estilo.css` guarda tokens, painéis e tipografia.

**Tech Stack:** HTML/CSS/JS puro (sem build, sem dependências), Python 3.12 stdlib para testes estáticos, página de teste no navegador (`tests/navegador.html`). Python em `C:\Users\user\AppData\Local\Programs\Python\Python312\python.exe`.

**Spec:** `docs/superpowers/specs/2026-10-28-portfolio-jogo-pixel-design.md`

## Global Constraints

- Site estático no GitHub Pages; sem backend, cookies ou rastreamento; nenhuma requisição a terceiros (fontes e scripts locais).
- Duas páginas: `index.html` (PT) e `en/index.html` (EN), mesmo conteúdo e mesmos ids de seção; assets em `jogo/` com caminho relativo (`jogo/...` em PT, `../jogo/...` em EN).
- Conteúdo em HTML semântico, legível sem JavaScript; canvas e personagem com `aria-hidden="true"`.
- Sem telefone, sem endereço e sem dados confidenciais da Lopes Bahia.
- Paleta: noite `#0b0e2a`, índigo `#1d2260`, horizonte `#5b3a8c`, brasa `#ff9a62`, ouro `#ffd86b`, creme `#f4ecd0`; painel `#0d1030` a 94%, borda 4px creme, sombra dura 6px.
- Contraste mínimo 7:1 em todo texto de painel. Escala de fonte: abertura 40px, fase 24px, subtítulo 16px, corpo 19px.
- Canvas: cerca de 320px de largura, ampliado com `image-rendering: pixelated`; no máximo 30 quadros por segundo; para com a aba oculta; metade das estrelas em celular; sem piscar nem parallax com `prefers-reduced-motion`.
- Fases e ids: `inicio`, `fase-1` (quem sou), `fase-2` (projetos), `fase-3` (experiência), `fase-4` (habilidades e formação), `contato`.
- Não enviar nada ao GitHub, não publicar e não alterar o histórico existente sem aprovação do Caio. Commits locais pequenos.

## Review Focus

- `t` fora de 0..1 ou `NaN` (rolagem elástica no celular): o céu deve se manter válido (clamp). Teste na Task 3.
- Janela sem altura ou largura (aba oculta, redimensionando): o canvas não pode lançar erro nem dividir por zero. Teste na Task 4.
- JavaScript desativado: todo o conteúdo visível, nada escondido à espera do script. Teste na Task 2.
- Texto longo em inglês dentro de painéis em telas de 320px: sem rolagem horizontal. Teste na Task 2.
- Usuário com `prefers-reduced-motion`: sem animação de estrelas e sem parallax, sem quebrar a troca de cor. Teste na Task 4.
- Página EN carregando `../jogo/...`: assets existem e os caminhos batem. Teste na Task 1.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `jogo/ceu.js` | `Ceu.faixas`, `Ceu.estrelas`, `Ceu.quantidade`, `Ceu.desenhar`, `Ceu.iniciar` |
| `jogo/sprites.js` | Matrizes de pixel e `Sprites.desenhar` (astronauta, lua, cidade) |
| `jogo/jogo.js` | `Jogo.faseAtual`, rolagem, HUD, menu de fases, teclado |
| `jogo/estilo.css` | Tokens, painéis, HUD, tipografia, fallback sem canvas |
| `jogo/fontes/` | `.woff2` locais das duas fontes + licenças |
| `index.html`, `en/index.html` | Conteúdo, seções e HUD |
| `tests/estrutura.py` | Verificações estáticas dos HTML e do CSS |
| `tests/contraste.py` | Contraste 7:1 dos pares de cor |
| `tests/navegador.html` | Testes das funções puras no navegador |

---

### Task 1: Testes estáticos e esqueleto de pastas

**Files:**
- Create: `tests/estrutura.py`, `jogo/estilo.css` (vazio), `jogo/ceu.js` (vazio), `jogo/jogo.js` (vazio), `jogo/sprites.js` (vazio)
- Test: `tests/estrutura.py`

**Interfaces:**
- Produces: `python -I tests/estrutura.py` imprime `OK` e sai com 0, ou lista as falhas e sai com 1. Funções `checar_html(caminho) -> list[str]` (lista de falhas).

- [ ] **Step 1: Escrever `tests/estrutura.py`** com `checar_html` verificando, para `index.html` e `en/index.html`: exatamente um `<h1>`; ids `inicio`, `fase-1`, `fase-2`, `fase-3`, `fase-4`, `contato` presentes e na mesma ordem nas duas páginas; um `<canvas` com `aria-hidden="true"`; links `rel="stylesheet"` e `<script src` apontando para `jogo/...` (PT) e `../jogo/...` (EN) e existindo em disco; nenhum `src=` ou `href=` de stylesheet/script com `http`; `hreflang` presente; ausência das palavras `telefone` e `(21)` e de qualquer endereço de rua.
- [ ] **Step 2: Rodar e ver falhar**

Run: `python -I tests/estrutura.py`
Expected: falhas de ids, canvas e assets (as páginas atuais ainda não têm as fases).
- [ ] **Step 3: Criar os quatro arquivos vazios em `jogo/` e a pasta `jogo/fontes/`.**
- [ ] **Step 4: Commit**

```bash
git add tests jogo && git commit -m "test: verificacoes estaticas e esqueleto de pastas"
```

### Task 2: Conteúdo em fases, HUD e estilo dos painéis

**Files:**
- Modify: `index.html`, `en/index.html`
- Create: `jogo/estilo.css`, `jogo/fontes/` (arquivos `.woff2` e `LICENCAS.txt`)
- Test: `tests/estrutura.py`, `tests/contraste.py`

**Interfaces:**
- Consumes: ids de fase da Task 1.
- Produces: HTML com `<canvas id="ceu" aria-hidden="true">`, `<header class="hud">` contendo `#hud-fase` (nome da fase), `#hud-altitude` (elemento `<progress>` ou `div` com `role="presentation"`), `nav.fases` com um `<a href="#id">` por fase, e o seletor PT | EN; `<canvas id="astronauta" aria-hidden="true">` para o personagem. Variáveis CSS `--noite --indigo --horizonte --brasa --ouro --creme --painel`. Classes `.painel`, `.painel-item`, `.selo`.

- [ ] **Step 1: Escrever `tests/contraste.py`** com `razao(hex1, hex2) -> float` (fórmula WCAG) e asserções: creme sobre `#0d1030` ≥ 7, ouro sobre `#0d1030` ≥ 7, creme sobre `#0b0e2a` ≥ 7. Rodar: falha (arquivo ainda sem CSS) e, com as cores corretas, passa.
- [ ] **Step 2: Obter as fontes** Press Start 2P e Pixelify Sans em `.woff2` do repositório oficial de fontes do Google (licença OFL) e salvar em `jogo/fontes/` com `LICENCAS.txt`. **Pedir autorização ao Caio antes de baixar** (nome, origem e tamanho dos arquivos).
- [ ] **Step 3: Reestruturar `index.html` e `en/index.html`** em seções com os ids da spec, `<main>`, um `<h2>` por fase, painéis (`.painel` por fase, `.painel-item` por projeto e experiência, `.selo` para as 4 conquistas), mantendo o texto e os links atuais (LinkedIn, GitHub, estúdio). Remover o CSS inline antigo; manter JSON-LD e metadados.
- [ ] **Step 4: Escrever `jogo/estilo.css`** com tokens, `@font-face` (`font-display: swap`), painel com borda de degraus (`clip-path` ou `box-shadow` em passos), sombra dura de 6px, tipografia da escala, foco de 4px ouro, botões que sobem/descem 2px, `max-width: 70ch` no texto, e fundo de fallback `background: linear-gradient(#ff9a62, #5b3a8c 30%, #0b0e2a)` no `body` (para quando o canvas não existir).
- [ ] **Step 5: Teste de largura**: abrir em janela de 320px e confirmar que `document.documentElement.scrollWidth <= innerWidth` (sem rolagem horizontal); e com JS desativado, todo o texto aparece.
- [ ] **Step 6: Rodar `tests/estrutura.py` e `tests/contraste.py`.** Expected: `OK` nos dois.
- [ ] **Step 7: Commit**

```bash
git add index.html en/index.html jogo tests && git commit -m "feat: fases, HUD e painéis com tipografia pixel"
```

### Task 3: Funções puras do céu (`ceu.js`)

**Files:**
- Create/Modify: `jogo/ceu.js`
- Test: `tests/navegador.html`

**Interfaces:**
- Produces (objeto global `Ceu`):
  - `Ceu.faixas(t: number): string[]` — 8 cores hexadecimais, de cima para baixo, interpoladas entre 5 pontos-chave (crepúsculo em `t=0`, azul-noite em `t=0.5`, espaço em `t=1`); `t` é limitado a 0..1 e `NaN` vira 0.
  - `Ceu.estrelas(semente: number, n: number): {x:number, y:number, camada:1|2|3|4, fase:number}[]` — determinística, `x,y` em [0,1).
  - `Ceu.quantidade(t: number, celular: boolean): number` — cresce de 30 (t=0) a 400 (t=1); metade se `celular`.

- [ ] **Step 1: Escrever `tests/navegador.html`** que carrega `../jogo/ceu.js`, roda asserções e, no fim, escreve `RESULTADO: OK` (ou `RESULTADO: FALHA <msg>`) no `console.log` e no `document.title`. Testes: `faixas(0)` retorna 8 hex válidos; `faixas(-5)` e `faixas(NaN)` iguais a `faixas(0)`; `faixas(2)` igual a `faixas(1)`; `faixas(0)` difere de `faixas(1)`; `estrelas(1, 50)` tem 50 itens, todos com `x,y` em [0,1) e camada 1..4, e duas chamadas iguais dão o mesmo resultado; `quantidade(1,false) > quantidade(0,false)`; `quantidade(0.5,true) === Math.floor(quantidade(0.5,false)/2)`.
- [ ] **Step 2: Abrir no navegador e ver falhar** (`Ceu` não definido).
- [ ] **Step 3: Implementar as três funções em `jogo/ceu.js`** como `window.Ceu = {...}`, com gerador pseudoaleatório de semente (por exemplo mulberry32) e interpolação linear por canal de cor.
- [ ] **Step 4: Abrir de novo e ver `RESULTADO: OK`.**
- [ ] **Step 5: Commit**

```bash
git add jogo/ceu.js tests/navegador.html && git commit -m "feat: funcoes puras do ceu com testes"
```

### Task 4: Desenho do canvas, parallax e regras de desempenho

**Files:**
- Modify: `jogo/ceu.js`, `jogo/estilo.css`
- Test: `tests/navegador.html`

**Interfaces:**
- Consumes: `Ceu.faixas`, `Ceu.estrelas`, `Ceu.quantidade` (Task 3).
- Produces: `Ceu.desenhar(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, tempo: number, opcoes: {celular:boolean, reduzido:boolean, mouseX:number, mouseY:number}): void` e `Ceu.iniciar(canvas: HTMLCanvasElement, lerT: () => number): {parar(): void}`.

- [ ] **Step 1: Adicionar testes** ao `navegador.html`: `Ceu.desenhar` com `w=0` ou `h=0` não lança erro; com `reduzido:true` duas chamadas com `tempo` diferente desenham o mesmo resultado (comparar `getImageData`); com `t=0` e `t=1` a cor do pixel (0,0) difere; `Ceu.iniciar` devolve objeto com `parar`.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar `Ceu.desenhar`**: faixas em degraus; estrelas por camada com deslocamento `t * altura * [0.05, 0.15, 0.35, 0.70]` (camada 3 de nebulosa com dithering em padrão 2x2); lua com `Sprites` quando `t > 0.85`; cidade quando `t < 0.25`, saindo a 100%; piscar por `tempo` e `fase`, desativado com `reduzido`; mouse desloca a camada 4 até 4px.
- [ ] **Step 4: Implementar `Ceu.iniciar`**: tamanho do canvas = 320 x `round(320 * innerHeight / innerWidth)`; `requestAnimationFrame` limitado a 30 quadros por segundo; redesenha só se `t` mudou ou há piscar; pausa em `document.hidden`; detecta `matchMedia('(prefers-reduced-motion: reduce)')`; trata erro de contexto removendo o canvas (fallback CSS aparece).
- [ ] **Step 5: CSS** `#ceu { position: fixed; inset: 0; width: 100%; height: 100%; image-rendering: pixelated; z-index: -1; }`.
- [ ] **Step 6: Abrir `tests/navegador.html` e ver `RESULTADO: OK`; abrir a página e conferir rolando que o céu muda e as camadas movem em velocidades diferentes.**
- [ ] **Step 7: Commit**

```bash
git add jogo tests && git commit -m "feat: canvas com parallax, estrelas e regras de desempenho"
```

### Task 5: Sprites (astronauta, lua e cidade)

**Files:**
- Modify: `jogo/sprites.js`
- Test: `tests/navegador.html`

**Interfaces:**
- Produces: `Sprites.astronauta: {parado: string[], subindo: string[], pulo: string[]}` (cada pose: 24 linhas de 16 caracteres; caractere = chave de paleta, `.` = transparente), `Sprites.lua: string[]`, `Sprites.cidade: string[]`, `Sprites.paleta: Record<string,string>` e `Sprites.desenhar(ctx, matriz: string[], x: number, y: number, escala: number): void`.

- [ ] **Step 1: Testes** no `navegador.html`: cada pose do astronauta tem 24 linhas de 16 caracteres; todo caractere usado (exceto `.`) existe em `Sprites.paleta`; `Sprites.desenhar` pinta pelo menos um pixel opaco no canvas de teste.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Desenhar as matrizes** (astronauta de capacete creme com visor índigo e traje ouro e brasa; lua cheia com crateras; cidade com prédios em silhueta `#0b0e2a` e janelas ouro) e implementar `Sprites.desenhar` com `fillRect` por pixel.
- [ ] **Step 4: Rodar e ver `RESULTADO: OK`.**
- [ ] **Step 5: Commit**

```bash
git add jogo/sprites.js tests/navegador.html && git commit -m "feat: sprites em matriz de pixels"
```

### Task 6: Jogo (fases, HUD, personagem, teclado)

**Files:**
- Modify: `jogo/jogo.js`, `index.html`, `en/index.html`
- Test: `tests/navegador.html`

**Interfaces:**
- Consumes: `Ceu.iniciar`, `Sprites.astronauta`.
- Produces: `Jogo.faseAtual(topos: number[], y: number): number` (índice da última fase cujo topo é ≤ `y`; `-1` não é permitido, retorna 0) e `Jogo.progresso(y: number, altura: number, viewport: number): number` (0..1, 0 se `altura <= viewport`).

- [ ] **Step 1: Testes** no `navegador.html`: `faseAtual([0,800,1600,2400,3200,4000], 0) === 0`; `(…, 900) === 1`; `(…, 99999) === 5`; `(…, -50) === 0`; `progresso(0, 5000, 800) === 0`; `progresso(4200, 5000, 800) === 1`; `progresso(0, 500, 800) === 0`.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar `Jogo.faseAtual` e `Jogo.progresso`** e a parte de DOM: ao rolar (com `requestAnimationFrame`), atualizar `#hud-fase` com o `h2` da fase, `#hud-altitude`, o link ativo do menu (`aria-current`), e a pose do astronauta (subindo enquanto rola, parado após 300ms sem rolar, pulo ao trocar de fase); chamar `Ceu.iniciar(#ceu, () => progresso)`. O título de cada fase "digita" uma vez ao entrar na tela (0,4s) e pula a animação com `prefers-reduced-motion`.
- [ ] **Step 4: Teclado**: `Tab` navega pelos links e menu com foco visível; links "pular para o conteúdo" no início da página; teclas não são capturadas além das padrão do navegador.
- [ ] **Step 5: Esconder o astronauta em telas estreitas** (`@media (max-width: 640px)`: menor ou oculto, sem cobrir texto).
- [ ] **Step 6: Rodar `RESULTADO: OK`, `tests/estrutura.py` e conferir no navegador, em desktop e celular emulado, que HUD, menu e salto funcionam.**
- [ ] **Step 7: Commit**

```bash
git add jogo index.html en/index.html tests && git commit -m "feat: HUD, fases, personagem e teclado"
```

### Task 7: Verificação final e capturas

**Files:**
- Test: `tests/navegador.html`, `tests/estrutura.py`, `tests/contraste.py`

- [ ] **Step 1: Rodar as três verificações automáticas** (`estrutura.py`, `contraste.py`, `navegador.html`). Expected: todas `OK`.
- [ ] **Step 2: Capturas** de PT e EN em 5 posições de rolagem (início, fases 1 a 3, contato), em 1280x800 e 390x844, e conferir olhando que os painéis se destacam do fundo e que o texto está legível.
- [ ] **Step 3: Console sem erros** rolando do início ao fim nos dois idiomas.
- [ ] **Step 4: Peso e desempenho**: somar o tamanho dos arquivos servidos (esperado abaixo de 1 MB) e confirmar fluidez da rolagem.
- [ ] **Step 5: Casos extremos**: `prefers-reduced-motion` ligado, canvas removido (`document.getElementById('ceu').remove()` ainda deixa a página legível com o fundo CSS), JavaScript desativado, zoom de 200%.
- [ ] **Step 6: Relatar ao Caio** o que passou e o que não passou, com as capturas, e perguntar se envia ao GitHub (não enviar sem a resposta).
- [ ] **Step 7: Commit final** (se houver ajustes)

```bash
git add -A && git commit -m "chore: ajustes finais do portfolio em jogo"
```
