// Utilitários compartilhados: banco (Redis REST), sessão assinada e respostas.
// Sem dependências externas: só Node.

const crypto = require('crypto');

// ─── Banco ─────────────────────────────────────────────────────────────
// Produção: Redis do Marketplace da Vercel (Upstash). Aceita os dois nomes de variável.
// Sem variáveis (desenvolvimento local): memória do processo.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const mem = globalThis.__pitchMem || (globalThis.__pitchMem = { hashes: new Map(), counters: new Map() });

async function redis(cmd) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`redis: ${j.error || r.status}`);
  return j.result;
}

const db = {
  persistente: Boolean(REDIS_URL && REDIS_TOKEN),
  async hset(key, field, value) {
    if (!this.persistente) {
      if (!mem.hashes.has(key)) mem.hashes.set(key, new Map());
      mem.hashes.get(key).set(field, value);
      return;
    }
    await redis(['HSET', key, field, value]);
  },
  async hgetall(key) {
    if (!this.persistente) return Object.fromEntries(mem.hashes.get(key) || []);
    const flat = (await redis(['HGETALL', key])) || [];
    const out = {};
    for (let i = 0; i < flat.length; i += 2) out[flat[i]] = flat[i + 1];
    return out;
  },
  async del(key) {
    if (!this.persistente) { mem.hashes.delete(key); return; }
    await redis(['DEL', key]);
  },
  async incr(key, ttlSeg) {
    if (!this.persistente) {
      const now = Date.now();
      const cur = mem.counters.get(key);
      const n = cur && cur.exp > now ? cur.n + 1 : 1;
      mem.counters.set(key, { n, exp: cur && cur.exp > now ? cur.exp : now + ttlSeg * 1000 });
      return n;
    }
    const n = await redis(['INCR', key]);
    if (n === 1) await redis(['EXPIRE', key, String(ttlSeg)]);
    return n;
  },
  async get(key) {
    if (!this.persistente) { const c = mem.counters.get(key); return c && c.exp > Date.now() ? c.n : 0; }
    return Number(await redis(['GET', key])) || 0;
  },
  async delKey(key) {
    if (!this.persistente) { mem.counters.delete(key); return; }
    await redis(['DEL', key]);
  },
};

// ─── Senhas e sessão ───────────────────────────────────────────────────
const SENHA_AVALIAR = process.env.AVALIACAO_SENHA;
const SENHA_RESULTADO = process.env.RESULTADO_SENHA;
const SEGREDO = process.env.SESSION_SECRET || `${SENHA_AVALIAR || ''}|${SENHA_RESULTADO || ''}|pitch-extensao`;
const COOKIE = 'pitch_sess';
const SESSAO_HORAS = 12;

function igual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function assinar(payload) {
  const corpo = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', SEGREDO).update(corpo).digest('base64url');
  return `${corpo}.${mac}`;
}

function verificar(token) {
  if (!token || !token.includes('.')) return null;
  const [corpo, mac] = token.split('.');
  const esperado = crypto.createHmac('sha256', SEGREDO).update(corpo).digest('base64url');
  if (mac.length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(esperado))) return null;
  try {
    const p = JSON.parse(Buffer.from(corpo, 'base64url').toString());
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}

function lerCookie(req, nome) {
  const m = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(nome + '='));
  return m ? decodeURIComponent(m.slice(nome.length + 1)) : null;
}

function sessao(req) { return verificar(lerCookie(req, COOKIE)); }

function definirSessao(res, payload) {
  const token = assinar({ ...payload, exp: Date.now() + SESSAO_HORAS * 3600 * 1000 });
  const seguro = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSAO_HORAS * 3600}${seguro}`);
}

function limparSessao(res) {
  const seguro = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${seguro}`);
}

// ─── HTTP ──────────────────────────────────────────────────────────────
function json(res, status, corpo) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(corpo));
}

async function lerJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const partes = [];
  let tam = 0;
  for await (const p of req) { tam += p.length; if (tam > 20000) throw new Error('corpo grande'); partes.push(p); }
  try { return JSON.parse(Buffer.concat(partes).toString() || '{}'); } catch { return {}; }
}

function ip(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim();
}

function exigirJson(req, res) {
  if (req.method === 'POST' && !String(req.headers['content-type'] || '').includes('application/json')) {
    json(res, 415, { erro: 'Envie JSON.' });
    return false;
  }
  return true;
}

const slug = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

module.exports = { db, igual, definirSessao, limparSessao, sessao, json, lerJson, ip, exigirJson, slug, SENHA_AVALIAR, SENHA_RESULTADO };
