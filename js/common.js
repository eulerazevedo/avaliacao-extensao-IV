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

// ─── Detalhes do projeto (janela) ───
function detalhesHtml(e) {
  const sec = (t, c) => `<section class="d-sec"><h4>${t}</h4>${c}</section>`;
  return `
    <div class="d-topo">${imagemEquipe(e, 'd-img')}<div><span class="tag-ordem">${e.ordem}º a apresentar</span><span class="area">${esc(e.area)}</span><h3 id="d-titulo">${esc(e.nome)}</h3><p class="d-frase">${esc(e.frase)}</p></div></div>
    ${sec('O problema', `<p>${esc(e.problema)}</p>`)}
    ${sec('A solução', `<p>${esc(e.solucao)}</p>`)}
    ${sec('O que o sistema faz', `<ul class="d-lista">${e.funcionalidades.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`)}
    <div class="d-duas">
      ${sec('Para quem é', `<p>${esc(e.publico)}</p>`)}
      ${sec('Diferencial', `<p>${esc(e.diferencial)}</p>`)}
      ${sec('Impacto esperado', `<p>${esc(e.impacto)}</p>`)}
      ${sec('Como é feito', `<p>${esc(e.tecnologia)}</p>`)}
    </div>
    ${sec('Situação atual', `<p>${esc(e.situacao)}</p>`)}
    <div class="d-pedido"><b>O que a equipe pede às empresas:</b> ${esc(e.pedido)}</div>`;
}

function abrirDetalhes(e) {
  let dlg = $('#dlg-detalhes');
  if (!dlg) {
    dlg = document.createElement('dialog'); dlg.id = 'dlg-detalhes'; dlg.setAttribute('aria-labelledby', 'd-titulo');
    dlg.addEventListener('click', (ev) => { if (ev.target === dlg) dlg.close(); });
    document.body.appendChild(dlg);
  }
  dlg.innerHTML = `<div class="d-barra"><span class="eyebrow">Visão geral do projeto</span><button class="btn sec d-fechar" type="button" aria-label="Fechar">Fechar</button></div><div class="d-corpo">${detalhesHtml(e)}</div>`;
  dlg.querySelector('.d-fechar').onclick = () => dlg.close();
  dlg.showModal(); dlg.querySelector('.d-corpo').scrollTop = 0;
}
