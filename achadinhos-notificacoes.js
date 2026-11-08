/*
 * Banner "Ative as notificacoes do Achadinhos" (achadinhos.tv.br).
 * O mesmo arquivo esta em todos os sites do Rick. A permissao de notificacao vale so para o dominio onde e pedida,
 * entao o botao abre www.achadinhos.tv.br/notificacoes (pagina de um botao so que pede a permissao).
 * Primeiro aparece uma janela no meio da tela; depois de fechada, fica uma barra fixa no rodape que volta a cada visita.
 * Quem tocou em "Ativar" nao ve mais nada por 30 dias. Nao aparece em paginas de admin/login nem para quem nao fala portugues.
 */
(function () {
  if (window.__achPush) return;
  window.__achPush = 1;
  var URL_ATIVAR = 'https://www.achadinhos.tv.br/notificacoes';
  var DIA = 86400000;
  var host = location.hostname.replace(/^www\./, '');
  if (/(^|\.)achadinhos\.tv\.br$/.test(host)) return;
  if (/^\/(admin|painel|login|entrar|dashboard)(\/|$)/i.test(location.pathname)) return;
  var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'pt-BR']).join(',');
  if (!/(^|,)pt/i.test(langs)) return;

  var ls = {
    get: function (k) { try { return Number(localStorage.getItem('achPush:' + k)) || 0; } catch (e) { return 0; } },
    set: function (k) { try { localStorage.setItem('achPush:' + k, String(Date.now())); } catch (e) {} },
  };
  var ss = {
    get: function (k) { try { return sessionStorage.getItem('achPush:' + k); } catch (e) { return null; } },
    set: function (k) { try { sessionStorage.setItem('achPush:' + k, '1'); } catch (e) {} },
  };
  if (Date.now() - ls.get('ativou') < 30 * DIA) return;

  var link = URL_ATIVAR + '?origem=' + encodeURIComponent(host) + '&utm_source=' + encodeURIComponent(host) + '&utm_medium=banner&utm_campaign=notificacoes';
  var sino = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
  var css = ':host{all:initial}*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}' +
    '.bar{position:fixed;z-index:2147483646;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));max-width:860px;margin:0 auto;display:flex;align-items:center;gap:14px;padding:14px 44px 14px 14px;border-radius:18px;background:linear-gradient(135deg,#ff6a00,#ff9a3c);color:#fff;box-shadow:0 10px 34px rgba(0,0,0,.3);animation:up .45s ease-out}' +
    '.ico{flex:none;width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.22);display:grid;place-items:center}.ico svg{width:24px;height:24px;animation:ring 2.4s ease-in-out infinite;transform-origin:50% 10%}' +
    '.txt{flex:1;min-width:0}.t{margin:0 0 2px;font-size:17px;font-weight:800;line-height:1.2}.m{margin:0;font-size:14px;line-height:1.35;opacity:.95}' +
    '.btn{flex:none;display:inline-block;border:0;border-radius:999px;background:#fff;color:#d94f00;font-weight:800;font-size:15px;padding:12px 20px;text-decoration:none;text-align:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.12);animation:pulse 1.8s ease-in-out infinite}.btn:hover{background:#fff1e6}' +
    '.x{position:absolute;top:6px;right:8px;border:0;background:none;color:#fff;font-size:24px;line-height:1;padding:6px;cursor:pointer;opacity:.85}' +
    '.ov{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:16px;animation:fade .25s ease-out}' +
    '.card{position:relative;width:100%;max-width:400px;border-radius:22px;overflow:hidden;background:#fff;color:#1d1d1f;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.4);animation:pop .35s ease-out}' +
    '.top{background:linear-gradient(135deg,#ff6a00,#ff9a3c);color:#fff;padding:26px 20px 22px}.top .ico{width:72px;height:72px;margin:0 auto 12px}.top .ico svg{width:38px;height:38px}.top .t{font-size:22px}' +
    '.body{padding:18px 22px 22px}.body .m{font-size:15px;opacity:1;color:#444;margin-bottom:16px}.card .btn{display:block;width:100%;background:linear-gradient(135deg,#ff6a00,#ff8a1f);color:#fff;font-size:17px;padding:15px;animation:pulse2 1.8s ease-in-out infinite}' +
    '.no{display:block;margin:12px auto 0;border:0;background:none;color:#888;font-size:14px;cursor:pointer;text-decoration:underline}.card .x{color:#fff}' +
    '@keyframes up{from{transform:translateY(130%);opacity:0}to{transform:none;opacity:1}}@keyframes fade{from{opacity:0}}@keyframes pop{from{transform:scale(.85);opacity:0}}' +
    '@keyframes ring{0%,70%,100%{transform:rotate(0)}75%{transform:rotate(14deg)}80%{transform:rotate(-12deg)}85%{transform:rotate(8deg)}90%{transform:rotate(-4deg)}}' +
    '@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.75)}50%{box-shadow:0 0 0 9px rgba(255,255,255,0)}}@keyframes pulse2{0%,100%{box-shadow:0 0 0 0 rgba(255,106,0,.55)}50%{box-shadow:0 0 0 10px rgba(255,106,0,0)}}' +
    '@media (max-width:640px){.bar{flex-wrap:wrap;padding:12px 40px 12px 12px;gap:10px}.ico{width:40px;height:40px}.t{font-size:16px}.m{font-size:13px}.bar .btn{flex-basis:100%;padding:12px}}' +
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';

  var root, shadow;
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
  function ativou() {
    ls.set('ativou');
    if (root) root.remove();
  }

  function barra() {
    if (ss.get('barra-fechada')) return;
    mount();
    var b = el('<div class="bar" role="region" aria-label="Notifica\u00e7\u00f5es do Achadinhos"><div class="ico">' + sino + '</div><div class="txt"><p class="t">N\u00e3o perca nenhum achadinho</p><p class="m">Ative as notifica\u00e7\u00f5es e receba no celular as promo\u00e7\u00f5es novas assim que elas entrarem no site.</p></div><a class="btn" target="_blank" rel="noopener" href="' + link + '">Ativar notifica\u00e7\u00f5es</a><button class="x" type="button" aria-label="Fechar">\u00d7</button></div>');
    b.querySelector('.btn').addEventListener('click', ativou);
    b.querySelector('.x').addEventListener('click', function () { ss.set('barra-fechada'); b.remove(); });
    shadow.appendChild(b);
  }

  function janela() {
    mount();
    ls.set('janela');
    var o = el('<div class="ov" role="dialog" aria-modal="true" aria-labelledby="ach-t"><div class="card"><button class="x" type="button" aria-label="Fechar">\u00d7</button><div class="top"><div class="ico">' + sino + '</div><p class="t" id="ach-t">N\u00e3o perca nenhum achadinho!</p></div><div class="body"><p class="m">Ative as notifica\u00e7\u00f5es do <b>Achadinhos</b> e receba no celular as promo\u00e7\u00f5es e cupons da Amazon e do Mercado Livre assim que entrarem no site. \u00c9 gr\u00e1tis e sem cadastro.</p><a class="btn" target="_blank" rel="noopener" href="' + link + '">\ud83d\udd14 Ativar notifica\u00e7\u00f5es</a><button class="no" type="button">Agora n\u00e3o</button></div></div></div>');
    var fechar = function () { o.remove(); document.removeEventListener('keydown', esc); barra(); };
    var esc = function (e) { if (e.key === 'Escape') fechar(); };
    o.querySelector('.btn').addEventListener('click', ativou);
    o.querySelector('.x').addEventListener('click', fechar);
    o.querySelector('.no').addEventListener('click', fechar);
    o.addEventListener('click', function (e) { if (e.target === o) fechar(); });
    document.addEventListener('keydown', esc);
    shadow.appendChild(o);
  }

  function start() {
    // A janela aparece de novo a cada 12 horas; no resto do tempo fica a barra do rodape.
    setTimeout(function () {
      if (Date.now() - ls.get('janela') > DIA / 2) janela();
      else barra();
    }, 3000);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
