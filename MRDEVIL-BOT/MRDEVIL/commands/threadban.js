const moment = require('moment-timezone');

// Animated loading helper using editMessage
async function animateMsg(api, threadID, frames, delayMs = 500) {
  return new Promise(resolve => {
    api.sendMessage(frames[0], threadID, async (err, info) => {
      if (err || !info) return resolve(null);
      for (let i = 1; i < frames.length; i++) {
        await new Promise(r => setTimeout(r, delayMs));
        try { api.editMessage(frames[i], info.messageID); } catch {}
      }
      resolve(info);
    });
  });
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'threadban',
    aliases: ['tban', 'groupban', 'blockthread'],
    description: 'Ban ya unban karo kisi bhi group ko bot se',
    usage: 'threadban [ban/unban/status] [tid?] [reason?]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, args, send, Threads, config }) {
    const { threadID, senderID } = event;
    const action = args[0]?.toLowerCase();
    const targetTID = args[1] && /^\d+$/.test(args[1]) ? args[1] : threadID;
    const reason = args[1] && /^\d+$/.test(args[1]) ? args.slice(2).join(' ') : args.slice(1).join(' ');
    const time = moment().tz('Asia/Karachi').format('hh:mm:ss A | DD/MM/YYYY');

    // ── No action → show status ─────────────────────────────────
    if (!action || action === 'status' || action === 'check') {
      const thread = await Threads.get(targetTID).catch(() => null);
      const isBanned = thread?.banned === 1;
      return send.reply(
        `╭─── « 🔍 𝗧𝗛𝗥𝗘𝗔𝗗 𝗦𝗧𝗔𝗧𝗨𝗦 » ───⟡\n` +
        `│\n` +
        `│ 🆔 TID    : ${targetTID}\n` +
        `│ 📊 Status : ${isBanned ? '🔴 BANNED' : '🟢 ACTIVE'}\n` +
        `│ 🕐 Time   : ${time}\n` +
        `│\n` +
        `│ 📌 Usage:\n` +
        `│  ├ .tban ban [tid] [reason]\n` +
        `│  ├ .tban unban [tid]\n` +
        `│  └ .tban status [tid]\n` +
        `│\n` +
        `╰───────────────────────────⟡`
      );
    }

    // ── BAN ─────────────────────────────────────────────────────
    if (action === 'ban' || action === 'block') {
      const banReason = reason || 'Bot Admin dwara ban kiya gaya';

      await animateMsg(api, threadID, [
        `╭─── « 🔒 𝗕𝗔𝗡𝗡𝗜𝗡𝗚 » ───⟡\n│\n│ ⏳ Processing...\n│\n╰──────────────⟡`,
        `╭─── « 🔒 𝗕𝗔𝗡𝗡𝗜𝗡𝗚 » ───⟡\n│\n│ ⚙️  Ban applying...\n│\n╰──────────────⟡`,
        `╭─── « 🔒 𝗕𝗔𝗡𝗡𝗜𝗡𝗚 » ───⟡\n│\n│ ✅ Done!\n│\n╰──────────────⟡`,
      ]);

      await Threads.ban(targetTID, banReason);

      let threadName = 'Unknown';
      try {
        const info = await api.getThreadInfo(targetTID);
        threadName = info.threadName || info.name || 'Unknown';
      } catch {}

      return send.reply(
        `╭─── « 🚫 𝗧𝗛𝗥𝗘𝗔𝗗 𝗕𝗔𝗡𝗡𝗘𝗗 » ───⟡\n` +
        `│\n` +
        `│ 📛 Group  : ${threadName}\n` +
        `│ 🆔 TID    : ${targetTID}\n` +
        `│ ❌ Reason : ${banReason}\n` +
        `│ 🕐 Time   : ${time}\n` +
        `│\n` +
        `│ 🤖 Bot ab is group mein\n` +
        `│    respond nahi karega.\n` +
        `│\n` +
        `╰─────────────────────────────⟡`
      );
    }

    // ── UNBAN ────────────────────────────────────────────────────
    if (action === 'unban' || action === 'unblock') {
      await animateMsg(api, threadID, [
        `╭─── « 🔓 𝗨𝗡𝗕𝗔𝗡𝗡𝗜𝗡𝗚 » ───⟡\n│\n│ ⏳ Processing...\n│\n╰───────────────⟡`,
        `╭─── « 🔓 𝗨𝗡𝗕𝗔𝗡𝗡𝗜𝗡𝗚 » ───⟡\n│\n│ ⚙️  Lifting ban...\n│\n╰───────────────⟡`,
        `╭─── « 🔓 𝗨𝗡𝗕𝗔𝗡𝗡𝗜𝗡𝗚 » ───⟡\n│\n│ ✅ Done!\n│\n╰───────────────⟡`,
      ]);

      await Threads.unban(targetTID);

      let threadName = 'Unknown';
      try {
        const info = await api.getThreadInfo(targetTID);
        threadName = info.threadName || info.name || 'Unknown';
      } catch {}

      return send.reply(
        `╭─── « ✅ 𝗧𝗛𝗥𝗘𝗔𝗗 𝗨𝗡𝗕𝗔𝗡𝗡𝗘𝗗 » ───⟡\n` +
        `│\n` +
        `│ 📛 Group  : ${threadName}\n` +
        `│ 🆔 TID    : ${targetTID}\n` +
        `│ 🕐 Time   : ${time}\n` +
        `│\n` +
        `│ 🟢 Bot ab is group mein\n` +
        `│    dobara respond karega!\n` +
        `│\n` +
        `╰────────────────────────────────⟡`
      );
    }

    return send.reply(
      `╭─── « ❓ 𝗛𝗘𝗟𝗣 » ───⟡\n` +
      `│\n` +
      `│ Usage:\n` +
      `│  ├ .tban ban [tid] [reason]\n` +
      `│  ├ .tban unban [tid]\n` +
      `│  └ .tban status [tid]\n` +
      `│\n` +
      `│ TID nahi diya to current\n` +
      `│ group pe apply hoga.\n` +
      `│\n` +
      `╰──────────────────────⟡`
    );
  }
};
