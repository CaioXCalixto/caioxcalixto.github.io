# Portfólio em formato de jogo (pixel art 2D): design

Data: 2026-10-28. Autor: Caio Calixto. Status: aguardando revisão.

## 1. Objetivo e público

Transformar o portfólio atual (`index.html` em PT, `en/index.html` em EN) em uma experiência interativa de pixel art 2D, com céu estrelado e parallax ligado à posição de rolagem.

- Público principal: recrutadores e quem contrata sites. O jogo não pode atrapalhar quem só quer ler o currículo.
- Sucesso: em 5 segundos a pessoa entende que é um portfólio; acha cada seção sem instrução; lê tudo com conforto; roda sem travar em celular comum.

## 2. Restrições

- Site estático no GitHub Pages, sem backend, sem cookies e sem rastreamento.
- Duas páginas: `/` (PT) e `/en/` (EN), com o mesmo conteúdo e botão PT | EN.
- Conteúdo em HTML real e semântico. O jogo é uma camada visual; o texto continua legível, indexável e acessível sem JavaScript.
- Não publicar telefone nem endereço. Não citar clientes nem sistemas confidenciais da Lopes Bahia.
- A versão atual (commit `8b6c497`) permanece como versão de segurança. Nada é enviado ao GitHub sem aprovação do Caio.

## 3. Navegação e fases

Uma página longa, rolagem vertical normal. Rolar para baixo na página é "subir" na história: quanto mais à frente, mais alto e mais escuro o céu.

| Fase | Conteúdo | Céu |
|---|---|---|
| Início | Nome, frase de apresentação, "role para subir" | Crepúsculo: laranja no horizonte, roxo acima, silhueta de cidade no chão |
| 1. Quem sou eu | Perfil e 4 conquistas (Google 2º/3º, campeão estadual, Rio Innovation Week, inglês) | Roxo para índigo, primeiras estrelas |
| 2. Projetos | Sites e SEO para advocacia, automações internas, OrderFlow QA, Fighting Space | Índigo, nebulosa distante |
| 3. Experiência | Lopes Bahia, Atlética UERJ, Adventures In Space Studios (com link) | Azul-noite, estrelas médias |
| 4. Habilidades e formação | Skills, UERJ, FAETEC | Azul quase preto, estrelas densas |
| Final | Contato: e-mail, LinkedIn, GitHub | Espaço aberto, lua pixelada |

HUD fixo: barra fina no topo com nome da fase atual, botão PT | EN e medidor de altitude (progresso). Menu de fases clicável e por teclado. O astronauta fica no canto inferior e sobe com a rolagem, com um pequeno salto a cada troca de fase.

## 4. Painéis e tipografia

- Painel: fundo `#0d1030` a 94% (nunca transparente), borda de pixel de 4px em `#f4ecd0` com cantos em degraus, sombra dura de 6px sem desfoque. Título da fase em `#ffd86b`, texto em `#f4ecd0`. Contraste mínimo exigido: 7:1.
- Hierarquia: três tamanhos de borda e espaçamento (painel de fase, painel de item, selo de conquista). Alinhamento à esquerda, até 70 caracteres por linha.
- Fontes (ficam no repositório, `.woff2`, sem Google Fonts): Press Start 2P só em títulos curtos e rótulos do HUD; Pixelify Sans (ou VT323 se ficar pesada) no corpo, 18 a 20px. Escala em múltiplos de 4: abertura 40, fase 24, subtítulo 16, corpo 19 (arredondar para a grade).
- Interação: o título digita uma vez por fase (0,4s). Foco de teclado em contorno de ouro de 4px. Botões sobem 2px no hover e descem 2px ao clicar.
- Paleta: noite `#0b0e2a`, índigo `#1d2260`, horizonte `#5b3a8c`, brasa `#ff9a62`, ouro `#ffd86b`, creme `#f4ecd0`.
- Conquistas viram selos pixelados na fase 1; é o único ponto de tom "gamificado" nos painéis.

## 5. Céu e parallax

Um `<canvas>` fixo, atrás do conteúdo, desenha em baixa resolução (cerca de 320px de largura) e é ampliado com `image-rendering: pixelated`. A entrada é um único número `t` de 0 a 1 (rolagem).

| Camada | Descrição | Velocidade |
|---|---|---|
| Gradiente | Faixas de cor em degraus, interpoladas por `t` | muda de cor |
| Estrelas distantes | 1px, muitas, piscam devagar | 5% |
| Nebulosa | Manchas roxas e azuis com dithering | 15% |
| Estrelas médias | 2px e cruzes pequenas | 35% |
| Estrelas próximas e cometa raro | Poucas, maiores | 70% |
| Chão | Silhueta da cidade, só no início | 100% |
| Lua | Aparece no topo | 20% |

- Quantidade de estrelas cresce com `t`. Posições geradas por semente fixa (igual em toda visita).
- Mouse desloca as camadas próximas até 4px, só em dispositivos com ponteiro fino.
- Redesenha só ao rolar ou ao piscar, no máximo 30 quadros por segundo; para quando a aba está oculta. No celular, metade das estrelas.
- Se "reduzir movimento" estiver ligado: sem piscar e sem parallax, apenas troca de cor por fase.
- Falha do canvas: fundo vira degradê CSS simples e o conteúdo continua legível.
- Astronauta cerca de 16x24px, desenhado em matriz de pixels (`sprites.js`), poses: parado, subindo, pulo. Menor ou oculto em telas estreitas para não cobrir texto.

## 6. Arquivos e responsabilidades

```
Portfolio/
  index.html, en/index.html     conteúdo e estrutura apenas
  jogo/estilo.css               tokens de cor, painéis, HUD, tipografia
  jogo/ceu.js                   canvas; recebe t (0..1) e desenha; não conhece o conteúdo
  jogo/jogo.js                  rolagem, fase atual, HUD, teclado, personagem
  jogo/sprites.js               matrizes de pixel (astronauta, lua, cidade)
  jogo/fontes/                  .woff2 locais
  docs/superpowers/specs/       esta spec
```

PT e EN compartilham os mesmos arquivos em `jogo/` (caminhos relativos corretos em `en/`).

## 7. Acessibilidade, SEO e privacidade

- HTML semântico (`main`, `section`, `h2`) em ordem lógica; canvas e personagem com `aria-hidden`.
- Link "pular para o conteúdo", menu de fases por teclado, foco visível.
- Título, descrição, JSON-LD (Person) e `hreflang` PT/EN mantidos.
- Fontes e scripts locais; nenhuma requisição a terceiros, exceto links de saída.

## 8. Testes de aceitação

1. Abrir PT e EN em navegador real; capturas em 5 pontos de rolagem, celular e desktop; conferir contraste e destaque dos painéis sobre o fundo.
2. Rolar do início ao fim sem erros no console.
3. Desktop sem travar a 30 quadros por segundo; carga total abaixo de 1 MB.
4. Testar com "reduzir movimento" ligado e com o canvas desativado.
5. Links (LinkedIn, GitHub, estúdio) abrem; PT e EN têm o mesmo conteúdo; script verifica contraste 7:1.

## 9. Fora do escopo desta versão

Áudio, salvamento de progresso, jogo com colisão ou pontuação, e novos textos do estágio (entram depois, em ambos os idiomas).

## 10. Decisões em aberto

Nenhuma bloqueia o plano. Pendentes de dados do Caio: textos maiores do estágio, link do Fighting Space e do repositório OrderFlow QA, foto (opcional).
