module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'nicklock',
    aliases: [],
    description: 'Kisi ka nickname set karke lock karo. Mention karo ya sirf naam likho.',
    usage: 'nicklock @user [nickname]  |  nicklock [nickname]',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },

  async run({ api, event, args, send }) {
    const { threadID, senderID } = event;
    const mentionIDs = Object.keys(event.mentions || {});
    const db = require('../../controller/system/database/index');

    let userID, nick;

    if (mentionIDs.length > 0) {
      userID = mentionIDs[0];
      nick = args.slice(1).join(' ').trim();
    } else {
      userID = senderID;
      nick = args.join(' ').trim();
    }

    if (!nick) {
      return send.reply(
        `❌ Nickname batao!\n\n` +
        `💡 Usage:\n` +
        `• .nicklock @mention Nickname\n` +
        `• .nicklock MyNickname  (apna khud ka)`
      );
    }

    try {
      await api.changeNickname(nick, threadID, userID);

      await db.update(
        db.nicklocks,
        { userId: userID, threadId: threadID },
        { $set: { userId: userID, threadId: threadID, nickname: nick, lockedAt: Date.now() } },
        { upsert: true }
      );

      const label = mentionIDs.length > 0
        ? `User ka`
        : `Tumhara`;

      send.reply(
        `╭─── « 🔒 NICKLOCK » ───⟡\n` +
        `│\n` +
        `│ ✅ ${label} nickname lock ho gaya!\n` +
        `│ 📛 Nickname: ${nick}\n` +
        `│\n` +
        `│ Koi bhi isko change nahi kar sakta\n` +
        `│ jab tak .nickunlock use na karo.\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    } catch (e) {
      send.reply('❌ Failed: ' + e.message);
    }
  }
};
