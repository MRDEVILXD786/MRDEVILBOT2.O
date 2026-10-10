const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'owner',
    aliases: ['dev', 'creator', 'ownerinfo', 'developer'],
    description: 'Show bot owner information',
    usage: 'owner',
    category: 'Info',
    prefix: false
  },

  async run({ api, event, send, config }) {
    const { threadID } = event;

    const ownerName = config.ADMIN_NAME || config.AI_OWNER || 'Owner';
    const botName = config.BOTNAME || 'MR DEVIL BOT';
    const prefix = config.PREFIX || '.';
    const adminID = config.ADMINBOT?.[0] || config.AI_OWNER_UID || null;

    const ownerInfo = `
✨ ━━━━━━━━━━━━━━━━━━━ ✨
       👑 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 👑
✨ ━━━━━━━━━━━━━━━━━━━ ✨

┌────────────────┐
│  👤 ɴᴀᴍᴇ            
│  ➤ ${ownerName.padEnd(18)}
└────────────────┘

┌────────────────┐
│  🤖 ʙᴏᴛ ᴅᴇᴛᴀɪʟꜱ     
└────────────────┘

  📛 ɴᴀᴍᴇ: ${botName}
  ⌨️ ᴘʀᴇꜰɪx: ${prefix}
  📦 ᴠᴇʀꜱɪᴏɴ: 2.0.0
  🛠️ ꜰʀᴀᴍᴇᴡᴏʀᴋ: MRDEVIL-FCA v2

✨ ━━━━━━━━━━━━━━ ✨
   💝 𝐓𝐡𝐚𝐧𝐤𝐬 𝐟𝐨𝐫 𝐔𝐬𝐢𝐧𝐠 💝
✨ ━━━━━━━━━━━━━━ ✨`.trim();

    try {
      // Owner picture: put your photo at MRDEVIL/commands/cache/owner.jpg (or .png)
      // or set OWNER_PIC_URL in config.json
      const dir = path.join(__dirname, 'cache');
      const local = ['owner.jpg', 'owner.jpeg', 'owner.png']
        .map(n => path.join(dir, n)).find(f => fs.existsSync(f));
      let stream = null, tmp = null;

      if (local) {
        stream = fs.createReadStream(local);
      } else if (config.OWNER_PIC_URL) {
        fs.ensureDirSync(dir);
        tmp = path.join(dir, 'owner_tmp_' + Date.now() + '.jpg');
        const res = await axios.get(config.OWNER_PIC_URL, { responseType: 'arraybuffer', timeout: 20000 });
        fs.writeFileSync(tmp, Buffer.from(res.data));
        stream = fs.createReadStream(tmp);
      }

      if (stream) {
        await api.sendMessage({ body: ownerInfo, attachment: stream }, threadID);
        if (tmp) fs.remove(tmp).catch(() => {});
      } else {
        await api.sendMessage(ownerInfo, threadID);
      }

      if (adminID && api.shareContact) {
        return api.shareContact('Owner Profile:', adminID, threadID);
      }
    } catch {
      return send.reply(ownerInfo);
    }
  }
};
