const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const cacheDir = path.join(__dirname, "cache", "slap");

const slapCaptions = [
  (s, v) => `╭─── « 💥 𝐒𝐋𝐀𝐏 𝐀𝐓𝐓𝐀𝐂𝐊 » ───⟡\n│\n│ 👋 ${s} ne ${v} ko\n│    zor se thappar maara! 😤\n│\n│ 🔥 "Agli baar adab se aana!"\n│\n│ ${config.AI_OWNER || 'MR DEVIL'} BOT 👑\n╰───────────────⟡`,
  (s, v) => `╭─── « 👋 𝐓𝐇𝐀𝐏𝐏𝐀𝐑 » ───⟡\n│\n│ 😵 ${v} bechara!\n│    ${s} ne uthaya haath! 💢\n│\n│ 🤣 "Yeh thappar yaad rahega!"\n│\n│ ${config.AI_OWNER || 'MR DEVIL'} BOT 👑\n╰───────────────⟡`,
  (s, v) => `╭─── « 💢 𝐒𝐋𝐀𝐏 𝐎𝐅 𝐉𝐔𝐒𝐓𝐈𝐂𝐄 » ───⟡\n│\n│ 🔥 ${s} → ${v}\n│    MAAARA!! 😂\n│\n│ 👊 "MR DEVIL BOT se panga mat lo!"\n│\n│ ${config.AI_OWNER || 'MR DEVIL'} BOT 👑\n╰───────────────⟡`,
];

async function getSlapGif() {
  const res = await axios.get("https://nekos.life/api/v2/img/slap", { timeout: 12000 });
  const gifUrl = res.data?.url;
  if (!gifUrl) throw new Error("No URL from API");
  const dl = await axios.get(gifUrl, { responseType: "arraybuffer", timeout: 15000 });
  return { buf: Buffer.from(dl.data), ext: "gif" };
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "slap",
    aliases: ["thappar", "chhapad", "slapvideo"],
    description: "Kisi ko thappar maar do — with anime gif!",
    usage: "slap [@mention / reply]",
    category: "Fun",
    prefix: true,
    cooldowns: 3
  },

  async run({ api, event, send, Users, Currencies , config }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    const COST = 10;
    const userBal = await Currencies.getBalance(senderID);
    if (userBal < COST) {
      return send.reply(
        `╭─── « 𝗖𝗢𝗜𝗡𝗦 𝗞𝗔𝗠 𝗛𝗔𝗜𝗡 » ───⟡\n│\n│ ❌ Ye command ${COST} coins leta hai!\n│ 💰 Tumhare paas: ${userBal} coins\n│\n│ 💡 .work  → +10 coins\n│ 💡 .daily → +5 coins\n│\n╰───────────────⟡`
      );
    }

    let victimID = null;
    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length > 0) victimID = mentionKeys[0];
    else if (messageReply) victimID = messageReply.senderID;

    if (!victimID) {
      return send.reply("👋 *Slap Command*\n\nUse karo:\n.slap @username\n\nYa kisi ke message pe reply karke .slap likho!");
    }
    if (victimID === senderID) {
      return send.reply("❌ Apne aap ko thappar nahi maar sakte bhai! 😂");
    }

    await Currencies.removeBalance(senderID, COST);
    try { api.setMessageReaction("👋", messageID, () => {}, true); } catch {}

    const senderName = await Users.getNameUser(senderID).catch(() => "Bhai");
    const victimName = await Users.getNameUser(victimID).catch(() => "User");
    const msgBody = slapCaptions[Math.floor(Math.random() * slapCaptions.length)](senderName, victimName);

    try {
      const { buf, ext } = await getSlapGif();
      await fs.ensureDir(cacheDir);
      const tmpPath = path.join(cacheDir, `slap_${Date.now()}.${ext}`);
      await fs.writeFile(tmpPath, buf);

      await new Promise((resolve, reject) => {
        api.sendMessage(
          {
            body: msgBody,
            attachment: fs.createReadStream(tmpPath),
            mentions: [{ tag: victimName, id: victimID }]
          },
          threadID,
          async (err, info) => {
            await fs.unlink(tmpPath).catch(() => {});
            if (err) return reject(err);
            resolve(info);
          },
          messageID
        );
      });
    } catch (err) {
      console.error("[slap]", err.message);
      api.sendMessage(
        { body: msgBody, mentions: [{ tag: victimName, id: victimID }] },
        threadID,
        null,
        messageID
      );
    }
  }
};
