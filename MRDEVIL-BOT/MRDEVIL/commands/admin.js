const fs   = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

const CONFIG_PATH = path.join(__dirname, '../../config.json');

function readCfg() {
  try { return fs.readJsonSync(CONFIG_PATH); } catch { return null; }
}

function saveCfg(cfg) {
  // Keep ADMIN_NAME in sync with first admin's name
  if (cfg.ADMINBOT?.length > 0) {
    const firstUID = cfg.ADMINBOT[0];
    if (cfg.ADMINBOT_NAMES?.[firstUID]) {
      cfg.ADMIN_NAME = cfg.ADMINBOT_NAMES[firstUID];
    }
  }
  fs.writeJsonSync(CONFIG_PATH, cfg, { spaces: 2 });
  if (global.config) {
    global.config.ADMINBOT       = cfg.ADMINBOT;
    global.config.ADMINBOT_NAMES = cfg.ADMINBOT_NAMES;
    global.config.ADMIN_NAME     = cfg.ADMIN_NAME;
  }
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'admin',
    aliases: ['admins', 'botadmin', 'ba'],
    description: 'Bot admins ko manage karo',
    usage: 'admin [add/remove/list/rename] [uid] [name?]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID } = event;
    const action = (args[0] || '').toLowerCase();
    const time   = moment().tz('Asia/Karachi').format('hh:mm:ss A | DD/MM/YYYY');

    const cfg = readCfg();
    if (!cfg) return send.reply('❌ Config file read nahi ho saka.');

    cfg.ADMINBOT       = (cfg.ADMINBOT || []).filter(u => u && String(u).trim());
    cfg.ADMINBOT_NAMES = cfg.ADMINBOT_NAMES || {};

    // ── LIST ────────────────────────────────────────────────────
    if (!action || action === 'list' || action === 'all') {
      const admins = cfg.ADMINBOT;
      if (!admins.length)
        return send.reply('╭─── « 👑 𝗕𝗢𝗧 𝗔𝗗𝗠𝗜𝗡𝗦 » ───⟡\n│\n│ Koi admin set nahi hai.\n│ .admin add [uid] se add karo.\n│\n╰──────────────────────⟡');

      const BADGES = ['👑', '🥈', '🥉', '⭐', '🔰'];
      const ROLES  = ['𝗔𝗗𝗠𝗜𝗡-𝟭', '𝗔𝗗𝗠𝗜𝗡-𝟮', '𝗔𝗗𝗠𝗜𝗡-𝟯', '𝗔𝗗𝗠𝗜𝗡-𝟰', '𝗔𝗗𝗠𝗜𝗡-𝟱'];

      let lines = '';
      for (let i = 0; i < admins.length; i++) {
        const uid    = admins[i];
        const name   = cfg.ADMINBOT_NAMES[uid] || '—';
        const badge  = BADGES[i] || '🔰';
        const role   = ROLES[i]  || `ADMIN-${i + 1}`;
        const fbLink = `facebook.com/profile.php?id=${uid}`;
        lines +=
          `│\n` +
          `│  ${badge} ${role}\n` +
          `│  👤 𝗡𝗮𝗺𝗲 : ${name}\n` +
          `│  🆔 𝗨𝗜𝗗  : ${uid}\n` +
          `│  🌐 𝗟𝗶𝗻𝗸 : ${fbLink}\n` +
          `│`;
        if (i < admins.length - 1) lines += '\n│  ─────────────────────';
      }

      const msg =
        `╔══〔 👑 𝗕𝗢𝗧 𝗔𝗗𝗠𝗜𝗡𝗦 〕══╗\n` +
        `║\n` +
        `║  📊 Total : ${admins.length} Admin${admins.length > 1 ? 's' : ''}\n` +
        `║  🕐 Time  : ${time}\n` +
        `║\n` +
        `╠══════════════════════╣\n` +
        `${lines}\n` +
        `╚══════════════════════╝\n` +
        `   👑 𝗠𝗥 𝗗𝗘𝗩𝗜𝗟 𝗕𝗢𝗧`;

      return send.reply(msg);
    }

    // ── ADD ─────────────────────────────────────────────────────
    if (action === 'add') {
      const uid      = args[1]?.trim();
      const manualName = args.slice(2).join(' ').trim();

      if (!uid || !/^\d+$/.test(uid))
        return send.reply(`╭─── « ❌ 𝗘𝗥𝗥𝗢𝗥 » ───⟡\n│\n│ Valid UID dena hoga!\n│ Usage: .admin add [uid] [name?]\n│\n╰──────────────────────⟡`);

      if (cfg.ADMINBOT.includes(uid))
        return send.reply(`╭─── « ⚠️ 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗔𝗗𝗠𝗜𝗡 » ───⟡\n│\n│ Ye UID pehle se admin hai!\n│ 🆔 ${uid}\n│\n╰────────────────────────────⟡`);

      // Name: manual > API > fallback
      let name = manualName;
      if (!name) {
        try {
          const info = await api.getUserInfo(uid);
          const raw  = info?.[uid];
          const fetched = raw?.name || raw?.firstName || '';
          if (fetched && !fetched.toLowerCase().includes('facebook user')) name = fetched;
        } catch {}
      }
      if (!name) name = 'Admin';

      cfg.ADMINBOT.push(uid);
      cfg.ADMINBOT_NAMES[uid] = name;
      saveCfg(cfg);

      return send.reply(
        `╭─── « ✅ 𝗔𝗗𝗠𝗜𝗡 𝗔𝗗𝗗𝗘𝗗 » ───⟡\n` +
        `│\n` +
        `│ 👤 Name : ${name}\n` +
        `│ 🆔 UID  : ${uid}\n` +
        `│ 🕐 Time : ${time}\n` +
        `│\n` +
        `│ ✨ Ab ye user bot admin hai!\n` +
        `│\n` +
        `╰──────────────────────────────⟡`
      );
    }

    // ── RENAME ──────────────────────────────────────────────────
    if (action === 'rename' || action === 'name') {
      const uid     = args[1]?.trim();
      const newName = args.slice(2).join(' ').trim();

      if (!uid || !/^\d+$/.test(uid) || !newName)
        return send.reply(`╭─── « ❌ 𝗘𝗥𝗥𝗢𝗥 » ───⟡\n│\n│ Usage: .admin rename [uid] [naam]\n│\n╰──────────────────────⟡`);

      if (!cfg.ADMINBOT.includes(uid))
        return send.reply(`╭─── « ⚠️ 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗 » ───⟡\n│\n│ Ye UID admin list mein nahi!\n│ 🆔 ${uid}\n│\n╰───────────────────────────⟡`);

      const oldName = cfg.ADMINBOT_NAMES[uid] || '—';
      cfg.ADMINBOT_NAMES[uid] = newName;
      saveCfg(cfg);

      return send.reply(
        `╭─── « ✏️ 𝗡𝗔𝗠𝗘 𝗨𝗣𝗗𝗔𝗧𝗘𝗗 » ───⟡\n` +
        `│\n` +
        `│ 🆔 UID      : ${uid}\n` +
        `│ 📝 Old Name : ${oldName}\n` +
        `│ ✅ New Name : ${newName}\n` +
        `│\n` +
        `╰──────────────────────────────⟡`
      );
    }

    // ── REMOVE ──────────────────────────────────────────────────
    if (action === 'remove' || action === 'del' || action === 'rm') {
      const uid = args[1]?.trim();

      if (!uid || !/^\d+$/.test(uid))
        return send.reply(`╭─── « ❌ 𝗘𝗥𝗥𝗢𝗥 » ───⟡\n│\n│ Valid UID dena hoga!\n│ Usage: .admin remove [uid]\n│\n╰──────────────────────⟡`);

      if (!cfg.ADMINBOT.includes(uid))
        return send.reply(`╭─── « ⚠️ 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗 » ───⟡\n│\n│ Ye UID admin list mein nahi!\n│ 🆔 ${uid}\n│\n╰───────────────────────────⟡`);

      if (cfg.ADMINBOT.length === 1)
        return send.reply(`╭─── « ❌ 𝗘𝗥𝗥𝗢𝗥 » ───⟡\n│\n│ Aakhri admin ko remove\n│ nahi kar sakte!\n│\n╰──────────────────────⟡`);

      const removedName = cfg.ADMINBOT_NAMES[uid] || uid;
      cfg.ADMINBOT = cfg.ADMINBOT.filter(id => id !== uid);
      delete cfg.ADMINBOT_NAMES[uid];
      saveCfg(cfg);

      return send.reply(
        `╭─── « 🗑️ 𝗔𝗗𝗠𝗜𝗡 𝗥𝗘𝗠𝗢𝗩𝗘𝗗 » ───⟡\n` +
        `│\n` +
        `│ 👤 Name : ${removedName}\n` +
        `│ 🆔 UID  : ${uid}\n` +
        `│ 🕐 Time : ${time}\n` +
        `│\n` +
        `│ ❌ Ye user ab admin nahi.\n` +
        `│\n` +
        `╰─────────────────────────────⟡`
      );
    }

    // ── HELP ────────────────────────────────────────────────────
    return send.reply(
      `╭─── « ❓ 𝗔𝗗𝗠𝗜𝗡 𝗛𝗘𝗟𝗣 » ───⟡\n` +
      `│\n` +
      `│ 📋 .admin list\n` +
      `│ ➕ .admin add [uid] [naam?]\n` +
      `│ ✏️ .admin rename [uid] [naam]\n` +
      `│ ❌ .admin remove [uid]\n` +
      `│\n` +
      `╰───────────────────────────⟡`
    );
  }
};
