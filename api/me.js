const { sessao, limparSessao, json } = require('./_lib');

module.exports = (req, res) => {
  if (req.method === 'POST') { limparSessao(res); return json(res, 200, { ok: true }); } // sair
  const s = sessao(req);
  if (!s) return json(res, 401, { erro: 'Sem sessão.' });
  return json(res, 200, { papel: s.r, nome: s.n });
};
