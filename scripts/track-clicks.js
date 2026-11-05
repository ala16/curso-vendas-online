(() => {
  'use strict';
  const config = window.CURSO_ANALYTICS;
  if (!config || location.pathname.includes('/admin')) return;
  const recent = new Map();
  document.addEventListener('click', record);
  document.addEventListener('auxclick', event => { if (event.button === 1) record(event); });
  function record(event) {
    if (!event.isTrusted) return;
    const anchor = event.target.closest?.('a[data-track]');
    const id = anchor?.dataset.track;
    if (!id || !Object.hasOwn(config.labels, id)) return;
    const now = Date.now();
    if (now - (recent.get(id) || 0) < 600) return;
    recent.set(id, now);
    try {
      const eventId = crypto.randomUUID();
      fetch(config.url + '/rest/v1/curso_vendas_clicks', {
        method: 'POST',
        headers: { apikey: config.key, Authorization: 'Bearer ' + config.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ event_id: eventId, link_id: id }),
        keepalive: true,
        credentials: 'omit',
        referrerPolicy: 'no-referrer'
      }).catch(() => {});
    } catch (_) { /* The destination always opens, even when analytics is unavailable. */ }
  }
})();
