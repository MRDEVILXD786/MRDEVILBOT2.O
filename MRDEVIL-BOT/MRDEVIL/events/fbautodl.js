const axios = require('axios'), fs = require('fs-extra'), path = require('path'), cacheDir = path.join(__dirname, '..', 'cache', 'facebook'), frames = [
    '🔍 Facebook link detect hua!\n\n⌛▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒  10%',
    '📡 Video info fetch ho rahi hai...\n\n⌛▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒  30%',
    '🎞️ Best quality select ho rahi hai...\n\n⏳▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒  50%',
    '📥 Video download ho rahi hai...\n\n⏳▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒  70%',
    '📦 File ready ho raha hai...\n\n⏳▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒  90%',
    '✅ Complete!\n\n🟢▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% 😍'
  ];
function extractFbUrl(v1) {
  const v2 = v1.match(/https?:\/\/(www\.|m\.|web\.)?facebook\.com\/[^\s]+/i);
  if (!v2)
    return null;
  return v2[0].split('?')[0].replace(/\/$/, '');
}
function pickBestVideo(v3) {
  const v4 = v3.filter(v5 => v5.type === 'Video');
  if (!v4.length)
    return null;
  const v6 = v4.filter(v7 => v7.mediaTask === 'download'), v8 = v6.length ? v6 : v4;
  for (const v9 of [
      'HD',
      'FHD',
      'SD'
    ]) {
    const v10 = v8.find(v11 => v11.mediaQuality === v9);
    if (v10)
      return v10;
  }
  return v8[0];
}
async function downloadFile(v12, v13) {
  const v14 = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.facebook.com/'
  };
  for (const v15 of v12) {
    try {
      console.log('[fbautodl] Trying: ' + v15.slice(0, 80));
      const v16 = await axios.get(v15, {
        'responseType': 'arraybuffer',
        'timeout': 120000,
        'headers': v14,
        'maxRedirects': 5
      });
      if (v16.data && v16.data.byteLength > 10000)
        return fs.writeFileSync(v13, Buffer.from(v16.data)), console.log('[fbautodl] Downloaded: ' + (v16.data.byteLength / 1024 / 1024).toFixed(2) + ' MB'), !![];
    } catch (v17) {
      console.log('[fbautodl] URL failed: ' + v17.message);
    }
  }
  return ![];
}
module.exports = {
  'config': {
    'credits': 'MR DEVIL',
    'name': 'fbautodl',
    'eventType': 'message',
    'description': 'Facebook video/reel link auto detect karke download aur send karo.'
  },
  async 'run'({
    api: v18,
    event: v19
  }) {
    const {
      threadID: v20,
      messageID: v21,
      body: v22,
      senderID: v23
    } = v19;
    if (!v22)
      return;
    const v24 = v18.getCurrentUserID();
    if (v23 === v24)
      return;
    if (!v22.includes('facebook.com'))
      return;
    const v25 = extractFbUrl(v22);
    if (!v25)
      return;
    console.log('[fbautodl] Detected: ' + v25);
    const v26 = await v18.sendMessage(frames[0], v20), v27 = v26?.messageID;
    try {
      await v18.editMessage(frames[1], v27, v20);
      const v28 = await axios.get('https://anabot.my.id/api/download/facebook', {
        'params': {
          'url': v25,
          'apikey': 'freeApikey'
        },
        'headers': { 'accept': 'application/json' },
        'timeout': 30000,
        'validateStatus': () => !![]
      });
      console.log('[fbautodl] API status: ' + v28.status);
      if (v28.status !== 200 || !v28.data?.success) {
        await v18.editMessage('❌ Facebook video fetch nahi ho saka. Post private ho sakti hai.', v27, v20), v18.setMessageReaction('❌', v21, () => {
        }, !![]);
        return;
      }
      const v29 = v28.data?.data?.result?.api;
      if (!v29?.mediaItems?.length) {
        await v18.editMessage('❌ Is link mein koi video nahi mili.', v27, v20), v18.setMessageReaction('❌', v21, () => {
        }, !![]);
        return;
      }
      const v30 = pickBestVideo(v29.mediaItems);
      if (!v30) {
        await v18.editMessage('❌ Downloadable video nahi mili.', v27, v20), v18.setMessageReaction('❌', v21, () => {
        }, !![]);
        return;
      }
      await v18.editMessage(frames[2], v27, v20);
      const v31 = v29.title || 'Facebook Video', v32 = v29.description || '', v33 = v29.mediaStats?.likesCount || '?', v34 = v29.mediaStats?.commentsCount || '?', v35 = v30.mediaQuality || '?', v36 = v30.mediaRes || '?', v37 = v30.mediaDuration || '?', v38 = v30.mediaFileSize || '?', v39 = [];
      if (v30.mediaUrl)
        v39.push(v30.mediaUrl);
      if (v30.mediaPreviewUrl)
        v39.push(v30.mediaPreviewUrl);
      const v40 = v29.mediaItems.find(v41 => v41.type === 'Video' && v41.mediaQuality === 'SD' && v41.mediaTask === 'download');
      if (v40?.mediaUrl && v40.mediaUrl !== v30.mediaUrl)
        v39.push(v40.mediaUrl);
      if (v40?.mediaPreviewUrl)
        v39.push(v40.mediaPreviewUrl);
      await v18.editMessage(frames[3], v27, v20), fs.mkdirSync(cacheDir, { 'recursive': !![] });
      const v42 = path.join(cacheDir, 'fb_' + Date.now() + '.mp4'), v43 = await downloadFile(v39, v42);
      if (!v43) {
        await v18.editMessage('❌ Video file download nahi ho saka. Server ne block kar diya.', v27, v20), v18.setMessageReaction('❌', v21, () => {
        }, !![]);
        return;
      }
      await v18.editMessage(frames[4], v27, v20), await v18.editMessage(frames[5], v27, v20), v18.setMessageReaction('✅', v21, () => {
      }, !![]);
      const v44 = '🎬 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐕𝐢𝐝𝐞𝐨\n' + '━━━━━━━━━━━━━━━━━━━━\n' + ('📌 𝐓𝐢𝐭𝐥𝐞  : ' + v31 + '\n') + (v32 ? '📝 𝐃𝐞𝐬𝐜   : ' + v32.slice(0, 80) + (v32.length > 80 ? '...' : '') + '\n' : '') + ('🎞️ 𝐐𝐮𝐚𝐥𝐢𝐭𝐲: ' + v35 + ' (' + v36 + ')\n') + ('⏱️ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ' + v37 + '\n') + ('📦 𝐒𝐢𝐳𝐞   : ' + v38 + '\n') + ('❤️ 𝐋𝐢𝐤𝐞𝐬  : ' + v33 + ' | 💬 ' + v34 + '\n') + '━━━━━━━━━━━━━━━━━━━━\n' + '✅ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐁𝐎𝐓';
      v18.sendMessage({
        'body': v44,
        'attachment': fs.createReadStream(v42)
      }, v20, () => {
        try {
          fs.unlinkSync(v42);
        } catch {
        }
        try {
          v18.unsendMessage(v27);
        } catch {
        }
      }, v21);
    } catch (v45) {
      console.error('[fbautodl] Error:', v45.message);
      try {
        await v18.editMessage('❌ Error: ' + v45.message, v27, v20);
      } catch {
      }
      v18.setMessageReaction('❌', v21, () => {
      }, !![]);
    }
  }
};