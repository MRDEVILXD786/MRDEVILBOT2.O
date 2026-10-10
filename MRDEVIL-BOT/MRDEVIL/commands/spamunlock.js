module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'spamunlock',
    aliases: ['sunlock', 'spamfree'],
    description: 'SpamLock hatao kisi user ka — sirf Bot Owner kar sakta hai.',
    usage: 'spamunlock @mention / reply',
    category: 'Owner',
    prefix: true,
    ownerOnly: true
  },

  async run({ api, event, send, Users, config, isAdmin }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    // Sirf Bot Owner (ADMINBOT) use kar sakta hai
    const isOwner = config.ADMINBOT?.includes(senderID) || config.ADMINBOT?.includes(String(senderID));
    if (!isOwner) {
      return send.reply(
        `╭─── « ❌ 𝗡𝗢 𝗣𝗘𝗥𝗠𝗜𝗦𝗦𝗜𝗢𝗡 » ───⟡\n` +
        `│\n` +
        `│ 🔒 Ye command sirf Bot Owner\n` +
        `│    ke liye hai!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    // Target user dhundo — mention ya reply se
    let targetID = null;
    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length > 0) {
      targetID = mentionKeys[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    }

    if (!targetID) {
      return send.reply(
        `╭─── « ℹ️ 𝗨𝗦𝗔𝗚𝗘 » ───⟡\n` +
        `│\n` +
        `│ 📌 Usage:\n` +
        `│    .spamunlock @mention\n` +
        `│    ya kisi message ko\n` +
        `│    reply karke\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    // Owner ko unlock nahi kar sakte (safety)
    if (config.ADMINBOT?.includes(targetID) || config.ADMINBOT?.includes(String(targetID))) {
      return send.reply('⚠️ Bot Owner ko SpamUnlock ki zaroorat nahi!');
    }

    try {
      const userData = await Users.get(targetID);
      const userName = await Users.getNameUser(targetID);

      if (!userData?.banned) {
        return send.reply(
          `╭─── « ℹ️ 𝗜𝗡𝗙𝗢 » ───⟡\n` +
          `│\n` +
          `│ ✅ ${userName}\n` +
          `│    pehle se free hai!\n` +
          `│    Koi lock nahi laga hua.\n` +
          `│\n` +
          `╰───────────────⟡`
        );
      }

      const isSpamLock = userData?.banReason?.startsWith('⚠️ SpamLock');

      await Users.unban(targetID);

      return send.reply(
        `╭─── « ✅ 𝗦𝗣𝗔𝗠𝗨𝗡𝗟𝗢𝗖𝗞 » ───⟡\n` +
        `│\n` +
        `│ 👤 User: ${userName}\n` +
        `│ 🆔 ID: ${targetID}\n` +
        `│\n` +
        `│ ${isSpamLock ? '🔓 SpamLock hata diya gaya!' : '🔓 Ban hata diya gaya!'}\n` +
        `│ ✅ Ab ye bot dobara\n` +
        `│    use kar sakta hai.\n` +
        `│\n` +
        `│ 👑 By: Bot Owner\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    } catch (err) {
      return send.reply('❌ SpamUnlock fail ho gaya: ' + err.message);
    }
  }
};
