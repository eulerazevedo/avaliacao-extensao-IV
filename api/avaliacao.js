const { db, sessao, json, lerJson, exigirJson } = require('./_lib');
const { CRITERIOS, EQUIPES, NOTA_MIN, NOTA_MAX, NOTA_PASSO } = require('./_config');

const chaveEquipe = (id) => `pitch:av:${id}`;

module.exports = async (req, res) => {
  const s = sessao(req);
  if (!s || s.r !== 'juiz') return json(res, 401, { erro: 'Entre com a senha de avaliação.' });

  // Minhas avaliações (para reabrir a tela já preenchida).
  if (req.method === 'GET') {
    const minhas = {};
    await Promise.all(EQUIPES.map(async (e) => {
      const todas = await db.hgetall(chaveEquipe(e.id));
      if (todas[s.id]) minhas[e.id] = JSON.parse(todas[s.id]);
    }));
    return json(res, 200, { nome: s.n, avaliacoes: minhas });
  }

  if (req.method !== 'POST') return json(res, 405, { erro: 'Método não permitido.' });
  if (!exigirJson(req, res)) return;

  const { equipe, notas = {}, comentario = '' } = await lerJson(req);
  if (!EQUIPES.some((e) => e.id === equipe)) return json(res, 400, { erro: 'Equipe inválida.' });

  const limpas = {};
  for (const c of CRITERIOS) {
    const v = Number(notas[c.id]);
    const valida = Number.isFinite(v) && v >= NOTA_MIN && v <= NOTA_MAX && Math.abs(v / NOTA_PASSO - Math.round(v / NOTA_PASSO)) < 1e-9;
    if (!valida) return json(res, 400, { erro: `Nota inválida em "${c.nome}".` });
    limpas[c.id] = v;
  }

  const registro = { nome: s.n, notas: limpas, comentario: String(comentario).slice(0, 600), em: new Date().toISOString() };
  await db.hset(chaveEquipe(equipe), s.id, JSON.stringify(registro));
  const media = Object.values(limpas).reduce((a, b) => a + b, 0) / CRITERIOS.length;
  return json(res, 200, { ok: true, media: Math.round(media * 100) / 100 });
};
