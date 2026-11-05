(() => {
  'use strict';
  const config = window.CURSO_ANALYTICS;
  const $ = id => document.getElementById(id);
  const storageKey = 'curso-vendas-admin-session';
  let session = null;
  let refreshSequence = 0;
  const format = new Intl.NumberFormat('pt-BR');
  const dates = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });
  function status(id, text, error = false) { $(id).textContent = text; $(id).classList.toggle('error', error); }
  async function request(path, body, token = null, method = 'POST') {
    const response = await fetch(config.url + path, { method, headers: { apikey: config.key, 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!response.ok) { const error = new Error('request_failed'); error.status = response.status; throw error; }
    return response.status === 204 ? null : response.json();
  }
  function saveSession(value) { session = value; try { if (value) sessionStorage.setItem(storageKey, JSON.stringify(value)); else sessionStorage.removeItem(storageKey); } catch (_) {} }
  function showLogin() { refreshSequence++; saveSession(null); $('dashboard').hidden = true; $('login').hidden = false; $('rows').replaceChildren(); ['total', 'signups', 'questions'].forEach(id => $(id).textContent = '—'); }
  async function authorize(value, expectedSequence = refreshSequence) {
    if (!value?.access_token) { const error = new Error('missing_session'); error.status = 401; throw error; }
    if (value.expires_at && value.expires_at * 1000 < Date.now() + 60000 && value.refresh_token) value = await request('/auth/v1/token?grant_type=refresh_token', { refresh_token: value.refresh_token });
    const user = await request('/auth/v1/user', undefined, value.access_token, 'GET');
    if (user.email?.toLowerCase() !== config.adminEmail || !user.email_confirmed_at || user.is_anonymous) { const error = new Error('not_authorized'); error.status = 403; throw error; }
    if (expectedSequence !== refreshSequence) throw new Error('cancelled');
    value.expires_at = value.expires_at || Math.floor(Date.now() / 1000) + (value.expires_in || 3600);
    saveSession(value); $('login').hidden = true; $('dashboard').hidden = false;
  }
  async function loadCounts() {
    const sequence = ++refreshSequence;
    $('refresh').disabled = true;
    status('dashboard-status', 'Atualizando…');
    try {
      await authorize(session);
      const days = $('period').value;
      const since = days === 'all' ? null : new Date(Date.now() - Number(days) * 86400000).toISOString();
      const data = await request('/rest/v1/rpc/curso_vendas_click_summary', { since_at: since }, session.access_token);
      if (sequence !== refreshSequence) return;
      const byId = new Map(data.map(row => [row.link_id, row]));
      const rows = Object.entries(config.labels).map(([id, label]) => ({ id, label, count: Number(byId.get(id)?.clicks || 0), last: byId.get(id)?.last_click })).sort((a, b) => b.count - a.count);
      const total = rows.reduce((sum, row) => sum + row.count, 0);
      const sum = ids => rows.filter(row => ids.includes(row.id)).reduce((n, row) => n + row.count, 0);
      $('total').textContent = format.format(total);
      $('signups').textContent = format.format(sum(['hero_signup', 'closing_signup', 'sticky_signup']));
      $('questions').textContent = format.format(sum(['hero_questions', 'footer_whatsapp']));
      $('rows').replaceChildren();
      for (const row of rows) {
        const tr = document.createElement('tr');
        const name = document.createElement('td'); name.textContent = row.label;
        const bar = document.createElement('div'); bar.className = 'bar'; bar.setAttribute('aria-hidden', 'true');
        const fill = document.createElement('span'); fill.style.setProperty('--share', (total ? row.count / total * 100 : 0) + '%'); bar.append(fill); name.append(bar);
        const count = document.createElement('td'); const strong = document.createElement('strong'); strong.textContent = format.format(row.count); count.append(strong);
        const share = document.createElement('small'); share.textContent = (total ? row.count / total * 100 : 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'; count.append(share);
        const last = document.createElement('td'); last.textContent = row.last ? dates.format(new Date(row.last)) : '—';
        tr.append(name, count, last); $('rows').append(tr);
      }
      $('empty').hidden = total !== 0;
      status('dashboard-status', 'Atualizado em ' + dates.format(new Date()) + '.');
    } catch (error) {
      if (sequence !== refreshSequence) return;
      if ([401, 403].includes(error.status) || !session) { showLogin(); status('login-status', 'Seu acesso expirou. Entre novamente.', true); }
      else status('dashboard-status', 'Não foi possível atualizar. Os números anteriores podem estar desatualizados. Tente novamente.', true);
    } finally { $('refresh').disabled = false; }
  }
  $('email-form').addEventListener('submit', async event => {
    event.preventDefault(); $('send-code').disabled = true; status('login-status', 'Solicitando acesso…');
    try {
      await request('/auth/v1/otp', { email: config.adminEmail, create_user: true });
      $('verify-form').hidden = false; $('code').focus();
      status('login-status', 'Confira sua caixa de entrada e spam. Cole acima o código ou o link de acesso recebido.');
      setTimeout(() => { $('send-code').disabled = false; }, 60000);
    } catch (error) { status('login-status', error.status === 429 ? 'Aguarde um minuto antes de solicitar novamente.' : 'Não foi possível enviar o acesso. Tente novamente em alguns instantes.', true); $('send-code').disabled = false; }
  });
  $('verify-form').addEventListener('submit', async event => {
    event.preventDefault(); $('verify-code').disabled = true;
    try {
      const code = $('code').value.trim();
      let body;
      if (/^https:\/\//i.test(code)) {
        const link = new URL(code);
        if (link.origin !== config.url || link.pathname !== '/auth/v1/verify') throw new Error('invalid_link');
        const token = link.searchParams.get('token') || link.searchParams.get('token_hash');
        const type = link.searchParams.get('type');
        if (!token || !['email', 'signup', 'magiclink'].includes(type)) throw new Error('invalid_link');
        body = { token_hash: token, type };
      } else {
        if (!/^\d{6,10}$/.test(code)) throw new Error('invalid_code');
        body = { email: config.adminEmail, token: code, type: 'email' };
      }
      status('login-status', 'Validando acesso…');
      const value = await request('/auth/v1/verify', body); await authorize(value); $('code').value = ''; await loadCounts();
    } catch (_) { status('login-status', 'Código ou link inválido ou expirado. Copie o endereço completo do botão recebido ou solicite um novo acesso.', true); }
    finally { $('verify-code').disabled = false; }
  });
  $('refresh').addEventListener('click', loadCounts);
  $('period').addEventListener('change', loadCounts);
  $('logout').addEventListener('click', () => { const token = session?.access_token; showLogin(); status('login-status', 'Você saiu do painel.'); if (token) request('/auth/v1/logout?scope=local', {}, token).catch(() => {}); });
  try { const saved = sessionStorage.getItem(storageKey); if (saved) { session = JSON.parse(saved); authorize(session).then(loadCounts).catch(() => { showLogin(); status('login-status', 'Entre novamente para acessar as contagens.'); }); } } catch (_) { showLogin(); }
})();
