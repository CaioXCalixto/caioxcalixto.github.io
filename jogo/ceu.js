/* Ceu: funcoes puras (cores por posicao, estrelas) e, mais adiante, o desenho no canvas.
   Nao conhece o conteudo da pagina: recebe t (0..1) e desenha. */
(function (global) {
  'use strict';

  // 5 pontos-chave (t = 0, .25, .5, .75, 1), 8 faixas de cima para baixo.
  var PONTOS = [
    ['#1d2260', '#2a2670', '#3b2f80', '#5b3a8c', '#8a4a8f', '#c4607f', '#ff9a62', '#ffc07a'], // crepusculo
    ['#14194a', '#1d2260', '#2a2670', '#3b2f80', '#5b3a8c', '#7a4690', '#b05a85', '#e07a6e'],
    ['#0b0e2a', '#0e1438', '#121a46', '#1d2260', '#232a6d', '#2a2670', '#3b2f80', '#4b3590'], // azul-noite
    ['#080a22', '#0a0e2a', '#0b0e2a', '#0d1235', '#101640', '#141a4a', '#1d2260', '#262c6e'],
    ['#05061a', '#05061a', '#070820', '#080a22', '#0a0b26', '#0b0e2a', '#0b0e2a', '#0d1030']  // espaco
  ];

  function limitar(t) {
    t = Number(t);
    if (!isFinite(t)) return 0;
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }

  function canal(hex, i) { return parseInt(hex.substr(1 + i * 2, 2), 16); }

  function misturar(a, b, k) {
    var out = '#';
    for (var i = 0; i < 3; i++) {
      var v = Math.round(canal(a, i) + (canal(b, i) - canal(a, i)) * k);
      out += (v < 16 ? '0' : '') + v.toString(16);
    }
    return out;
  }

  function faixas(t) {
    t = limitar(t);
    var pos = t * (PONTOS.length - 1);
    var i = Math.min(Math.floor(pos), PONTOS.length - 2);
    var k = pos - i, res = [];
    for (var f = 0; f < 8; f++) res.push(misturar(PONTOS[i][f], PONTOS[i + 1][f], k));
    return res;
  }

  function aleatorio(semente) { // mulberry32
    var a = semente >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function estrelas(semente, n) {
    var rnd = aleatorio(semente), lista = [];
    for (var i = 0; i < n; i++) {
      var r = rnd();
      var camada = r < 0.55 ? 1 : r < 0.80 ? 2 : r < 0.95 ? 3 : 4;
      lista.push({ x: rnd(), y: rnd(), camada: camada, fase: rnd() });
    }
    return lista;
  }

  function quantidade(t, celular) {
    var base = Math.floor(30 + 370 * limitar(t));
    return celular ? Math.floor(base / 2) : base;
  }

  /* ---------- desenho ---------- */
  var VEL = [0.05, 0.20, 0.35, 0.70];     // fracao do deslocamento da pagina por camada de estrela
  var TAM = [1, 1, 2, 3];                 // tamanho em pixels do canvas
  var COR = ['#9aa3d6', '#f4ecd0', '#ffffff', '#ffd86b'];
  var TODAS = null, NEBULOSA = {};

  function todasAsEstrelas() { return TODAS || (TODAS = estrelas(7, 400)); }

  function suave(a, b, x) { var k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); }

  // Nebulosa pre-renderizada uma vez por largura: manchas com dithering em xadrez.
  function nebulosa(w) {
    if (NEBULOSA[w]) return NEBULOSA[w];
    var alt = w * 2, c = document.createElement('canvas'); c.width = w; c.height = alt;
    var g = c.getContext('2d'), rnd = aleatorio(11);
    var cores = ['#5b3a8c', '#2a2670', '#7a4690'];
    for (var m = 0; m < 5; m++) {
      var cx = rnd() * w, cy = rnd() * alt, r = 22 + rnd() * 30;
      g.fillStyle = cores[m % cores.length];
      for (var y = Math.max(0, Math.floor(cy - r)); y < Math.min(alt, cy + r); y++) {
        for (var x = Math.max(0, Math.floor(cx - r)); x < Math.min(w, cx + r); x++) {
          var d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
          if (d < r * 0.55 || (d < r && ((x + y) & 1) === 0)) g.fillRect(x, y, 1, 1);
        }
      }
    }
    return (NEBULOSA[w] = c);
  }

  // Deslocamento de parallax em pixels do canvas. Com reduzir-movimento ligado nao ha parallax (spec 5).
  function deslocamento(t, h, k, reduzido) { return reduzido ? 0 : limitar(t) * h * k; }

  // A cidade ocupa metade da largura do canvas (a faixa se repete), para nao dominar a tela.
  function escalaCidade(w, larguraMatriz) {
    w = Number(w);
    if (!(w > 0) || !(larguraMatriz > 0)) return 1;
    return Math.max(1, Math.round(w / (larguraMatriz * 2)));
  }

  function desenhar(ctx, w, h, t, tempo, opcoes) {
    if (!ctx || !(w > 0) || !(h > 0)) return;
    opcoes = opcoes || {};
    t = limitar(t);
    var reduzido = !!opcoes.reduzido, alcance = opcoes.alcance > 0 ? opcoes.alcance : 4;
    var mx = reduzido ? 0 : (opcoes.mouseX || 0), my = reduzido ? 0 : (opcoes.mouseY || 0);

    // 1. gradiente em faixas, com uma linha de dithering em cada divisa
    var cores = faixas(t), alt = Math.ceil(h / 8);
    for (var f = 0; f < 8; f++) {
      ctx.fillStyle = cores[f];
      ctx.fillRect(0, f * alt, w, alt + 1);
      if (f > 0) {
        ctx.fillStyle = cores[f - 1];
        for (var x = f & 1; x < w; x += 2) ctx.fillRect(x, f * alt, 1, 1);
      }
    }

    // 2. nebulosa (15% da rolagem), aparece conforme sobe
    var op = suave(0.12, 0.55, t);
    if (op > 0) {
      var neb = nebulosa(w), off = Math.floor(deslocamento(t, h, 0.15, reduzido)) % neb.height;
      ctx.globalAlpha = 0.55 * op;
      ctx.drawImage(neb, 0, -off);
      ctx.drawImage(neb, 0, neb.height - off);
      ctx.globalAlpha = 1;
    }

    // 3. estrelas por camada
    var lista = todasAsEstrelas(), n = Math.min(lista.length, quantidade(t, !!opcoes.celular));
    for (var i = 0; i < n; i++) {
      var s = lista[i], c = s.camada - 1;
      if (!reduzido && Math.sin(tempo / 600 + s.fase * 6.2832) < -0.55 && c < 2) continue; // piscar
      var px = s.x * w + (c === 3 ? mx * 4 : 0);
      var py = s.y * h - deslocamento(t, h, VEL[c] * alcance * 0.25, reduzido) + (c === 3 ? my * 4 : 0);
      py = ((py % h) + h) % h;
      var tam = TAM[c], xi = Math.floor(px), yi = Math.floor(py);
      ctx.fillStyle = COR[c];
      ctx.fillRect(xi, yi, tam, tam);
      if (c === 2) { ctx.fillRect(xi - 1, yi, 1, tam); ctx.fillRect(xi + tam, yi, 1, tam); ctx.fillRect(xi, yi - 1, tam, 1); ctx.fillRect(xi, yi + tam, tam, 1); }
    }

    // 4. cidade (so no inicio, rola a 100%) e lua (no topo, 20%)
    var Sp = global.Sprites;
    if (Sp && Sp.desenhar) {
      if (t < 0.25 && Sp.cidade) {
        var ch = Sp.cidade.length, larg = Sp.cidade[0].length, esc = escalaCidade(w, larg);
        var yc = Math.round(h - ch * esc + deslocamento(t, h, alcance, reduzido));
        for (var xc = 0; xc < w; xc += larg * esc) Sp.desenhar(ctx, Sp.cidade, xc, yc, esc);
      }
      if (t > 0.85 && Sp.lua) {
        var lh = Sp.lua.length, k = reduzido ? 1 : suave(0.85, 1, t);
        Sp.desenhar(ctx, Sp.lua, Math.round(w * 0.72), Math.round(-lh * 2 + k * (lh * 2 + h * 0.18)), 2);
      }
    }
  }

  function iniciar(canvas, lerT) {
    var LARGURA = 320, ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return { parar: function () {} }; }
    var mqReduz = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var fino = global.matchMedia ? global.matchMedia('(pointer: fine)').matches : false;
    var mouse = { x: 0, y: 0 }, ultimoT = -1, ultimoBloco = -1, ultimoQuadro = 0, id = 0, parado = false;

    function ajustar() {
      var proporcao = (global.innerWidth > 0 && global.innerHeight > 0) ? global.innerHeight / global.innerWidth : 1.6;
      canvas.width = LARGURA; canvas.height = Math.max(1, Math.round(LARGURA * proporcao));
      ctx.imageSmoothingEnabled = false; ultimoT = -1;
    }
    function aoMover(e) { mouse.x = (e.clientX / global.innerWidth) * 2 - 1; mouse.y = (e.clientY / global.innerHeight) * 2 - 1; ultimoT = -1; }
    function quadro(agora) {
      if (parado) return;
      id = global.requestAnimationFrame(quadro);
      if (agora - ultimoQuadro < 33 || document.hidden) return; // no maximo 30 quadros por segundo; parado com a aba oculta
      ultimoQuadro = agora;
      var t = limitar(lerT()), reduzido = mqReduz.matches, bloco = reduzido ? 0 : Math.floor(agora / 120);
      if (t === ultimoT && bloco === ultimoBloco) return;
      ultimoT = t; ultimoBloco = bloco;
      var doc = document.documentElement, alcance = (doc.scrollHeight - global.innerHeight) / Math.max(1, global.innerHeight);
      try {
        desenhar(ctx, canvas.width, canvas.height, t, agora, { celular: global.innerWidth <= 640, reduzido: reduzido, mouseX: mouse.x, mouseY: mouse.y, alcance: alcance > 0 ? alcance : 4 });
      } catch (e) { parar(); canvas.remove(); }
    }
    function parar() {
      parado = true; global.cancelAnimationFrame(id);
      global.removeEventListener('resize', ajustar);
      if (fino) global.removeEventListener('pointermove', aoMover);
    }
    ajustar();
    global.addEventListener('resize', ajustar);
    if (fino) global.addEventListener('pointermove', aoMover, { passive: true });
    id = global.requestAnimationFrame(quadro);
    return { parar: parar };
  }

  global.Ceu = { faixas: faixas, estrelas: estrelas, quantidade: quantidade, desenhar: desenhar, iniciar: iniciar, escalaCidade: escalaCidade, deslocamento: deslocamento, _limitar: limitar };
})(window);
