const axios = require('axios'), fs = require('fs-extra'), path = require('path'), cacheDir = path.join(__dirname, '..', 'cache', 'youtube'), frames = [
    '🔍 YouTube link detect hua!\n\n⌛▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒  10%',
    '🔄 Download link prepare ho raha hai...\n\n⌛▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒  30%',
    '⚙️ Processing video...\n\n⏳▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒  55%',
    '📥 Video download ho raha hai...\n\n⏳▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒  75%',
    '📦 File ready ho raha hai...\n\n⏳▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒  90%',
    '✅ Complete!\n\n🟢▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% 😍'
  ];
function extractYtUrl(v1) {
  const v2 = v1.match(/https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_\-]{11})[^\s]*/i);
  if (!v2)
    return null;
  return v2[0].split(' ')[0];
}
async function getDownloadUrl(v3, v4) {
  const v5 = await axios.get('https://loader.to/ajax/download.php', {
    'params': {
      'format': v4,
      'url': v3
    },
    'headers': {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://loader.to/'
    },
    'timeout': 20000,
    'validateStatus': () => !![]
  });
  if (!v5.data?.success || !v5.data?.id)
    return null;
  const v6 = v5.data.id;
  console.log('[ytautodl] loader.to job: ' + v6 + ' (' + v4 + ')');
  for (let v7 = 0; v7 < 30; v7++) {
    await new Promise(v8 => setTimeout(v8, 3000));
    const v9 = await axios.get('https://loader.to/ajax/progress.php', {
        'params': { 'id': v6 },
        'headers': {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://loader.to/'
        },
        'timeout': 15000,
        'validateStatus': () => !![]
      }), v10 = v9.data;
    console.log('[ytautodl] progress: ' + (v10?.progress || 0) + '/1000');
    if (v10?.success === 1 && v10?.download_url)
      return v10.download_url;
    if (v10?.progress === 1000 && v10?.download_url)
      return v10.download_url;
  }
  return null;
}
module.exports = {
  'config': {
    'credits': 'MR DEVIL',
    'name': 'ytautodl',
    'eventType': 'message',
    'description': 'YouTube link auto detect karke video download aur send karo.'
  },
  async 'run'({
    api: v11,
    event: v12
  }) {
    const {
      threadID: v13,
      messageID: v14,
      body: v15,
      senderID: v16
    } = v12;
    if (!v15)
      return;
    const v17 = v11.getCurrentUserID();
    if (v16 === v17)
      return;
    if (!v15.includes('youtube.com') && !v15.includes('youtu.be'))
      return;
    const v18 = extractYtUrl(v15);
    if (!v18)
      return;
    console.log('[ytautodl] Detected: ' + v18);
    const v19 = await v11.sendMessage(frames[0], v13), v20 = v19?.messageID;
    try {
      await v11.editMessage(frames[1], v20, v13);
      let v21 = null;
      for (const v22 of [
          '720',
          '480',
          '360'
        ]) {
        try {
          v21 = await getDownloadUrl(v18, v22);
          if (v21) {
            console.log('[ytautodl] Got URL at ' + v22 + 'p');
            break;
          }
        } catch (v23) {
          console.log('[ytautodl] ' + v22 + 'p error: ' + v23.message);
        }
      }
      if (!v21) {
        await v11.editMessage('❌ YouTube video download nahi ho saka. Link check karo ya thodi der baad try karo.', v20, v13);
        return;
      }
      await v11.editMessage(frames[2], v20, v13), fs.mkdirSync(cacheDir, { 'recursive': !![] });
      const v24 = path.join(cacheDir, 'yt_' + Date.now() + '.mp4');
      await v11.editMessage(frames[3], v20, v13);
      const v25 = await axios.get(v21, {
        'responseType': 'arraybuffer',
        'timeout': 180000,
        'headers': {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://loader.to/'
        },
        'maxRedirects': 10
      });
      if (!v25.data || v25.data.byteLength < 10000) {
        await v11.editMessage('❌ Video file empty aayi. Dobara try karo.', v20, v13);
        return;
      }
      fs.writeFileSync(v24, Buffer.from(v25.data));
      const v26 = (v25.data.byteLength / 1024 / 1024).toFixed(2);
      console.log('[ytautodl] Saved: ' + v26 + ' MB'), await v11.editMessage(frames[4], v20, v13), await v11.editMessage(frames[5], v20, v13), v11.setMessageReaction('✅', v14, () => {
      }, !![]);
      const v27 = '🎬 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐕𝐢𝐝𝐞𝐨\n' + '━━━━━━━━━━━━━━━━━━━━\n' + ('🔗 𝐋𝐢𝐧𝐤  : ' + v18.slice(0, 50) + (v18.length > 50 ? '...' : '') + '\n') + ('📦 𝐒𝐢𝐳𝐞  : ' + v26 + ' MB\n') + '━━━━━━━━━━━━━━━━━━━━\n' + '✅ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐁𝐎𝐓';
      v11.sendMessage({
        'body': v27,
        'attachment': fs.createReadStream(v24)
      }, v13, () => {
        try {
          fs.unlinkSync(v24);
        } catch {
        }
        try {
          v11.unsendMessage(v20);
        } catch {
        }
      }, v14);
    } catch (v28) {
      console.error('[ytautodl] Error:', v28.message);
      try {
        await v11.editMessage('❌ Error: ' + v28.message, v20, v13);
      } catch {
      }
      v11.setMessageReaction('❌', v14, () => {
      }, !![]);
    }
  }
};