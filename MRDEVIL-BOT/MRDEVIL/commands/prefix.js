const path = require('path');
const fs   = require('fs-extra');
const moment = require('moment-timezone');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'prefix',
    aliases: ['px', 'botprefix', 'changeprefix'],
    description: 'Bot prefix dikhao ya change karo',
    usage: 'prefix | prefix [naya_prefix]',
    category: 'Info',
    prefix: 'both'
  },

  async run({ api, event, args, send, config, client, Users, isAdmin }) {
    const { threadID, senderID } = event;
    const currentPrefix = config.PREFIX || '.';
    const time = moment().tz('Asia/Karachi').format('hh:mm:ss A');
    const date = moment().tz('Asia/Karachi').format('DD/MM/YYYY');

    const getRealUptime = require('../../controller/utility/getRealUptime');
    const uptime  = getRealUptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const seen = new Set();
    client?.commands?.forEach(c => { if (c.config?.name) seen.add(c.config.name.toLowerCase()); });
    const cmdCount = seen.size || 138;

    // ── Show info (no arg) ──────────────────────────────────────
    if (!args[0]) {
      let senderName = 'User';
      try { senderName = await Users.getNameUser(senderID); } catch {}

      return send.reply(
        `╭── « 🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 » ─⟡\n` +
        `│\n` +
        `│ 👋 Hello, ${senderName}!\n` +
        `│\n` +
        `│ 🔧 Bot    : ${config.BOTNAME || 'MR DEVIL BOT'}\n` +
        `│ 📌 Prefix : ${currentPrefix}\n` +
        `│ 📊 Cmds   : ${cmdCount}\n` +
        `│ ⏰ Uptime : ${h}h ${m}m ${s}s\n` +
        `│ 🕐 Time   : ${time}\n` +
        `│ 📅 Date   : ${date}\n` +
        `│\n` +
        `│ 💡 Commands dekhne ke liye:\n` +
        `│    ${currentPrefix}help\n` +
        `│\n` +
        `│ 👑 Prefix change:\n` +
        `│    ${currentPrefix}prefix [naya]\n` +
        `│    (Sirf Bot Admin)\n` +
        `│\n` +
        `╰──────────────────⟡`
      );
    }

    // ── Change prefix (admin only) ──────────────────────────────
    if (!isAdmin) {
      return send.reply(
        `╭─── « 🚫 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗 » ───⟡\n` +
        `│\n` +
        `│ ❌ Prefix change sirf\n` +
        `│    Bot Admin kar sakta hai!\n` +
        `│\n` +
        `│ 📌 Current Prefix: ${currentPrefix}\n` +
        `│\n` +
        `╰──────────────────────────────⟡`
      );
    }

    const newPrefix = args[0].trim();
    if (newPrefix.length > 5) {
      return send.reply(
        `╭─── « ❌ 𝗘𝗥𝗥𝗢𝗥 » ───⟡\n` +
        `│\n` +
        `│ Prefix maximum 5 characters\n` +
        `│ ka hona chahiye!\n` +
        `│\n` +
        `╰──────────────────────⟡`
      );
    }

    config.PREFIX = newPrefix;
    global.config.PREFIX = newPrefix;
    try {
      const configPath = path.join(__dirname, '../../config.json');
      const cfg = fs.readJsonSync(configPath);
      cfg.PREFIX = newPrefix;
      fs.writeJsonSync(configPath, cfg, { spaces: 2 });
    } catch {}

    return send.reply(
      `╭─── « ✅ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗖𝗛𝗔𝗡𝗚𝗘𝗗 » ───⟡\n` +
      `│\n` +
      `│ 📌 Naya Prefix : ${newPrefix}\n` +
      `│\n` +
      `│ 💡 Ab aise use karo:\n` +
      `│    ${newPrefix}help\n` +
      `│    ${newPrefix}ping\n` +
      `│    ${newPrefix}ai\n` +
      `│\n` +
      `╰──────────────────────────────⟡`
    );
  }
};
