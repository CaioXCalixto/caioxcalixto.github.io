/* Sprites em matrizes de pixels. Cada caractere e uma chave da paleta; '.' e transparente. */
(function (global) {
  'use strict';

  var paleta = {
    // lua
    l: '#f4ecd0', m: '#c9c2a0', k: '#9aa3d6',
    // cidade
    s: '#0b0e2a', h: '#1d2260', j: '#ffd86b',
    // avatar do Caio (gerado por tools/gera-avatar.html a partir de _fonte/avatar-original.png)
    0: '#08070a',
    1: '#151e45',
    2: '#bb6e3e',
    3: '#161519',
    4: '#92502d',
    5: '#362117',
    6: '#333133',
    7: '#abaaa8',
    8: '#413e41',
    9: '#7b4225',
    A: '#5f3520',
    B: '#bfa18c',
    C: '#a36036',
    E: '#f9f7f1',
    F: '#e8d4c3',
    G: '#dfbda6',
    I: '#a38f80',
    J: '#906a58',
    K: '#835c4a',
    M: '#c2c0bd',
    N: '#81807f',
    O: '#4f4d4e',
    P: '#ece5dd',
    Q: '#63667c',
    R: '#c59373'
  };

  // Personagem 24x41: o avatar pixelado do Caio. As tres poses usam o mesmo desenho; o movimento vem do CSS.
  var AVATAR = [
    '......0000.000.00.......',
    '....03633000330030.0....',
    '...03333330330000330....',
    '...336003333303303330...',
    '..05533033300333033300..',
    '.0300030033333033303300.',
    '030330030033300330030330',
    '030333300300003300330330',
    '.0003300033333333000330.',
    '00000094339CA3A493300330',
    '.00055C2CC22CCC2CC430030',
    '..004222222222222224000.',
    '.0004M0000222200002400..',
    '.000402222222222222400..',
    '0CC04M000022220000240CC.',
    '0240422E0022222E0024042.',
    '0240422E0022222E0024042.',
    '04404222222222222224044.',
    '04404222222000222224044.',
    '....3422220444022243....',
    '.....04422222222440.....',
    '......0004400440000000..',
    '......30EE4444EE0M7NI70.',
    '.....6O0EEE22EEE0776670.',
    '....0OO011E22E11077IQ70.',
    '...13O8011QOOQ110777770.',
    '..3138601111111107I42210',
    '..31386011111111076C2210',
    '..3136311111111115022210',
    '.31133011111111116302410',
    '.31110111111111111860330',
    '.0131011111111111158000.',
    '..9225111111111111680...',
    '..94C5333333333333060...',
    '...35011111301111100....',
    '.....01111100111110.....',
    '.....01111100111110.....',
    '.....01111300311130.....',
    '.....333333303333330....',
    '....0888888308888880....',
    '....0000000..0000000....'
  ];

  // Lua 20x20: disco com sombra a direita e tres crateras.
  function criaLua() {
    var linhas = [], r = 9.5;
    for (var y = 0; y < 20; y++) {
      var s = '';
      for (var x = 0; x < 20; x++) {
        var dx = x - 9.5, dy = y - 9.5, d = Math.sqrt(dx * dx + dy * dy), c = '.';
        if (d <= r) c = dx > 3.5 && d > 6 ? 'm' : 'l';
        if (c !== '.' && ((x - 6) * (x - 6) + (y - 6) * (y - 6) <= 2 || (x - 12) * (x - 12) + (y - 12) * (y - 12) <= 3 || (x - 8) * (x - 8) + (y - 14) * (y - 14) <= 1)) c = 'k';
        s += c;
      }
      linhas.push(s);
    }
    return linhas;
  }

  // Cidade 80x24: predios distantes (h) e proximos (s), janelas (j) e chao continuo nas duas ultimas linhas.
  function criaCidade() {
    var W = 80, H = 24, g = [], seed = 5;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var y = 0; y < H; y++) g.push(new Array(W + 1).join('.').split(''));
    function predio(x0, larg, alt, ch, janelas) {
      for (var y = H - alt; y < H; y++) for (var x = x0; x < Math.min(W, x0 + larg); x++) {
        g[y][x] = ch;
        if (janelas && y < H - 2 && x > x0 && x < x0 + larg - 1 && (x - x0) % 2 === 1 && (H - y) % 3 === 0 && rnd() < 0.6) g[y][x] = 'j';
      }
    }
    for (var x = 0; x < W;) { var l = 4 + Math.floor(rnd() * 6), a = 8 + Math.floor(rnd() * 8); predio(x, l, a, 'h', false); x += l + Math.floor(rnd() * 2); }
    for (x = 0; x < W;) { l = 5 + Math.floor(rnd() * 5); a = 5 + Math.floor(rnd() * 9); predio(x, l, a, 's', true); x += l + Math.floor(rnd() * 3); }
    for (y = H - 2; y < H; y++) for (x = 0; x < W; x++) g[y][x] = 's';
    return g.map(function (l) { return l.join(''); });
  }

  function desenhar(ctx, matriz, x, y, escala) {
    if (!ctx || !matriz) return;
    escala = escala > 0 ? escala : 1;
    for (var r = 0; r < matriz.length; r++) {
      var linha = matriz[r];
      for (var c = 0; c < linha.length; c++) {
        var cor = paleta[linha[c]];
        if (!cor) continue;
        ctx.fillStyle = cor;
        ctx.fillRect(x + c * escala, y + r * escala, escala, escala);
      }
    }
  }

  global.Sprites = {
    paleta: paleta,
    astronauta: { parado: AVATAR, subindo: AVATAR, pulo: AVATAR },
    lua: criaLua(),
    cidade: criaCidade(),
    desenhar: desenhar
  };
})(window);
