const { json } = require('./_lib');
const cfg = require('./_config');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({
    criterios: cfg.CRITERIOS, equipes: cfg.EQUIPES,
    nota: { min: cfg.NOTA_MIN, max: cfg.NOTA_MAX, passo: cfg.NOTA_PASSO },
  }));
};
