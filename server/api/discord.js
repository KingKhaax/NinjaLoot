// Servidor intermedio del bot compartido de NinjaLoot (Vercel, plan Hobby, gratis).
// El token del bot vive aquí como variable de entorno (DISCORD_BOT_TOKEN) y nunca viaja en la aplicación.
// Solo devuelve los códigos de los enlaces de Raidbots que se pegan en un canal (y quién los pegó); no guarda nada.
//   GET  /api/discord?op=info                              -> { clientId, ready }
//   GET  /api/discord?channel=ID                           -> { channel, lastId }  (al conectar)
//   GET  /api/discord?op=history&channel=ID&since=MS       -> { channel, lastId, sims }  (sims publicadas desde «since», p. ej. el reinicio semanal)
//   GET  /api/discord?channel=ID&after=MSG_ID              -> { lastId, ids, sims, empty }
//   POST /api/discord?op=dm  { channel, users: [{ id, chars: [nombres] }] }  -> { sent, failed }
//        Recordatorio por mensaje privado a quien le falta la sim. Solo a usuarios que hayan escrito en ese canal
//        y como mucho una tanda por canal cada 3 horas, para que nadie pueda usar el bot para hacer spam.

const API = 'https://discord.com/api/v10';
const RAIDBOTS = /raidbots\.com\/(?:simbot\/report|reports)\/([A-Za-z0-9]+)/g;
const NAME = /^[\p{L}\p{M}' -]{2,24}$/u;
const hits = new Map(); // límite sencillo por IP y por instancia
const cache = new Map(); // misma consulta en los últimos segundos (varios PCs mirando el mismo canal)
const dmLast = new Map(); // canal -> último envío de recordatorios

const send = (res, status, obj) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', 'content-type');
  res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
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

async function discord(path, init = {}) {
  const r = await fetch(API + path, { ...init, headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'User-Agent': 'DiscordBot (https://github.com/KingKhaax/NinjaLoot, relay)', ...(init.body ? { 'content-type': 'application/json' } : {}) } });
  if (r.status === 429) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error('RATE'), { retry: Math.ceil((j.retry_after || 5) * 1000) }); }
  if (!r.ok) throw Object.assign(new Error('HTTP_' + r.status), { status: r.status });
  return r.status === 204 ? null : r.json();
}

const linksOf = m => [...[m.content, ...(m.embeds || []).flatMap(e => [e.url, e.title, e.description])].filter(Boolean).join(' ').matchAll(RAIDBOTS)].map(x => x[1]);
const byId = (a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1);
// Cada enlace de Raidbots con quién lo pegó y cuándo (para vincular personaje ↔ usuario de Discord)
const simsOf = msgs => msgs.flatMap(m => [...new Set(linksOf(m))].map(id => ({ id, at: Date.parse(m.timestamp) || 0, author: m.author ? { id: m.author.id, name: m.author.global_name || m.author.username } : null })));

// Mensajes del canal hasta una fecha (de más nuevo a más viejo, por páginas de 100)
async function history(channel, since, maxPages = 6) {
  const out = [];
  let before = '';
  for (let p = 0; p < maxPages; p++) {
    const page = await discord(`/channels/${channel}/messages?limit=100${before ? `&before=${before}` : ''}`);
    if (!page.length) break;
    out.push(...page);
    const oldest = page[page.length - 1];
    if (Date.parse(oldest.timestamp) < since || page.length < 100) break;
    before = oldest.id;
  }
  return out.filter(m => Date.parse(m.timestamp) >= since).sort(byId);
}

