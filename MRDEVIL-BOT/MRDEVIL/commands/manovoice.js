/*
 * MR DEVIL BOT v2
 * Command: manovoice
 * Owner: MR DEVIL
 * Voice AI toggle — ON karo to har message ka voice mein jawab dega
 */

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'manovoice',
    aliases: ['voiceai', 'voiceon', 'aivoice'],
    description: 'Voice AI on/off karo — har message ka voice mein AI jawab dega.',
    usage: 'manovoice [on/off/status]',
    category: 'AI',
    prefix: true,
    adminOnly: true,
    cooldowns: 3
  },

  async run({ api, event, args, send, Threads, config }) {
    const { threadID, messageID } = event;
    const action = (args[0] || '').toLowerCase();
    const prefix = config?.PREFIX || '.';

    if (!action || action === 'status') {
      const settings = await Threads.getSettings(threadID);
      const isOn = settings?.manovoice === true;

      return send.reply(
        `╭──── « 🎙️ MANO VOICE » ────⟡\n` +
        `│\n` +
        `│ Status: ${isOn ? '✅ ON' : '❌ OFF'}\n` +
        `│\n` +
        `│ 📌 Use:\n` +
        `│   ${prefix}manovoice on\n` +
        `│   ${prefix}manovoice off\n` +
        `│\n` +
        `│ 🎤 ON hone ke baad har\n` +
        `│    message ka AI voice\n` +
        `│    mein jawab ayega!\n` +
        `│\n` +
        `│ ${config.AI_OWNER || 'MR DEVIL'} BOT 👑\n` +
        `╰────────────────────⟡`
      );
    }

    if (!['on', 'off'].includes(action)) {
      return send.reply(`❌ Usage: ${prefix}manovoice [on/off/status]`);
    }

    const enable = action === 'on';
    await Threads.setSettings(threadID, { manovoice: enable });

    try {
      api.setMessageReaction(enable ? '✅' : '❌', messageID, () => {}, true);
    } catch (_) {}

    if (enable) {
      return send.reply(
        `╭──── « 🎙️ VOICE AI ON » ────⟡\n` +
        `│\n` +
        `│ ✅ Mano Voice ON ho gayi!\n` +
        `│\n` +
        `│ 🎤 Ab is group ke har\n` +
        `│    message ka jawab AI\n` +
        `│    voice mein dega!\n` +
        `│\n` +
        `│ ⚠️ Band karne ke liye:\n` +
        `│   ${prefix}manovoice off\n` +
        `│\n` +
        `│ ${config.AI_OWNER || 'MR DEVIL'} BOT 👑\n` +
        `╰──────────────────────⟡`
      );
    } else {
      return send.reply(
        `╭──── « 🎙️ VOICE AI OFF » ────⟡\n` +
        `│\n` +
        `│ ❌ Mano Voice OFF ho gayi!\n` +
        `│\n` +
        `│ 🔇 Ab voice jawab band\n` +
        `│    ho gaya hai.\n` +
        `│\n` +
        `│ ${config.AI_OWNER || 'MR DEVIL'} BOT 👑\n` +
        `╰──────────────────────⟡`
      );
    }
  }
};
