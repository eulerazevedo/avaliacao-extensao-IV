// Utilitários compartilhados pelas páginas.
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => (n === null || n === undefined ? '—' : Number(n).toFixed(1).replace('.', ','));

async function api(url, opts = {}) {
  const init = { credentials: 'same-origin', ...opts };
  if (opts.body) { init.method = init.method || 'POST'; init.headers = { 'Content-Type': 'application/json' }; init.body = JSON.stringify(opts.body); }
  const r = await fetch(url, init);
  let corpo = {};
  try { corpo = await r.json(); } catch { /* sem corpo */ }
  if (!r.ok) { const e = new Error(corpo.erro || 'Falha na requisição.'); e.status = r.status; throw e; }
  return corpo;
}

let _cfg;
const config = async () => (_cfg ||= await api('/api/config'));

const iniciais = (nome) => { const p = nome.split(/\s+/); return (p.length > 1 ? p.map((x) => x[0]).join('') : nome).slice(0, 2).toUpperCase(); };
function imagemEquipe(e, cls = 'img') {
  return e.imagem
    ? `<div class="${cls}"><img src="${esc(e.imagem)}" alt="Imagem do projeto ${esc(e.nome)}" loading="lazy" /></div>`
    : `<div class="${cls} sem"><span class="ini">${esc(iniciais(e.nome))}</span></div>`;
}

// Formulário de login genérico das páginas protegidas.
function ligarLogin({ area, aoEntrar }) {
  const form = $('#form-login'); const erro = $('#erro');
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault(); erro.hidden = true;
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      await api('/api/login', { body: { area, senha: form.senha.value, nome: form.nome ? form.nome.value : '' } });
      form.senha.value = ''; await aoEntrar();
    } catch (e) { erro.textContent = e.message; erro.hidden = false; }
    btn.disabled = false;
  });
}
const sair = async () => { try { await api('/api/me', { method: 'POST', body: {} }); } catch {} location.reload(); };
