// Servidor local só para testar (a Vercel não usa este arquivo).
// Banco em memória quando não há KV_REST_API_URL. Uso: npm run dev  ->  http://localhost:4173
const http = require('http');
const fs = require('fs');
const path = require('path');

process.env.AVALIACAO_SENHA = process.env.AVALIACAO_SENHA || 'dev-avaliar';
process.env.RESULTADO_SENHA = process.env.RESULTADO_SENHA || 'dev-resultado';

const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.txt': 'text/plain' };
const PORTA = process.env.PORT || 4173;

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = decodeURIComponent(url.pathname);
  if (p.startsWith('/api/')) {
    const arq = path.join(__dirname, 'api', p.slice(5).replace(/[^a-z0-9_-]/gi, '') + '.js');
    if (!fs.existsSync(arq)) { res.statusCode = 404; return res.end('{}'); }
    try { return await require(arq)(req, res); } catch (e) { console.error(e); res.statusCode = 500; return res.end('{"erro":"falha"}'); }
  }
  if (p === '/') p = '/index';
  let arq = path.join(__dirname, p);
  if (!path.extname(arq)) arq += '.html';
  if (!arq.startsWith(__dirname) || !fs.existsSync(arq) || arq.includes('/api/')) { res.statusCode = 404; return res.end('Não encontrado'); }
  res.setHeader('Content-Type', TIPOS[path.extname(arq)] || 'application/octet-stream');
  fs.createReadStream(arq).pipe(res);
}).listen(PORTA, () => console.log(`http://localhost:${PORTA}  (avaliar: ${process.env.AVALIACAO_SENHA} | resultado: ${process.env.RESULTADO_SENHA})`));
