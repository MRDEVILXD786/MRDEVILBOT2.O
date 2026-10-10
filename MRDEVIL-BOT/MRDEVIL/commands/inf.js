const axios  = require('axios');
const fs     = require('fs-extra');
const path   = require('path');
const moment = require('moment-timezone');

const CACHE_DIR = path.join(__dirname, 'cache');
const BG_IMAGES = [
  "https://i.imgur.com/Kj2CmiZ.jpeg",
  "https://i.imgur.com/yiNOiVU.jpeg",
  "https://i.postimg.cc/Sx7Yk5D0/ef81664323554dd5c8f17f0826e26e5e.jpg",
  "https://i.postimg.cc/DwqYrqPQ/b123e2cb78bcb4fa5dcb53dfdeed2611.jpg"
];

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'inf',
    aliases: ['info', 'botinfo', 'bi'],
    description: 'Bot aur admin ki complete info',
    usage: 'inf',
    category: 'Info',
    prefix: 'both'
  },

  async run({ api, event, send, config, client }) {
    const { threadID, messageID } = event;

    const getRealUptime = require('../../controller/utility/getRealUptime');
    const uptime  = getRealUptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const now  = moment().tz('Asia/Karachi');
    const time = now.format('hh:mm:ss A');
    const date = now.format('DD/MM/YYYY');

    const seen = new Set();
    client?.commands?.forEach(c => { if (c.config?.name) seen.add(c.config.name.toLowerCase()); });
    const cmdCount = seen.size || 138;

    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    const body =
      `╭─ « 🇵🇰 𝗔𝗗𝗠𝗜𝗡 & 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 » ─⟡\n` +
      `│\n` +
      `│ 🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲  : ${config.BOTNAME || 'MR DEVIL BOT'}\n` +
      `│ 📌 𝗣𝗿𝗲𝗳𝗶𝘅    : ${config.PREFIX || '.'}\n` +
      `│ 📊 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 : ${cmdCount}\n` +
      `│ 💾 𝗥𝗔𝗠       : ${mem} MB\n` +
      `│\n` +
      `│ ━━━━━━━━━━━━━━━━━━━\n` +
      `│\n` +
      `│ ⏰ 𝗨𝗽𝘁𝗶𝗺𝗲   : ${h}h ${m}m ${s}s\n` +
      `│ 🕐 𝗧𝗶𝗺𝗲     : ${time}\n` +
      `│ 📅 𝗗𝗮𝘁𝗲     : ${date}\n` +
      `│ 🌐 𝗧𝗶𝗺𝗲𝘇𝗼𝗻𝗲 : Asia/Karachi\n` +
      `│\n` +
      `│ ━━━━━━━━━━━━━━━━━━━\n` +
      `│\n` +
      `│ 👑 𝗕𝗼𝘁 𝗔𝗱𝗺𝗶𝗻 : ${config.ADMIN_NAME || config.AI_OWNER || 'MR DEVIL'}\n` +
      `│ ⚙️  𝗙𝗖𝗔       : mrdevil-fca v2\n` +
      `│\n` +
      `╰─────────────────────⟡`;

    // Try to send with random background image
    try {
      await fs.ensureDir(CACHE_DIR);
      const imgURL  = BG_IMAGES[Math.floor(Math.random() * BG_IMAGES.length)];
      const tmpPath = path.join(CACHE_DIR, `inf_${Date.now()}.jpg`);

      const res = await axios.get(imgURL, { responseType: 'arraybuffer', timeout: 10000 });
      await fs.writeFile(tmpPath, Buffer.from(res.data));

      api.sendMessage(
        { body, attachment: fs.createReadStream(tmpPath) },
        threadID,
        () => { try { fs.unlinkSync(tmpPath); } catch {} },
        messageID
      );
    } catch {
      // Fallback — text only
      send.reply(body);
    }
  }
};
