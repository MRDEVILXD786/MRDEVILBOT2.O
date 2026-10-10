const moment = require('moment-timezone');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'sentnoti',
    aliases: ['broadcastall', 'sendall', 'broadcast'],
    description: 'Sab groups mein message broadcast karo',
    usage: 'sentnoti [message]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, args, send, config }) {
    const { threadID } = event;
    const message = args.join(' ');
    const time = moment().tz('Asia/Karachi').format('hh:mm:ss A | DD/MM/YYYY');

    if (!message) {
      return send.reply(
        `╭─ « 📢 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 𝗛𝗘𝗟𝗣 » ─⟡\n` +
        `│\n` +
        `│ ⚠️  Message dena hoga!\n` +
        `│\n` +
        `│ 💡 Usage:\n` +
        `│    .sentnoti [message]\n` +
        `│\n` +
        `│ 📌 Example:\n` +
        `│    .sentnoti Bot update aa gaya!\n` +
        `│\n` +
        `╰──────────────────⟡`
      );
    }

    // ── Animated loading message ──────────────────────────────
    const sent = await new Promise(r =>
      api.sendMessage(
        `╭─── « 📢 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 » ───⟡\n│\n│ ⏳ Fetching groups...\n│\n╰──────────────────────⟡`,
        threadID, (err, info) => r(info)
      )
    );

    const tryEdit = async (txt) => {
      try { if (sent) api.editMessage(txt, sent.messageID); } catch {}
    };

    let threadList = [];
    try {
      threadList = await api.getThreadList(500, null, ['INBOX']);
    } catch {}

    const groups = threadList.filter(t => t.isGroup && t.threadID !== threadID);
    if (!groups.length) {
      await tryEdit(
        `╭─── « ❌ 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 » ───⟡\n│\n│ Koi group nahi mila!\n│\n╰──────────────────────⟡`
      );
      return;
    }

    await tryEdit(
      `╭─── « 📢 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 » ───⟡\n│\n│ 📤 Sending to ${groups.length} groups...\n│ ⏳ Please wait...\n│\n╰──────────────────────⟡`
    );

    const ownerID  = config.ADMINBOT?.[0];
    const botName  = config.BOTNAME || 'MR DEVIL BOT';
    let success = 0, failed = 0;

    const broadcastMsg =
      `╭─── « 📢 𝗔𝗗𝗠𝗜𝗡 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 » ───⟡\n` +
      `│\n` +
      `│ 📝 ${message}\n` +
      `│\n` +
      `│ 🕐 ${time}\n` +
      `│ 🤖 ${botName}\n` +
      `│\n` +
      `╰────────────────────────────────────⟡`;

    for (const group of groups) {
      const tid = group.threadID || group.id;
      try {
        if (ownerID) {
          await api.shareContact(broadcastMsg, ownerID, tid);
        } else {
          await api.sendMessage(broadcastMsg, tid);
        }
        success++;
      } catch { failed++; }
      await new Promise(r => setTimeout(r, 2500));
    }

    await tryEdit(
      `╭─── « ✅ 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 𝗗𝗢𝗡𝗘 » ───⟡\n` +
      `│\n` +
      `│ 📊 Total   : ${groups.length} groups\n` +
      `│ ✅ Success : ${success}\n` +
      `│ ❌ Failed  : ${failed}\n` +
      `│ 🕐 Time    : ${time}\n` +
      `│\n` +
      `╰───────────────────────────────────⟡`
    );
  }
};
