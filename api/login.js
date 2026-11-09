const { db, igual, definirSessao, json, lerJson, ip, exigirJson, slug, SENHA_AVALIAR, SENHA_RESULTADO } = require('./_lib');

const MAX_ERROS = 8;
const JANELA_SEG = 600;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { erro: 'Método não permitido.' });
  if (!exigirJson(req, res)) return;
  if (!SENHA_AVALIAR || !SENHA_RESULTADO) return json(res, 500, { erro: 'Servidor sem senhas configuradas (veja o README).' });

  const chave = `rl:${ip(req)}`;
  if ((await db.get(chave)) >= MAX_ERROS) return json(res, 429, { erro: 'Muitas tentativas. Aguarde alguns minutos.' });

  const { senha = '', nome = '', area = 'avaliar' } = await lerJson(req);

  if (area === 'resultado') {
    if (!igual(senha, SENHA_RESULTADO)) { await db.incr(chave, JANELA_SEG); return json(res, 401, { erro: 'Senha incorreta.' }); }
    definirSessao(res, { r: 'admin', n: 'Organização' });
    return json(res, 200, { ok: true, papel: 'admin' });
  }

  const nomeLimpo = String(nome).trim().replace(/\s+/g, ' ').slice(0, 60);
  if (nomeLimpo.length < 2) return json(res, 400, { erro: 'Informe o seu nome.' });
  if (!igual(senha, SENHA_AVALIAR)) { await db.incr(chave, JANELA_SEG); return json(res, 401, { erro: 'Senha incorreta.' }); }
  definirSessao(res, { r: 'juiz', n: nomeLimpo, id: slug(nomeLimpo) });
  return json(res, 200, { ok: true, papel: 'juiz', nome: nomeLimpo });
};
