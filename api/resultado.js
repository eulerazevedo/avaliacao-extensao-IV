const { db, sessao, json, lerJson, exigirJson } = require('./_lib');
const { CRITERIOS, EQUIPES } = require('./_config');

const chaveEquipe = (id) => `pitch:av:${id}`;
const media = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const r2 = (n) => (n === null ? null : Math.round(n * 100) / 100);

module.exports = async (req, res) => {
  const s = sessao(req);
  if (!s || s.r !== 'admin') return json(res, 401, { erro: 'Entre com a senha de resultados.' });

  // Zerar tudo (útil para apagar testes antes do dia). Exige confirmação digitada.
  if (req.method === 'POST') {
    if (!exigirJson(req, res)) return;
    const { acao, confirmacao } = await lerJson(req);
    if (acao !== 'zerar' || confirmacao !== 'ZERAR') return json(res, 400, { erro: 'Digite ZERAR para confirmar.' });
    await Promise.all(EQUIPES.map((e) => db.del(chaveEquipe(e.id))));
    return json(res, 200, { ok: true });
  }
  if (req.method !== 'GET') return json(res, 405, { erro: 'Método não permitido.' });

  const juizes = new Map();
  const equipes = await Promise.all(EQUIPES.map(async (e) => {
    const todas = await db.hgetall(chaveEquipe(e.id));
    const avaliacoes = Object.entries(todas).map(([id, v]) => {
      const a = JSON.parse(v);
      const porCriterio = CRITERIOS.map((c) => a.notas[c.id]);
      juizes.set(id, a.nome);
      return { juizId: id, juiz: a.nome, notas: a.notas, media: r2(media(porCriterio)), comentario: a.comentario, em: a.em };
    });
    const mediasJuizes = avaliacoes.map((a) => a.media);
    const porCriterio = Object.fromEntries(CRITERIOS.map((c) => [c.id, r2(media(avaliacoes.map((a) => a.notas[c.id])))]));
    return {
      id: e.id, nome: e.nome, ordem: e.ordem, numero: e.numero,
      nota: r2(media(mediasJuizes)), totalAvaliacoes: avaliacoes.length, porCriterio, avaliacoes,
    };
  }));

  const listaJuizes = [...juizes].map(([id, nome]) => ({ id, nome }));
  const ranking = [...equipes].filter((e) => e.nota !== null).sort((a, b) => b.nota - a.nota).map((e) => e.id);
  return json(res, 200, { criterios: CRITERIOS, equipes, juizes: listaJuizes, ranking, persistente: db.persistente });
};
