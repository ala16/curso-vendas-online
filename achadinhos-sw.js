/*
 * Service worker das notificacoes do Achadinhos (achadinhos.tv.br) neste site.
 * Registrado pelo achadinhos-notificacoes.js com escopo /achadinhos-push/, para nao mexer em outro service worker
 * do site. Recebe os avisos de promocao nova mandados pelo servidor do Achadinhos e abre a oferta la no toque.
 */
var ACH = 'https://www.achadinhos.tv.br';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Nova promoção no Achadinhos', {
    body: d.body || 'Toque para ver as promoções novas.',
    icon: new URL(d.icon || '/img/favicon-192.png', ACH).href,
    badge: new URL(d.badge || '/img/logo-icon-72.png', ACH).href,
    image: d.image ? new URL(d.image, ACH).href : undefined,
    tag: d.tag || 'achadinhos-promo',
    renotify: true,
    data: { url: new URL(d.url || '/', ACH).href },
    actions: [{ action: 'ver', title: 'Ver promoção' }],
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.openWindow((e.notification.data && e.notification.data.url) || ACH));
});

// O navegador trocou a inscricao sozinho: manda a nova para o Achadinhos.
self.addEventListener('pushsubscriptionchange', function (e) {
  e.waitUntil(fetch(ACH + '/api/push-key').then(function (r) { return r.json(); }).then(function (j) {
    var raw = atob(j.key.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - j.key.length % 4) % 4));
    var key = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) key[i] = raw.charCodeAt(i);
    return self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  }).then(function (sub) {
    return fetch(ACH + '/api/push', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ subscription: sub.toJSON(), site: self.location.hostname }) });
  }).catch(function () {}));
});
