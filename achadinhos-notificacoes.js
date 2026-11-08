/*
 * Banner "Ative as notificacoes do Achadinhos" (achadinhos.tv.br). O mesmo arquivo esta em todos os sites do Rick.
 * O botao "Ativar notificacoes" ativa o push AQUI MESMO: pede a permissao, registra o achadinhos-sw.js (escopo
 * proprio, /achadinhos-push/, para nao mexer em outro service worker do site) e manda a inscricao para o servidor do
 * Achadinhos, que avisa de cada promocao nova com a mesma chave VAPID. O toque no aviso abre a oferta no Achadinhos.
 * Onde o navegador nao aceita push (iPhone fora da Tela de Inicio, navegador de app), o botao abre
 * www.achadinhos.tv.br/notificacoes.
 * Tocar em qualquer lugar do banner ativa (com a janela aberta, em qualquer lugar da tela); so o X fecha.
 * Aparece so uma janela no meio da tela, 3 s depois de abrir o site; fechada no X, volta na proxima visita.
 * Nao aparece para quem ja ativou nem em paginas de admin/login (no Getfindsy e no EmbroidHub, so em navegador em portugues).
 */
(function () {
  if (window.__achPush) return;
  window.__achPush = 1;
  var ACH = 'https://www.achadinhos.tv.br';
  var DIA = 86400000;
  var host = location.hostname.replace(/^www\./, '');
  if (/(^|\.)achadinhos\.tv\.br$/.test(host)) return;
  if (/^\/(admin|painel|login|entrar|dashboard)(\/|$)/i.test(location.pathname)) return;
  var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'pt-BR']).join(',');
  // Nos sites em ingles (Getfindsy, EmbroidHub) so aparece para quem usa o navegador em portugues; nos outros, para todos.
  if (/getfindsy|embroidhub/i.test(host) && !/(^|,)pt/i.test(langs)) return;

  // O service worker fica na mesma pasta deste arquivo (funciona tambem em site publicado numa subpasta).
  var me = document.currentScript && document.currentScript.src;
  var base = me ? me.slice(0, me.lastIndexOf('/') + 1) : location.origin + '/';
  var SW = base + 'achadinhos-sw.js', SCOPE = base + 'achadinhos-push/';

  var ls = {
    get: function (k) { try { return Number(localStorage.getItem('achPush:' + k)) || 0; } catch (e) { return 0; } },
    set: function (k) { try { localStorage.setItem('achPush:' + k, String(Date.now())); } catch (e) {} },
  };
  var ss = {
    get: function (k) { try { return sessionStorage.getItem('achPush:' + k); } catch (e) { return null; } },
    set: function (k) { try { sessionStorage.setItem('achPush:' + k, '1'); } catch (e) {} },
  };

  var ua = navigator.userAgent;
  var ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var push = window.isSecureContext !== false && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !(ios && !standalone);
  if (push && Notification.permission === 'denied') push = false;
  // Sem push aqui: o botao vira link para a pagina do Achadinhos. Quem tocou nele nao ve mais por 30 dias.
  if (!push && Date.now() - ls.get('ativou') < 30 * DIA) return;

  var link = ACH + '/notificacoes?origem=' + encodeURIComponent(host) + '&utm_source=' + encodeURIComponent(host) + '&utm_medium=banner&utm_campaign=notificacoes';
  var TXT = 'Ative as notifica\u00e7\u00f5es e receba no celular as promo\u00e7\u00f5es novas do Achadinhos assim que elas entrarem no site.';
  var sino = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
  var css = ':host{all:initial}*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}' +
    '.bar,.ov,.card{cursor:pointer}.bar{position:fixed;z-index:2147483646;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top));max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:16px;padding:16px 48px 16px 18px;border-radius:18px;background:linear-gradient(135deg,#ff6a00,#ff9a3c);color:#fff;box-shadow:0 10px 34px rgba(0,0,0,.35);animation:down .45s ease-out}' +
    '.ico{flex:none;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.22);display:grid;place-items:center}.ico svg{width:26px;height:26px;animation:ring 2.4s ease-in-out infinite;transform-origin:50% 10%}' +
    '.txt{flex:1;min-width:0}.t{margin:0 0 3px;font-size:18px;font-weight:800;line-height:1.2}.m{margin:0;font-size:14px;line-height:1.4;opacity:.95}' +
    '.btn{flex:none;display:inline-block;border:0;border-radius:999px;background:#fff;color:#d94f00;font-weight:800;font-size:15px;padding:13px 22px;text-decoration:none;text-align:center;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(0,0,0,.12);animation:pulse 1.8s ease-in-out infinite}.btn:hover{background:#fff1e6}.btn[disabled]{opacity:.75;cursor:default;animation:none}' +
    '.x{position:absolute;top:6px;right:8px;border:0;background:none;color:#fff;font-size:26px;line-height:1;padding:6px;cursor:pointer;opacity:.85}' +
    '.ok{background:linear-gradient(135deg,#12a150,#2bc06c)!important}.ok .btn,.ok .no{display:none!important}' +
    '.ov{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:16px;animation:fade .25s ease-out}' +
    '.card{position:relative;width:100%;max-width:400px;border-radius:22px;overflow:hidden;background:#fff;color:#1d1d1f;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.4);animation:pop .35s ease-out}' +
    '.top{background:linear-gradient(135deg,#ff6a00,#ff9a3c);color:#fff;padding:26px 20px 22px}.top .ico{width:72px;height:72px;margin:0 auto 12px}.top .ico svg{width:38px;height:38px}.top .t{font-size:22px}' +
    '.card.ok .top{background:linear-gradient(135deg,#12a150,#2bc06c)}.card.ok{background:#fff!important}' +
    '.body{padding:18px 22px 22px}.body .m{font-size:15px;opacity:1;color:#444;margin-bottom:16px}.card .btn{display:block;width:100%;background:linear-gradient(135deg,#ff6a00,#ff8a1f);color:#fff;font-size:17px;padding:15px;animation:pulse2 1.8s ease-in-out infinite}' +
    '.no{display:block;margin:12px auto 0;border:0;background:none;color:#888;font-size:14px;cursor:pointer;text-decoration:underline;font-family:inherit}.card .x{color:#fff}' +
    '@keyframes down{from{transform:translateY(-130%);opacity:0}to{transform:none;opacity:1}}@keyframes fade{from{opacity:0}}@keyframes pop{from{transform:scale(.85);opacity:0}}' +
    '@keyframes ring{0%,70%,100%{transform:rotate(0)}75%{transform:rotate(14deg)}80%{transform:rotate(-12deg)}85%{transform:rotate(8deg)}90%{transform:rotate(-4deg)}}' +
    '@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.75)}50%{box-shadow:0 0 0 9px rgba(255,255,255,0)}}@keyframes pulse2{0%,100%{box-shadow:0 0 0 0 rgba(255,106,0,.55)}50%{box-shadow:0 0 0 10px rgba(255,106,0,0)}}' +
    '@media (max-width:640px){.bar{flex-wrap:wrap;padding:12px 40px 12px 12px;gap:10px}.ico{width:42px;height:42px}.t{font-size:16px}.m{font-size:13px}.bar .btn{flex-basis:100%;padding:13px}}' +
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';

  var root, shadow, boxes = [], fim = false;
  function mount() {
    if (root) return;
    root = document.createElement('div');
    root.id = 'achadinhos-notificacoes';
    shadow = root.attachShadow ? root.attachShadow({ mode: 'open' }) : root;
    // Folha de estilo construida (passa por CSP sem 'unsafe-inline'); navegador antigo usa <style>.
    try {
      var sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      shadow.adoptedStyleSheets = [sheet];
    } catch (e) {
      var st = document.createElement('style');
      st.textContent = css;
      shadow.appendChild(st);
    }
    document.body.appendChild(root);
  }
  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.firstChild;
  }
  function botao(label) {
    return push ? '<button class="btn" type="button">' + label + '</button>'
      : '<a class="btn" target="_blank" rel="noopener" href="' + link + '">' + label + '</a>';
  }
  // Mostra o mesmo recado na barra e na janela.
  function aviso(text, ok) {
    boxes.forEach(function (b) {
      var m = b.querySelector('.m'); if (m) m.textContent = text;
      if (ok) { b.classList.add('ok'); var t = b.querySelector('.t'); if (t) t.textContent = 'Notifica\u00e7\u00f5es ativadas!'; }
    });
    if (ok) { fim = true; setTimeout(function () { if (root) root.remove(); }, 6000); }
  }
  function botoes(fn) {
    boxes.forEach(function (b) { var x = b.querySelector('.btn'); if (x) fn(x); });
  }

  function b64(s) {
    var raw = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4));
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  // A pagina nao fica no escopo do service worker, entao navigator.serviceWorker.ready nunca resolve: espera ativar.
  function ativo(reg) {
    if (reg.active) return Promise.resolve(reg);
    return new Promise(function (ok) {
      var w = reg.installing || reg.waiting;
      if (!w) return ok(reg);
      w.addEventListener('statechange', function () { if (w.state === 'activated') ok(reg); });
    });
  }
  function tempo(p, ms) {
    return Promise.race([p, new Promise(function (_, no) { setTimeout(function () { no(new Error('tempo')); }, ms); })]);
  }

  var ativando = false;
  function ativar() {
    if (ativando) return;
    ativando = true;
    botoes(function (x) { x.disabled = true; x.textContent = 'Ativando...'; });
    // A permissao precisa ser pedida direto no toque (o Chrome e o Safari bloqueiam fora dele).
    Promise.resolve(Notification.requestPermission()).then(function (perm) {
      if (perm !== 'granted') throw new Error(perm === 'denied' ? 'negado' : 'fechou');
      return Promise.all([
        navigator.serviceWorker.register(SW, { scope: SCOPE }).then(ativo),
        fetch(ACH + '/api/push-key').then(function (r) { return r.json(); }),
      ]);
    }).then(function (r) {
      var reg = r[0];
      return reg.pushManager.getSubscription().then(function (old) {
        return old || tempo(reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(r[1].key) }), 20000);
      }).then(function (sub) {
        return fetch(ACH + '/api/push', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ subscription: sub.toJSON(), site: host }) })
          .then(function (res) { if (!res.ok) throw new Error('servidor'); return reg; });
      });
    }).then(function (reg) {
      ls.set('ativou');
      aviso('Pronto! Quando entrar promo\u00e7\u00e3o nova no Achadinhos, o aviso chega no seu celular.', true);
      reg.showNotification('Notifica\u00e7\u00f5es ativadas \u2705', { body: 'Voc\u00ea vai receber as promo\u00e7\u00f5es novas do Achadinhos por aqui.', icon: ACH + '/img/favicon-192.png', badge: ACH + '/img/logo-icon-72.png', tag: 'achadinhos-ok' }).catch(function () {});
    }).catch(function (e) {
      ativando = false;
      botoes(function (x) { x.disabled = false; x.textContent = 'Ativar notifica\u00e7\u00f5es'; });
      if (e.message === 'negado') {
        botoes(function (x) { x.hidden = true; });
        aviso('As notifica\u00e7\u00f5es est\u00e3o bloqueadas. Para receber, libere em Configura\u00e7\u00f5es do navegador > Notifica\u00e7\u00f5es > ' + host + '.');
      } else if (e.message !== 'fechou') aviso('N\u00e3o deu para ativar agora. Tente de novo em instantes.');
    });
  }
  // O banner inteiro e o botao: tocar em qualquer lugar dele (menos no X) ativa; com a janela aberta, a tela inteira.
  // area: onde o toque conta (a barra, ou a tela inteira quando a janela esta aberta); box: o que fica verde no fim.
  function liga(area, box) {
    box = box || area;
    area.addEventListener('click', function (e) {
      if (e.target.closest('.x') || box.classList.contains('ok')) return;
      if (push) return ativar();
      if (!e.target.closest('a.btn')) window.open(link, '_blank', 'noopener');
      ls.set('ativou'); fim = true; if (root) root.remove();
    });
  }

  function barra() {
    if (ss.get('barra-fechada')) return;
    mount();
    var b = el('<div class="bar" role="region" aria-label="Notifica\u00e7\u00f5es do Achadinhos"><div class="ico">' + sino + '</div><div class="txt"><p class="t">N\u00e3o perca nenhum achadinho</p><p class="m">' + TXT + '</p></div>' + botao('Ativar notifica\u00e7\u00f5es') + '<button class="x" type="button" aria-label="Fechar">\u00d7</button></div>');
    liga(b);
    b.querySelector('.x').addEventListener('click', function () { ss.set('barra-fechada'); b.remove(); });
    boxes.push(b);
    shadow.appendChild(b);
  }

  function janela() {
    mount();
    var o = el('<div class="ov" role="dialog" aria-modal="true" aria-labelledby="ach-t"><div class="card"><button class="x" type="button" aria-label="Fechar">\u00d7</button><div class="top"><div class="ico">' + sino + '</div><p class="t" id="ach-t">N\u00e3o perca nenhum achadinho!</p></div><div class="body"><p class="m">Ative as notifica\u00e7\u00f5es do Achadinhos e receba no celular as promo\u00e7\u00f5es e cupons da Amazon e do Mercado Livre assim que entrarem no site. \u00c9 gr\u00e1tis e sem cadastro.</p>' + botao('\ud83d\udd14 Ativar notifica\u00e7\u00f5es') + '</div></div></div>');
    var card = o.querySelector('.card');
    var fechar = function () { ss.set('janela-fechada'); o.remove(); boxes = boxes.filter(function (b) { return b !== card; }); document.removeEventListener('keydown', esc); };
    var esc = function (e) { if (e.key === 'Escape') fechar(); };
    // Com a janela aberta, tocar em qualquer lugar da tela (ate no fundo escuro) ativa. So o X fecha.
    liga(o, card);
    o.querySelector('.x').addEventListener('click', fechar);
    document.addEventListener('keydown', esc);
    boxes.push(card);
    shadow.appendChild(o);
  }

  // So a janela do meio (Rick tirou a barra do topo dos outros sites; ela fica so no Achadinhos).
  // Aparece 3 s depois de abrir o site; fechada no X, volta na proxima visita (nova aba).
  function mostrar() {
    setTimeout(function () { if (!ativando && !fim && !ss.get('janela-fechada')) janela(); }, 3000);
  }
  function start() {
    if (!push || Notification.permission !== 'granted') return mostrar();
    // Permissao ja dada: so mostra se o celular ainda nao esta inscrito (e reaviva a inscricao se estiver).
    navigator.serviceWorker.getRegistration(SCOPE).then(function (reg) {
      return reg && reg.pushManager.getSubscription();
    }).then(function (sub) {
      if (sub) navigator.serviceWorker.register(SW, { scope: SCOPE }).catch(function () {});
      else mostrar();
    }).catch(mostrar);
  }
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
