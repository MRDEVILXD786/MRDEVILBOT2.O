const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const cacheDir = path.join(__dirname, "cache", "kiss");

const kissMsgs = [
  (s, v) => `╭─── « 💋 𝐒𝐖𝐄𝐄𝐓 𝐊𝐈𝐒𝐒 » ───⟡\n│\n│ 💝 ${s} ne ${v} ko\n│    pyar se kiss diya! 😘\n│\n│ 🌸 "Dil se dil milta hai!"\n│\n│ ${config.AI_OWNER || 'MR DEVIL'} BOT 💞\n╰───────────────⟡`,
  (s, v) => `╭─── « ❤️ 𝐋𝐎𝐕𝐄 𝐀𝐓𝐓𝐀𝐂𝐊 » ───⟡\n│\n│ 😍 ${s} → ${v}\n│    Muah! 💋\n│\n│ 🌹 "Ishq mein pagal ho gaye!"\n│\n│ ${config.AI_OWNER || 'MR DEVIL'} BOT 💕\n╰───────────────⟡`,
  (s, v) => `╭─── « 🌺 𝐑𝐎𝐌𝐀𝐍𝐓𝐈𝐂 » ───⟡\n│\n│ 💘 ${s} ne ${v} ko\n│    kiss karke khush kar diya! 😘\n│\n│ ✨ "Yeh lamha yaad rahega!"\n│\n│ 💖 MR DEVIL BOT\n╰───────────────⟡`,
  (s, v) => `╭─── « 🦋 𝐊𝐈𝐒𝐒 𝐓𝐈𝐌𝐄 » ───⟡\n│\n│ 💫 ${s} aur ${v} ka pyar\n│    dekhne wala hai! 💋\n│\n│ 🌙 "Mohabbat zindabad!"\n│\n│ 🌟 MR DEVIL BOT\n╰───────────────⟡`,
];

async function getKissGif() {
  const res = await axios.get("https://nekos.life/api/v2/img/kiss", { timeout: 12000 });
  const gifUrl = res.data?.url;
  if (!gifUrl) throw new Error("No URL from API");
  const dl = await axios.get(gifUrl, { responseType: "arraybuffer", timeout: 15000 });
  return Buffer.from(dl.data);
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "kiss",
    aliases: ["smooch", "muah", "pyar"],
    description: "Kisi ko pyar se kiss do — with anime gif!",
    usage: "kiss [@mention / reply]",
    category: "Fun",
    prefix: true,
    cooldowns: 5
  },

  async run({ api, event, send, Users , config }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    let victimID = null;
    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length > 0) victimID = mentionKeys[0];
    else if (messageReply) victimID = messageReply.senderID;

    if (!victimID) {
      return send.reply(
        `╭─── « 💋 KISS COMMAND » ───⟡\n│\n│ ⚠️ Kisi ko tag karo ya\n│    uske message pe reply karo!\n│\n│ 💡 Usage: .kiss @naam\n│\n╰───────────────⟡`
      );
    }
    if (victimID === senderID) {
      return send.reply(
        `╭─── « ❌ ERROR » ───⟡\n│\n│ 😂 Apne aap ko kiss nahi\n│    kar sakte bhai!\n│\n│ 💡 Kisi aur ko tag karo!\n│\n╰───────────────⟡`
      );
    }

    try { api.setMessageReaction("💋", messageID, () => {}, true); } catch {}

    const senderName = await Users.getNameUser(senderID).catch(() => "Bae");
    const victimName = await Users.getNameUser(victimID).catch(() => "Jaan");
    const msgBody = kissMsgs[Math.floor(Math.random() * kissMsgs.length)](senderName, victimName);

    try {
      const buf = await getKissGif();
      await fs.ensureDir(cacheDir);
      const gifPath = path.join(cacheDir, `kiss_${Date.now()}.gif`);
      await fs.writeFile(gifPath, buf);

      await new Promise((resolve, reject) => {
        api.sendMessage(
          {
            body: msgBody,
            attachment: fs.createReadStream(gifPath),
            mentions: [
              { tag: senderName, id: senderID },
              { tag: victimName, id: victimID }
            ]
          },
          threadID,
          async (err, info) => {
            await fs.unlink(gifPath).catch(() => {});
            if (err) return reject(err);
            resolve(info);
          },
          messageID
        );
      });
    } catch (err) {
      console.error("[kiss]", err.message);
      api.sendMessage(
        {
          body: msgBody,
          mentions: [
            { tag: senderName, id: senderID },
            { tag: victimName, id: victimID }
          ]
        },
        threadID,
        null,
        messageID
      );
    }
  }
};
