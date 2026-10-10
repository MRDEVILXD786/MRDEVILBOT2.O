/*
 * MR DEVIL BOT v2
 * Command: joincall
 * Owner: MR DEVIL
 * Group mein call lagata hai — saare members ko mention + MQTT signal + call link
 */

const { v4: uuidv4 } = require('uuid');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'joincall',
    aliases: ['call', 'startcall', 'groupcall', 'vcall'],
    description: 'Group mein call shuru karo — saare members ko notify karega.',
    usage: 'joincall',
    category: 'Utility',
    prefix: true,
    groupOnly: true,
    cooldowns: 15
  },

  async run({ api, event, send, config }) {
    const { threadID, senderID } = event;
    const botName = config?.BOTNAME || 'BOT';
    const botID = api.getCurrentUserID();

    // ── Step 1: Loading message ──────────────────────────────
    const loadMsg = await send.reply(
      `╭──── « 📞 CALL » ────⟡\n` +
      `│\n` +
      `│ 📡 Group call shuru\n` +
      `│    ho rahi hai...\n` +
      `│\n` +
      `╰──────────────────⟡`
    );
    const mid = loadMsg?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    // ── Step 2: Thread info lao (participants ke liye) ───────
    let participantIDs = [];
    let threadName = 'Group';
    try {
      const info = await api.getThreadInfo(threadID);
      participantIDs = (info.participantIDs || []).filter(id => id !== botID);
      threadName = info.threadName || 'Group';
    } catch (_) {}

    await sleep(1000);

    // ── Step 3: MQTT WebRTC call signal publish karo ─────────
    try {
      const mqttClient = api.ctx?.mqttClient || (api._ctx && api._ctx.mqttClient);
      if (mqttClient && typeof mqttClient.publish === 'function') {
        const callPayload = JSON.stringify({
          to: threadID,
          from: botID,
          media: 1,
          type: "start_call",
          session_id: (typeof uuidv4 === 'function') ? uuidv4() : Math.random().toString(36).slice(2),
          call_id: (typeof uuidv4 === 'function') ? uuidv4() : Math.random().toString(36).slice(2)
        });
        mqttClient.publish('/webrtc', callPayload, { qos: 1, retain: false });
      }
    } catch (_) {}

    // ── Step 4: Saare members ko mention karo ────────────────
    const callUrl = `https://www.messenger.com/groupcall/${threadID}/`;

    let mentionsObj = {};
    let mentionNames = '';
    const MAX_MENTION = 20;
    const mentionList = participantIDs.slice(0, MAX_MENTION);

    for (const uid of mentionList) {
      mentionsObj[uid] = `@member`;
      mentionNames += `@member `;
    }

    const callBody =
      `╭──── « 📞 GROUP CALL » ────⟡\n` +
      `│\n` +
      `│ 📳 Call aa rahi hai!\n` +
      `│ 🎙️ ${threadName}\n` +
      `│\n` +
      `│ 👇 Link press kar ke\n` +
      `│    call join karo:\n` +
      `│ ${callUrl}\n` +
      `│\n` +
      `│ ${mentionNames.trim()}\n` +
      `│\n` +
      `│ 👑 ${botName}\n` +
      `╰────────────────────⟡`;

    // Mentions ke saath message
    const mentionArr = mentionList.map((uid, i) => ({
      tag: '@member',
      id: uid,
      fromIndex: callBody.indexOf(mentionNames.trim())
    }));

    // ── Step 5: Call notification message bhejo ───────────────
    edit(
      `╭──── « 📞 CALL READY » ────⟡\n` +
      `│\n` +
      `│ ✅ Call tayyar hai!\n` +
      `│ 📲 Sab ko notify kar\n` +
      `│    raha hun...\n` +
      `│\n` +
      `╰──────────────────⟡`
    );

    await sleep(600);

    // Main call message with shareLink
    try {
      if (typeof api.shareLink === 'function') {
        await api.shareLink(
          `📞 GROUP CALL — ${threadName}\n🔗 Join karo: ${callUrl}\n👑 ${botName}`,
          callUrl,
          threadID
        );
      }
    } catch (_) {}

    // Mention message bhejo
    if (mentionList.length > 0) {
      try {
        await api.sendMessage(
          {
            body: `📞 CALL AA RAHI HAI! Join karo 👇\n${callUrl}\n\n` +
                  mentionList.map(() => '@member').join(' '),
            mentions: mentionList.map(uid => ({
              tag: '@member',
              id: uid
            }))
          },
          threadID
        );
      } catch (e) {
        // Fallback: plain message
        try {
          await api.sendMessage(
            `📞 CALL AA RAHI HAI! Join karo 👇\n${callUrl}`,
            threadID
          );
        } catch (_) {}
      }
    }

    // ── Step 6: Final update ──────────────────────────────────
    edit(
      `╭──── « ✅ CALL STARTED » ────⟡\n` +
      `│\n` +
      `│ 📞 Call shuru ho gayi!\n` +
      `│ 👥 ${mentionList.length} members ko\n` +
      `│    notify kiya gaya\n` +
      `│\n` +
      `│ 🔗 ${callUrl}\n` +
      `│\n` +
      `│ 👑 ${botName}\n` +
      `╰──────────────────────⟡`
    );
  }
};
