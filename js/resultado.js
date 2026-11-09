(async () => {
  const gate = $('#gate'), painel = $('#painel');
  let dados;

  async function abrir() {
    dados = await api('/api/resultado');
    gate.hidden = true; painel.hidden = false; desenhar();
  }

  function desenhar() {
    const { equipes, criterios, ranking, persistente } = dados;
    $('#atualizado').textContent = `Atualizado às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    $('#aviso-banco').innerHTML = persistente ? '' : '<div class="erro">Banco não conectado: as notas estão só na memória do servidor e somem. Conecte o Redis na Vercel (veja o README).</div>';
    const porId = Object.fromEntries(equipes.map((e) => [e.id, e]));
    const semNota = equipes.filter((e) => e.nota === null);
    const ordem = [...ranking.map((id) => porId[id]), ...semNota];

    $('#rank').innerHTML = ordem.map((e, i) => {
      const tem = e.nota !== null;
      return `<div class="rank-item ${tem && i === 0 ? 'top' : ''}"><div class="pos">${tem ? i + 1 : '–'}</div>
        <div><h3>${esc(e.nome)}</h3><div class="barra"><i style="width:${tem ? e.nota * 10 : 0}%"></i></div>
        ${tem ? '' : '<span class="pend">Ainda sem avaliações</span>'}</div>
        <div class="nota-g">${fmt(e.nota)}<small>${e.totalAvaliacoes} avaliador${e.totalAvaliacoes === 1 ? '' : 'es'}</small></div></div>`;
    }).join('');

    const juizes = dados.juizes;
    $('#matriz').innerHTML = juizes.length
      ? `<thead><tr><th>Equipe</th>${juizes.map((j) => `<th class="n">${esc(j.nome)}</th>`).join('')}<th class="n">Média</th></tr></thead><tbody>${
          equipes.map((e) => `<tr><td><b>${esc(e.nome)}</b></td>${juizes.map((j) => { const a = e.avaliacoes.find((x) => x.juizId === j.id); return `<td class="n">${a ? `<b>${fmt(a.media)}</b>` : '<span class="pend">falta</span>'}</td>`; }).join('')}<td class="n"><b>${fmt(e.nota)}</b></td></tr>`).join('')}</tbody>`
      : '<tbody><tr><td>Nenhuma avaliação recebida ainda.</td></tr></tbody>';

    $('#tabela').innerHTML = `<thead><tr><th>Equipe</th>${criterios.map((c) => `<th class="n">${esc(c.nome)}</th>`).join('')}<th class="n">Nota</th></tr></thead><tbody>${
      equipes.map((e) => `<tr><td><b>${esc(e.nome)}</b></td>${criterios.map((c) => `<td class="n">${fmt(e.porCriterio[c.id])}</td>`).join('')}<td class="n"><b>${fmt(e.nota)}</b></td></tr>`).join('')}</tbody>`;

    const comAv = equipes.filter((e) => e.avaliacoes.length);
    $('#detalhe').innerHTML = comAv.length ? comAv.map((e) => `<details><summary>${esc(e.nome)} · ${fmt(e.nota)}</summary>
      <div class="tabela-wrap" style="margin-top:12px"><table><thead><tr><th>Avaliador</th>${criterios.map((c) => `<th class="n">${esc(c.nome)}</th>`).join('')}<th class="n">Nota</th></tr></thead><tbody>${
        e.avaliacoes.map((a) => `<tr><td>${esc(a.juiz)}</td>${criterios.map((c) => `<td class="n">${fmt(a.notas[c.id])}</td>`).join('')}<td class="n"><b>${fmt(a.media)}</b></td></tr>`).join('')}</tbody></table></div>
      ${e.avaliacoes.filter((a) => a.comentario).map((a) => `<div class="coment"><b>${esc(a.juiz)}:</b> ${esc(a.comentario)}</div>`).join('')}</details>`).join('')
      : '<div class="vazio-msg">Nenhuma avaliação recebida ainda.</div>';
  }

  $('#atualizar').addEventListener('click', abrir);
  $('#imprimir').addEventListener('click', () => window.print());
  $('#sair').addEventListener('click', sair);
  $('#csv').addEventListener('click', () => {
    const { equipes, criterios } = dados;
    const linhas = [['Equipe', 'Avaliador', ...criterios.map((c) => c.nome), 'Nota do avaliador', 'Comentario']];
    equipes.forEach((e) => e.avaliacoes.forEach((a) => linhas.push([e.nome, a.juiz, ...criterios.map((c) => a.notas[c.id]), a.media, a.comentario])));
    linhas.push([]); equipes.forEach((e) => linhas.push([`Nota geral ${e.nome}`, '', ...criterios.map((c) => e.porCriterio[c.id] ?? ''), e.nota ?? '']));
    const csv = '﻿' + linhas.map((l) => l.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), download: 'resultado-pitch.csv' });
    a.click(); URL.revokeObjectURL(a.href);
  });
  $('#zerar').addEventListener('click', async () => {
    const m = $('#zerar-msg');
    try { await api('/api/resultado', { body: { acao: 'zerar', confirmacao: $('#conf').value.trim() } }); m.textContent = 'Tudo zerado.'; $('#conf').value = ''; await abrir(); } catch (e) { m.textContent = e.message; }
  });

  ligarLogin({ area: 'resultado', aoEntrar: abrir });
  try { await abrir(); } catch { gate.hidden = false; }
})();
