const db = require('../../controller/system/database/index');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'gcnamelock',
    aliases: ['gnlock', 'groupnamelock'],
    description: 'Group ka naam lock karo — koi bhi change karey, bot wapis set kar dega.',
    usage: 'gcnamelock [group name] | gcnamelock off',
    category: 'Group',
    prefix: true,
    groupOnly: true,
    adminOnly: true
  },

  async run({ api, event, args, send, config }) {
    const { threadID } = event;

    const input = args.join(' ').trim();

    if (!input) {
      const existing = await db.findOne(db.gcnamelocks, { threadId: threadID });
      if (existing) {
        return send.reply(
          `╭─── « 🔒 GCNAMELOCK STATUS » ───⟡\n` +
          `│\n` +
          `│ ✅ Lock: ON\n` +
          `│ 📛 Locked Name: ${existing.lockedName}\n` +
          `│\n` +
          `│ 💡 Band karne k liye:\n` +
          `│    .gcnamelock off\n` +
          `│\n` +
          `╰───────────────⟡`
        );
      } else {
        return send.reply(
          `╭─── « 🔒 GCNAMELOCK » ───⟡\n` +
          `│\n` +
          `│ ❌ Abhi koi lock nahi hai.\n` +
          `│\n` +
          `│ 💡 Usage:\n` +
          `│    .gcnamelock [naam]\n` +
          `│\n` +
          `╰───────────────⟡`
        );
      }
    }

    if (input.toLowerCase() === 'off') {
      const removed = await db.remove(db.gcnamelocks, { threadId: threadID });
      if (removed) {
        return send.reply(
          `╭─── « 🔓 GCNAMELOCK OFF » ───⟡\n` +
          `│\n` +
          `│ ✅ Group name lock band kar diya!\n` +
          `│ Ab koi bhi naam change kar sakta hai.\n` +
          `│\n` +
          `╰───────────────⟡`
        );
      } else {
        return send.reply(`❌ Koi lock nahi tha is group mein.`);
      }
    }

    try {
      await api.setTitle(input, threadID);
    } catch {}

    await db.update(
      db.gcnamelocks,
      { threadId: threadID },
      { $set: { threadId: threadID, lockedName: input, lockedAt: Date.now() } },
      { upsert: true }
    );

    send.reply(
      `╭─── « 🔒 GCNAMELOCK ON » ───⟡\n` +
      `│\n` +
      `│ ✅ Group name lock ho gaya!\n` +
      `│ 📛 Locked Name: ${input}\n` +
      `│\n` +
      `│ Jab bhi koi naam change karega,\n` +
      `│ bot wapis "${input}" set kar dega.\n` +
      `│\n` +
      `│ 💡 Band karne k liye:\n` +
      `│    .gcnamelock off\n` +
      `│\n` +
      `╰───────────────⟡`
    );
  }
};