async function sendDms(body) {
  const channel = String(body.channel || '');
  const users = Array.isArray(body.users) ? body.users.slice(0, 40) : [];
  if (!/^\d{15,25}$/.test(channel) || !users.length) return [400, { error: 'BAD_REQUEST' }];
  const last = dmLast.get(channel) || 0;
  if (Date.now() - last < 3 * 3600 * 1000) return [429, { error: 'DM_COOLDOWN', retry: last + 3 * 3600 * 1000 - Date.now() }];
  // Solo a quien haya escrito en ese canal en los últimos 60 días
  const recent = await history(channel, Date.now() - 60 * 864e5, 8);
  const authors = new Set(recent.map(m => m.author && m.author.id).filter(Boolean));
  const ch = await discord(`/channels/${channel}`);
  const guild = ch.guild_id ? await discord(`/guilds/${ch.guild_id}`).catch(() => null) : null;
  dmLast.set(channel, Date.now());
  const sent = [], failed = [];
  for (const u of users) {
    const id = String(u.id || ''), chars = (Array.isArray(u.chars) ? u.chars : []).map(String).filter(n => NAME.test(n)).slice(0, 5);
    if (!/^\d{15,25}$/.test(id) || !chars.length || !authors.has(id)) { failed.push({ id, error: 'NOT_IN_CHANNEL' }); continue; }
    try {
      const dm = await discord('/users/@me/channels', { method: 'POST', body: JSON.stringify({ recipient_id: id }) });
      const content = `👋 ¡Hola! Te falta subir tu simulación de Raidbots de esta semana para **${chars.join(', ')}**.\n`
        + `Pega el enlace de tu Droptimizer en el canal **#${ch.name}**${guild ? ` de **${guild.name}**` : ''} para que salga en NinjaLoot. ¡Gracias!\n`
        + `-# Aviso enviado por el bot NinjaLoot a petición de tu guild.`;
      await discord(`/channels/${dm.id}/messages`, { method: 'POST', body: JSON.stringify({ content, allowed_mentions: { parse: [] } }) });
      sent.push(id);
    } catch (e) { failed.push({ id, error: e.status === 403 ? 'DM_CLOSED' : 'ERROR' }); }
  }
  return [200, { sent, failed }];
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const q = req.query || {};
  if (q.op === 'info') return send(res, 200, { clientId: process.env.DISCORD_CLIENT_ID || null, ready: !!process.env.DISCORD_BOT_TOKEN });
  if (!process.env.DISCORD_BOT_TOKEN) return send(res, 503, { error: 'NOT_CONFIGURED' });
  if (limited(req)) return send(res, 429, { error: 'RATE', retry: 15000 });
  try {
    if (q.op === 'dm') {
      if (req.method !== 'POST') return send(res, 405, { error: 'BAD_REQUEST' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const [status, out] = await sendDms(body);
      return send(res, status, out);
    }
    const channel = String(q.channel || ''), after = String(q.after || '');
    if (!/^\d{15,25}$/.test(channel) || (after && !/^\d{1,25}$/.test(after))) return send(res, 400, { error: 'BAD_REQUEST' });
    if (q.op === 'history') {
      const since = Math.max(Number(q.since) || 0, Date.now() - 14 * 864e5);
      const ch = await discord(`/channels/${channel}`);
      const msgs = await history(channel, since);
      const last = msgs.length ? msgs[msgs.length - 1].id : ((await discord(`/channels/${channel}/messages?limit=1`))[0] || {}).id || '0';
      return send(res, 200, { channel: ch.name || channel, lastId: last, sims: simsOf(msgs) });
    }
    const key = `${channel}:${after}`, hit = cache.get(key);
    if (hit && Date.now() - hit.at < 4000) return send(res, 200, hit.body);
    let body;
    if (!after) {
      const ch = await discord(`/channels/${channel}`);
      const last = await discord(`/channels/${channel}/messages?limit=1`);
      body = { channel: ch.name || channel, lastId: (last[0] && last[0].id) || '0' };
    } else {
      const msgs = (await discord(`/channels/${channel}/messages?limit=50&after=${after}`)).sort(byId);
      const sims = simsOf(msgs);
      body = {
        lastId: msgs.length ? msgs[msgs.length - 1].id : after,
        ids: [...new Set(sims.map(s => s.id))], // formato antiguo (versiones anteriores de NinjaLoot)
        sims,
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
