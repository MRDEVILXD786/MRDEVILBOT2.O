const axios = require('axios'), fs = require('fs-extra'), path = require('path'), cacheDir = path.join(__dirname, 'cache', 'audio');
module.exports = {
  'config': {
    'credits': 'MR DEVIL',
    'name': 'ytmp3',
    'aliases': [
      'yt',
      'ytaudio',
      'youtubemp3',
      'ytdl'
    ],
    'description': 'YouTube video ko MP3 mein convert karke send karo.',
    'usage': 'ytmp3 [YouTube link]',
    'category': 'Media',
    'prefix': !![],
    'cooldowns': 15
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
    if (!v3[0])
      return v4.reply('❌ YouTube link dena zaroori hai!\n\n' + '📌 𝐔𝐬𝐚𝐠𝐞: .ytmp3 [YouTube link]\n' + '📌 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .ytmp3 https://youtu.be/abc123');
    const v7 = v3[0].trim();
    if (!v7.includes('youtu.be') && !v7.includes('youtube.com'))
      return v4.reply('❌ Valid YouTube link do!\n📌 Example: https://youtu.be/abc123');
    v4.reply('⏳ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐡𝐨 𝐫𝐚𝐡𝐚 𝐡𝐚𝐢, 𝐳𝐚𝐫𝐚 𝐫𝐮𝐤𝐨...');
    try {
      const v8 = await axios.get('https://anabot.my.id/api/download/ytmp3', {
          'params': {
            'url': v7,
            'apikey': 'freeApikey'
          },
          'headers': { 'accept': 'application/json' },
          'timeout': 60000
        }), v9 = v8.data?.data?.result;
      if (!v9?.success || !v9?.urls)
        return v4.reply('❌ Download fail ho gaya. Dobara koshish karo ya doosra link do.');
      const v10 = v9.metadata || {}, v11 = v10.title || 'Unknown Title', v12 = v10.duration ? Math.floor(v10.duration / 60) + ':' + String(v10.duration % 60).padStart(2, '0') : '?', v13 = v10.channel || v10.uploader || 'Unknown', v14 = v10.view_count ? Number(v10.view_count).toLocaleString() : '?', v15 = v9.urls;
      fs.mkdirSync(cacheDir, { 'recursive': !![] });
      const v16 = 'ytmp3_' + Date.now() + '.mp3', v17 = path.join(cacheDir, v16), v18 = await axios.get(v15, {
          'responseType': 'arraybuffer',
          'timeout': 120000
        });
      fs.writeFileSync(v17, Buffer.from(v18.data));
      const v19 = '🎵 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐌𝐏𝟑 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫\n' + '━━━━━━━━━━━━━━━━━━━━\n' + ('📌 𝐓𝐢𝐭𝐥𝐞  : ' + v11 + '\n') + ('🎙️ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥: ' + v13 + '\n') + ('⏱️ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ' + v12 + '\n') + ('👁️ 𝐕𝐢𝐞𝐰𝐬  : ' + v14 + '\n') + '━━━━━━━━━━━━━━━━━━━━\n' + '✅ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐁𝐎𝐓';
      v1.sendMessage({
        'body': v19,
        'attachment': fs.createReadStream(v17)
      }, v5, () => {
        try {
          fs.unlinkSync(v17);
        } catch {
        }
      }, v6);
    } catch (v20) {
      console.error('[ytmp3]', v20.message);
      if (v20.code === 'ECONNABORTED' || v20.message.includes('timeout'))
        return v4.reply('⏰ Request timeout ho gaya. Network slow hai, dobara try karo.');
      v4.reply('❌ Error aa gaya: ' + v20.message);
    }
  }
};