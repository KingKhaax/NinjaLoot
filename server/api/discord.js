// Servidor intermedio del bot compartido de NinjaLoot (Vercel, plan Hobby, gratis).
// El token del bot vive aquí como variable de entorno (DISCORD_BOT_TOKEN) y nunca viaja en la aplicación.
// Solo devuelve los códigos de los enlaces de Raidbots que se pegan en un canal; no guarda nada.
//   GET /api/discord?op=info                       -> { clientId, ready }
//   GET /api/discord?channel=ID                    -> { channel, lastId }  (al conectar: nombre del canal y último mensaje)
//   GET /api/discord?channel=ID&after=MSG_ID       -> { lastId, ids, empty }

const API = 'https://discord.com/api/v10';
const RAIDBOTS = /raidbots\.com\/(?:simbot\/report|reports)\/([A-Za-z0-9]+)/g;
const hits = new Map(); // límite sencillo por IP y por instancia
const cache = new Map(); // misma consulta en los últimos segundos (varios PCs mirando el mismo canal)

const send = (res, status, obj) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('cache-control', 'no-store');
  res.status(status).json(obj);
};

function limited(req) {
  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim(), now = Date.now();
  const h = (hits.get(ip) || []).filter(x => now - x < 60000);
  h.push(now); hits.set(ip, h);
  if (hits.size > 5000) hits.clear();
  return h.length > 40;
}

async function discord(path) {
  const r = await fetch(API + path, { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'User-Agent': 'DiscordBot (https://github.com/KingKhaax/NinjaLoot, relay)' } });
  if (r.status === 429) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error('RATE'), { retry: Math.ceil((j.retry_after || 5) * 1000) }); }
  if (!r.ok) throw Object.assign(new Error('HTTP_' + r.status), { status: r.status });
  return r.json();
}

const linksOf = m => [...[m.content, ...(m.embeds || []).flatMap(e => [e.url, e.title, e.description])].filter(Boolean).join(' ').matchAll(RAIDBOTS)].map(x => x[1]);

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const q = req.query || {};
  if (q.op === 'info') return send(res, 200, { clientId: process.env.DISCORD_CLIENT_ID || null, ready: !!process.env.DISCORD_BOT_TOKEN });
  if (!process.env.DISCORD_BOT_TOKEN) return send(res, 503, { error: 'NOT_CONFIGURED' });
  const channel = String(q.channel || ''), after = String(q.after || '');
  if (!/^\d{15,25}$/.test(channel) || (after && !/^\d{1,25}$/.test(after))) return send(res, 400, { error: 'BAD_REQUEST' });
  if (limited(req)) return send(res, 429, { error: 'RATE', retry: 15000 });
  const key = `${channel}:${after}`, hit = cache.get(key);
  if (hit && Date.now() - hit.at < 4000) return send(res, 200, hit.body);
  try {
    let body;
    if (!after) {
      const ch = await discord(`/channels/${channel}`);
      const last = await discord(`/channels/${channel}/messages?limit=1`);
      body = { channel: ch.name || channel, lastId: (last[0] && last[0].id) || '0' };
    } else {
      const msgs = await discord(`/channels/${channel}/messages?limit=50&after=${after}`);
      msgs.sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
      body = {
        lastId: msgs.length ? msgs[msgs.length - 1].id : after,
        ids: [...new Set(msgs.flatMap(linksOf))],
        // Sin «Message Content Intent» Discord manda los mensajes vacíos
        empty: msgs.some(m => !m.content && !(m.embeds || []).length && !(m.attachments || []).length && !(m.author && m.author.bot)),
      };
    }
    cache.set(key, { at: Date.now(), body });
    if (cache.size > 2000) cache.clear();
    return send(res, 200, body);
  } catch (e) {
    if (e.message === 'RATE') return send(res, 429, { error: 'RATE', retry: e.retry });
    return send(res, e.status === 403 ? 403 : e.status === 404 ? 404 : 502, { error: e.status === 403 ? 'ACCESS' : e.status === 404 ? 'CHANNEL' : e.status === 401 ? 'BOT_TOKEN' : 'NETWORK' });
  }
};
