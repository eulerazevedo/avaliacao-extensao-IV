(async () => {
  const { equipes, criterios } = await config();
  $('#equipes').innerHTML = equipes.map((e) => `
    <article class="card">${imagemEquipe(e)}
      <div class="corpo">
        <span class="tag-ordem">${e.ordem}º a apresentar</span>
        <span class="area">${esc(e.area)}</span>
        <h3>${esc(e.nome)}</h3>
        <p>${esc(e.frase)}</p>
        <div class="pedido"><b>Pedido às empresas:</b> ${esc(e.pedido)}</div>
      </div></article>`).join('');
  $('#criterios-lista').innerHTML = criterios.map((c) => `<li><b>${esc(c.nome)}</b><span>${esc(c.dica)}</span></li>`).join('');
})();
