const axios = require('axios'), fs = require('fs-extra'), path = require('path'), cacheDir = path.join(__dirname, '..', 'cache', 'removebg');
module.exports = {
  'config': {
    'credits': 'MR DEVIL',
    'name': 'removebg',
    'aliases': [
      'rmbg',
      'nobg',
      'bgremove'
    ],
    'description': 'Kisi bhi photo ka background hata do.',
    'usage': 'removebg (image attach karo ya reply karo)',
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
      return v3.reply('╭──── 🖼️ REMOVE BG ────╮\n' + '│\n' + '│  Photo ka background\n' + '│  hata deta hai!\n' + '│\n' + '│  📌 Kaise use karein:\n' + '│  1. Kisi photo pe reply\n' + '│     karke .removebg likho\n' + '│  2. Ya photo ke saath\n' + '│     .removebg bhejo\n' + '│\n' + '╰────────────────────╯');
    const v11 = await v1.sendMessage('🔄 Background hata raha hun...\n⏳ Thoda wait karo...', v4), v12 = v11?.messageID;
    try {
      const v13 = await axios.get('https://anabot.my.id/api/ai/removebg', {
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
        return v3.reply('❌ Background nahi hata saka. Koi aur photo try karo.');
      }
      const v14 = v13.data.data.result;
      console.log('[removebg] Result: ' + v14), fs.mkdirSync(cacheDir, { 'recursive': !![] });
      const v15 = path.join(cacheDir, 'rmbg_' + Date.now() + '.png'), v16 = await axios.get(v14, {
          'responseType': 'arraybuffer',
          'timeout': 30000,
          'headers': { 'User-Agent': 'Mozilla/5.0' },
          'maxRedirects': 5
        });
      if (!v16.data || v16.data.byteLength < 100) {
        try {
          v1.unsendMessage(v12);
        } catch {
        }
        return v3.reply('❌ Result image empty aayi. Dobara try karo.');
      }
      fs.writeFileSync(v15, Buffer.from(v16.data));
      try {
        v1.unsendMessage(v12);
      } catch {
      }
      v1.sendMessage({
        'body': '✅ 𝐁𝐚𝐜𝐤𝐠𝐫𝐨𝐮𝐧𝐝 𝐇𝐚𝐭𝐚 𝐃𝐢𝐲𝐚!\n' + '━━━━━━━━━━━━━━━━━━━━\n' + '🖼️ Format : PNG (Transparent)\n' + '🤖 AI     : Gemini Powered\n' + '━━━━━━━━━━━━━━━━━━━━\n' + '✅ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐁𝐎𝐓',
        'attachment': fs.createReadStream(v15)
      }, v4, () => {
        try {
          fs.unlinkSync(v15);
        } catch {
        }
      }, v5);
    } catch (v17) {
      console.error('[removebg] Error:', v17.message);
      try {
        v1.unsendMessage(v12);
      } catch {
      }
      v3.reply('❌ Error: ' + v17.message);
    }
  }
};