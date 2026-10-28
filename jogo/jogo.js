/* Jogo: le a rolagem, calcula a fase e o progresso, e atualiza HUD, menu, personagem e o canvas do ceu. */
(function (global) {
  'use strict';

  function faseAtual(topos, y) {
    y = Number(y);
    if (!isFinite(y)) return 0;
    var r = 0;
    for (var i = 0; i < topos.length; i++) if (topos[i] <= y) r = i;
    return r;
  }

  function progresso(y, altura, viewport) {
    var max = altura - viewport;
    y = Number(y);
    if (!(max > 0) || !isFinite(y)) return 0;
    return y <= 0 ? 0 : y >= max ? 1 : y / max;
  }

  global.Jogo = { faseAtual: faseAtual, progresso: progresso };

  var doc = global.document;
  if (!doc || !doc.getElementById('ceu')) return; // paginas de teste nao tem o jogo

  var secoes = [].slice.call(doc.querySelectorAll('main > section'));
  var links = [].slice.call(doc.querySelectorAll('.fases a'));
  var rotulo = doc.getElementById('hud-fase');
  var barra = doc.querySelector('#hud-altitude span');
  var tela = doc.getElementById('astronauta');
  var ctxA = tela && tela.getContext ? tela.getContext('2d') : null;
  var reduz = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var topos = [], t = 0, fase = -1, pose = 'parado', ocupado = false, timerParado = 0, timerPulo = 0;

  function medir() {
    var y = global.pageYOffset || 0, hud = doc.querySelector('.hud');
    if (hud) doc.documentElement.style.setProperty('--hud-altura', Math.ceil(hud.getBoundingClientRect().height) + 'px');
    topos = secoes.map(function (s) { return s.getBoundingClientRect().top + y; });
  }

  function desenharPersonagem() {
    if (!ctxA || !global.Sprites) return;
    ctxA.clearRect(0, 0, tela.width, tela.height);
    global.Sprites.desenhar(ctxA, global.Sprites.astronauta[pose], 0, 0, 1);
  }

  function mudarPose(nova) {
    if (tela) tela.classList.toggle('sobe', nova === 'subindo'); // as poses usam o mesmo desenho; o balanco vem do CSS
    if (nova !== pose) { pose = nova; desenharPersonagem(); }
  }

  function atualizar() {
    ocupado = false;
    var y = global.pageYOffset || 0, vh = global.innerHeight || 1;
    t = progresso(y, doc.documentElement.scrollHeight, vh);
    var i = faseAtual(topos, y + vh * 0.35);
    if (barra) barra.style.width = (t * 100).toFixed(1) + '%';
    if (i !== fase) {
      var primeira = fase === -1;
      fase = i;
      if (rotulo && secoes[i]) rotulo.textContent = secoes[i].getAttribute('data-fase') || '';
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + secoes[i].id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      if (!primeira && tela && !reduz.matches) {
        mudarPose('pulo'); tela.classList.add('pulo');
        clearTimeout(timerPulo);
        timerPulo = setTimeout(function () { tela.classList.remove('pulo'); mudarPose('parado'); }, 450);
      }
    }
    if (pose !== 'pulo') mudarPose('subindo');
    clearTimeout(timerParado);
    timerParado = setTimeout(function () { if (pose !== 'pulo') mudarPose('parado'); }, 300);
  }

  function aoRolar() { if (!ocupado) { ocupado = true; global.requestAnimationFrame(atualizar); } }

  function digitarTitulos() {
    if (reduz.matches || !('IntersectionObserver' in global)) return;
    var obs = new global.IntersectionObserver(function (itens) {
      itens.forEach(function (it) {
        if (!it.isIntersecting) return;
        var alvo = it.target;
        alvo.classList.add('digita'); obs.unobserve(alvo);
        setTimeout(function () { alvo.classList.remove('digita'); }, 1000); // rede de seguranca se a animacao travar
      });
    }, { threshold: 0.6 });
    // So os titulos de fase (h2): o nome no h1 nunca pode ficar escondido por uma animacao (capturas, previas, PDF).
    [].slice.call(doc.querySelectorAll('main h2')).forEach(function (h) { obs.observe(h); });
  }

  var ano = doc.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
  medir();
  desenharPersonagem();
  atualizar(); pose = 'parado'; desenharPersonagem();
  global.addEventListener('scroll', aoRolar, { passive: true });
  global.addEventListener('resize', function () { medir(); aoRolar(); });
  global.addEventListener('load', function () { medir(); aoRolar(); });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { medir(); aoRolar(); });
  digitarTitulos();
  if (global.Ceu) global.Ceu.iniciar(doc.getElementById('ceu'), function () { return t; });
})(window);
