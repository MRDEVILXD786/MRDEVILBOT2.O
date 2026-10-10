const axios = require('axios'), fs = require('fs-extra'), path = require('path'), cacheDir = path.join(__dirname, '..', 'cache', 'text2video'), frames = [
    '🎬 Video generate ho rahi hai...\n\n⌛▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒  10%',
    '🤖 AI prompt process kar raha hai...\n\n⌛▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒  30%',
    '🎞️ Scenes bana raha hai...\n\n⏳▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒  50%',
    '📥 Video render ho rahi hai...\n\n⏳▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒  70%',
    '📦 File ready ho rahi hai...\n\n⏳▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒  90%',
    '✅ Complete!\n\n🟢▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% 😍'
  ];
module.exports = {
  'config': {
    'credits': 'MR DEVIL',
    'name': 'text2video',
    'aliases': [
      't2v',
      'makevideo',
      'vidgen'
    ],
    'description': 'Text se AI video generate karo.',
    'usage': 'text2video [prompt]',
    'category': 'AI',
    'prefix': !![],
    'adminOnly': ![],
    'cooldowns': 30
  },
  async 'run'({
    api: v1,
    event: v2,
    args: v3,
    send: v4
  }) {
    const {
      threadID: v5,
      messageID: v6
    } = v2;
    if (!v3.length)
      return v4.reply('╭──── 🎬 TEXT2VIDEO ────╮\n' + '│\n' + '│  Text se AI video\n' + '│  generate karta hai!\n' + '│\n' + '│  📌 Usage:\n' + '│  .text2video cat playing\n' + '│              football\n' + '│\n' + '│  💡 Tips:\n' + '│  • English prompt dalo\n' + '│  • Short & clear likho\n' + '│\n' + '╰────────────────────╯');
    const v7 = v3.join(' '), v8 = await v1.sendMessage(frames[0], v5), v9 = v8?.messageID;
    try {
      await v1.editMessage(frames[1], v9, v5);
      const v10 = await axios.get('https://anabot.my.id/api/ai/text2video', {
        'params': {
          'prompt': v7,
          'apikey': 'freeApikey'
        },
        'headers': { 'accept': 'application/json' },
        'timeout': 120000,
        'validateStatus': () => !![]
      });
      if (v10.status !== 200 || !v10.data?.success || !v10.data?.data?.result) {
        try {
          v1.unsendMessage(v9);
        } catch {
        }
        return v4.reply('❌ Video generate nahi ho saki. Thoda aur wait karke dobara try karo.');
      }
      const v11 = v10.data.data.result;
      console.log('[text2video] URL: ' + v11), await v1.editMessage(frames[2], v9, v5), fs.mkdirSync(cacheDir, { 'recursive': !![] });
      const v12 = path.join(cacheDir, 't2v_' + Date.now() + '.mp4');
      await v1.editMessage(frames[3], v9, v5);
      const v13 = await axios.get(v11, {
        'responseType': 'arraybuffer',
        'timeout': 120000,
        'headers': { 'User-Agent': 'Mozilla/5.0' },
        'maxRedirects': 5
      });
      if (!v13.data || v13.data.byteLength < 1000) {
        try {
          v1.unsendMessage(v9);
        } catch {
        }
        return v4.reply('❌ Video file empty aayi. Dobara try karo.');
      }
      const v14 = (v13.data.byteLength / 1024 / 1024).toFixed(2);
      fs.writeFileSync(v12, Buffer.from(v13.data)), console.log('[text2video] Saved: ' + v14 + ' MB'), await v1.editMessage(frames[4], v9, v5), await v1.editMessage(frames[5], v9, v5), v1.setMessageReaction('✅', v6, () => {
      }, !![]), v1.sendMessage({
        'body': '🎬 𝐀𝐈 𝐕𝐢𝐝𝐞𝐨 𝐑𝐞𝐚𝐝𝐲!\n' + '━━━━━━━━━━━━━━━━━━━━\n' + ('📝 𝐏𝐫𝐨𝐦𝐩𝐭 : ' + v7.slice(0, 60) + (v7.length > 60 ? '...' : '') + '\n') + ('📦 𝐒𝐢𝐳𝐞   : ' + v14 + ' MB\n') + '🤖 𝐀𝐈     : Gemini Powered\n' + '━━━━━━━━━━━━━━━━━━━━\n' + '✅ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐁𝐎𝐓',
        'attachment': fs.createReadStream(v12)
      }, v5, () => {
        try {
          fs.unlinkSync(v12);
        } catch {
        }
        try {
          v1.unsendMessage(v9);
        } catch {
        }
      }, v6);
    } catch (v15) {
      console.error('[text2video] Error:', v15.message);
      try {
        v1.editMessage('❌ Error: ' + v15.message, v9, v5);
      } catch {
      }
      v1.setMessageReaction('❌', v6, () => {
      }, !![]);
    }
  }
};