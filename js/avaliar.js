(async () => {
  let cfg, minhas = {}, atual = 0, rascunho = {};
  const gate = $('#gate'), painel = $('#painel');

  async function abrir() {
    cfg = await config();
    const r = await api('/api/avaliacao'); // 401 se não houver sessão de avaliador
    minhas = r.avaliacoes; $('#quem').textContent = r.nome;
    gate.hidden = true; painel.hidden = false;
    atual = Math.max(0, cfg.equipes.findIndex((e) => !minhas[e.id]));
    desenhar();
  }

  const media = (notas) => { const v = cfg.criterios.map((c) => notas[c.id]); return v.every((x) => typeof x === 'number') ? v.reduce((a, b) => a + b, 0) / v.length : null; };

  function abas() {
    $('#tabs').innerHTML = cfg.equipes.map((e, i) => `<button class="tab ${minhas[e.id] ? 'feita' : ''}" role="tab" aria-selected="${i === atual}" data-i="${i}"><span class="n">${minhas[e.id] ? '✓' : e.ordem}</span>${esc(e.nome)}</button>`).join('');
    const feitas = Object.keys(minhas).length;
    $('#contagem').textContent = `${feitas} de ${cfg.equipes.length} avaliadas`;
    $('#prog').style.width = `${(feitas / cfg.equipes.length) * 100}%`;
    $('#tabs [aria-selected=true]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  function desenhar() {
    abas();
    const e = cfg.equipes[atual];
    const salvo = minhas[e.id];
    rascunho = { notas: { ...(salvo?.notas || {}) }, comentario: salvo?.comentario || '' };
    const { min, max, passo } = cfg.nota;
    $('#conteudo').innerHTML = `
      <div class="equipe">
        <aside class="info">${imagemEquipe(e)}<div class="corpo">
          <span class="tag-ordem">${e.ordem}º a apresentar</span><span class="area" style="color:var(--purple-hi);font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.1em">${esc(e.area)}</span>
          <h2>${esc(e.nome)}</h2><p>${esc(e.frase)}</p>
          <p><b style="color:var(--accent-hi)">Pedido:</b> ${esc(e.pedido)}</p>
          <button class="btn sec" type="button" id="ver-det">Ver visão geral completa</button>
        </div></aside>
        <div class="notas">
          ${cfg.criterios.map((c) => {
            const v = rascunho.notas[c.id];
            return `<div class="crit-item"><div class="linha"><div><b>${esc(c.nome)}</b><small>${esc(c.dica)}</small></div><div class="valor ${v === undefined ? 'vazio' : ''}" data-v="${c.id}">${v === undefined ? '—' : fmt(v)}</div></div>
              <input type="range" class="${v === undefined ? 'vazio' : ''}" data-c="${c.id}" min="${min}" max="${max}" step="${passo}" value="${v ?? (max + min) / 2}" aria-label="${esc(c.nome)}" />
              <div class="escala"><span>${min}</span><span>${(min + max) / 2}</span><span>${max}</span></div></div>`;
          }).join('')}
          <label class="f" for="coment">Comentário (opcional)</label>
          <textarea class="in" id="coment" maxlength="600" placeholder="O que mais chamou a atenção neste projeto?">${esc(rascunho.comentario)}</textarea>
          <div class="total"><div class="big" id="total">—</div><span>Nota deste projeto, a média dos seis critérios. Mexa em todos os controles para liberar o envio.</span></div>
          <div class="acoes-av"><button class="btn pri" id="salvar" type="button" disabled>${salvo ? 'Atualizar avaliação' : 'Salvar avaliação'}</button><span class="aviso" id="msg" role="status"></span></div>
        </div>
      </div>`;
    atualizarTotal();
  }

  function atualizarTotal() {
    const m = media(rascunho.notas);
    $('#total').textContent = fmt(m);
    $('#salvar').disabled = m === null;
  }

  document.addEventListener('input', (ev) => {
    if (ev.target.matches('input[type=range]')) {
      const id = ev.target.dataset.c; const v = Number(ev.target.value);
      rascunho.notas[id] = v; ev.target.classList.remove('vazio');
      const el = $(`[data-v="${id}"]`); el.textContent = fmt(v); el.classList.remove('vazio');
      atualizarTotal(); $('#msg').textContent = '';
    } else if (ev.target.id === 'coment') rascunho.comentario = ev.target.value;
  });
  // Em celular, um toque simples no slider vazio também registra a nota.
  document.addEventListener('change', (ev) => { if (ev.target.matches('input[type=range]')) ev.target.dispatchEvent(new Event('input', { bubbles: true })); });

  // Tocar no controle sem arrastar (valor do meio) também conta como nota.
  document.addEventListener('pointerup', (ev) => { if (ev.target.matches('input[type=range].vazio')) ev.target.dispatchEvent(new Event('input', { bubbles: true })); });

  document.addEventListener('click', async (ev) => {
    if (ev.target.id === 'ver-det') { abrirDetalhes(cfg.equipes[atual]); return; }
    const tab = ev.target.closest('.tab');
    if (tab) { atual = Number(tab.dataset.i); desenhar(); return; }
    if (ev.target.id === 'salvar') {
      const btn = ev.target; const msg = $('#msg'); btn.disabled = true; msg.className = 'aviso'; msg.textContent = 'Salvando…';
      try {
        const e = cfg.equipes[atual];
        const r = await api('/api/avaliacao', { body: { equipe: e.id, notas: rascunho.notas, comentario: rascunho.comentario } });
        minhas[e.id] = { notas: { ...rascunho.notas }, comentario: rascunho.comentario };
        abas(); msg.textContent = `Salvo. Nota ${fmt(r.media)}.`;
        const prox = cfg.equipes.findIndex((x, i) => i > atual && !minhas[x.id]);
        if (prox >= 0) { btn.textContent = 'Atualizar avaliação'; btn.disabled = false; setTimeout(() => { atual = prox; desenhar(); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 900); }
        else { btn.textContent = 'Atualizar avaliação'; btn.disabled = false; if (Object.keys(minhas).length === cfg.equipes.length) msg.textContent += ' Todas as equipes foram avaliadas. Obrigado!'; }
      } catch (e) { msg.className = 'aviso err'; msg.textContent = e.message; btn.disabled = false; }
    }
  });
  $('#sair').addEventListener('click', sair);

  ligarLogin({ area: 'avaliar', aoEntrar: abrir });
  try { await abrir(); } catch { gate.hidden = false; }
})();
