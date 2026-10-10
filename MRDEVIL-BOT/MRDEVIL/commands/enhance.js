const axios = require('axios'), fs = require('fs-extra'), path = require('path'), cacheDir = path.join(__dirname, '..', 'cache', 'enhance');
module.exports = {
  'config': {
    'credits': 'MR DEVIL',
    'name': 'enhance',
    'aliases': [
      'hd',
      'upscale',
      'improve'
    ],
    'description': 'Photo ki quality enhance aur HD karo AI se.',
    'usage': 'enhance (image attach karo ya reply karo)',
    'category': 'Media',
    'prefix': !![],
    'adminOnly': ![],
    'cooldowns': 10
  },
  async 'run'({
    api: v1,
    event: v2,
    send: v3
  }) {
    const {
      threadID: v4,
      messageID: v5,
      messageReply: v6
    } = v2;
    let v7 = null;
    const v8 = v9 => {
      if (!v9?.length)
        return null;
      for (const v10 of v9) {
        if (v10.type === 'photo' || v10.type === 'sticker')
          return v10.url || v10.previewUrl || v10.previewUrlFallback || null;
      }
      return null;
    };
    v7 = v8(v2.attachments);
    !v7 && v6 && (v7 = v8(v6.attachments));
    if (!v7)
      return v3.reply('╭──── ✨ ENHANCE ────╮\n' + '│\n' + '│  Photo ko HD aur\n' + '│  sharp bana deta hai!\n' + '│\n' + '│  📌 Kaise use karein:\n' + '│  1. Kisi photo pe reply\n' + '│     karke .enhance likho\n' + '│  2. Ya photo ke saath\n' + '│     .enhance bhejo\n' + '│\n' + '╰────────────────────╯');
    const v11 = await v1.sendMessage('✨ Photo enhance ho rahi hai...\n⏳ Thoda wait karo...', v4), v12 = v11?.messageID;
    try {
      const v13 = await axios.get('https://anabot.my.id/api/ai/toEnhance', {
        'params': {
          'imageUrl': v7,
          'apikey': 'freeApikey'
        },
        'headers': { 'accept': 'application/json' },
        'timeout': 60000,
        'validateStatus': () => !![]
      });
      if (v13.status !== 200 || !v13.data?.success || !v13.data?.data?.result) {
        try {
          v1.unsendMessage(v12);
        } catch {
        }
        return v3.reply('❌ Photo enhance nahi ho saki. Koi aur photo try karo.');
      }
      const v14 = v13.data.data.result;
      console.log('[enhance] Result: ' + v14);
      const v15 = v14.split('.').pop().split('?')[0] || 'webp';
      fs.mkdirSync(cacheDir, { 'recursive': !![] });
      const v16 = path.join(cacheDir, 'enhance_' + Date.now() + '.' + v15), v17 = await axios.get(v14, {
          'responseType': 'arraybuffer',
          'timeout': 30000,
          'headers': { 'User-Agent': 'Mozilla/5.0' },
          'maxRedirects': 5
        });
      if (!v17.data || v17.data.byteLength < 100) {
        try {
          v1.unsendMessage(v12);
        } catch {
        }
        return v3.reply('❌ Enhanced image empty aayi. Dobara try karo.');
      }
      fs.writeFileSync(v16, Buffer.from(v17.data));
      try {
        v1.unsendMessage(v12);
      } catch {
      }
      v1.sendMessage({
        'body': '✨ 𝐏𝐡𝐨𝐭𝐨 𝐄𝐧𝐡𝐚𝐧𝐜𝐞𝐝!\n' + '━━━━━━━━━━━━━━━━━━━━\n' + '🖼️ Quality : HD Enhanced\n' + '🤖 AI      : Gemini Powered\n' + '━━━━━━━━━━━━━━━━━━━━\n' + '✅ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐁𝐎𝐓',
        'attachment': fs.createReadStream(v16)
      }, v4, () => {
        try {
          fs.unlinkSync(v16);
        } catch {
        }
      }, v5);
    } catch (v18) {
      console.error('[enhance] Error:', v18.message);
      try {
        v1.unsendMessage(v12);
      } catch {
      }
      v3.reply('❌ Error: ' + v18.message);
    }
  }
};