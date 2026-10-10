const axios = require('axios'), fs = require('fs-extra'), path = require('path'), cacheDir = path.join(__dirname, '..', 'cache', 'tiktok'), frames = [
    '🔍 TikTok link detect hua!\n\n⌛▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒  10%',
    '📡 Video info fetch ho rahi hai...\n\n⌛▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒  30%',
    '🎞️ No-watermark video select ho raha hai...\n\n⏳▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒  50%',
    '📥 Video download ho rahi hai...\n\n⏳▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒  70%',
    '📦 File ready ho rahi hai...\n\n⏳▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒  90%',
    '✅ Complete!\n\n🟢▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% 😍'
  ];
function extractTikTokUrl(v1) {
  const v2 = v1.match(/https?:\/\/(www\.|vt\.|vm\.|m\.)?tiktok\.com\/[^\s]*/i);
  if (!v2)
    return null;
  return v2[0].split(' ')[0];
}
async function downloadFile(v3, v4) {
  try {
    const v5 = await axios.get(v3, {
      'responseType': 'arraybuffer',
      'timeout': 120000,
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.tiktok.com/'
      },
      'maxRedirects': 10
    });
    if (v5.data && v5.data.byteLength > 10000)
      return fs.writeFileSync(v4, Buffer.from(v5.data)), v5.data.byteLength;
    return 0;
  } catch (v6) {
    return console.log('[tiktokautodl] Download failed: ' + v6.message), 0;
  }
}
module.exports = {
  'config': {
    'credits': 'MR DEVIL',
    'name': 'tiktokautodl',
    'eventType': 'message',
    'description': 'TikTok link auto detect karke watermark-free video download aur send karo.'
  },
  async 'run'({
    api: v7,
    event: v8
  }) {
    const {
      threadID: v9,
      messageID: v10,
      body: v11,
      senderID: v12
    } = v8;
    if (!v11)
      return;
    const v13 = v7.getCurrentUserID();
    if (v12 === v13)
      return;
    if (!v11.includes('tiktok.com'))
      return;
    const v14 = extractTikTokUrl(v11);
    if (!v14)
      return;
    console.log('[tiktokautodl] Detected: ' + v14);
    const v15 = await v7.sendMessage(frames[0], v9), v16 = v15?.messageID;
    try {
      await v7.editMessage(frames[1], v16, v9);
      const v17 = await axios.get('https://anabot.my.id/api/download/tiktok', {
        'params': {
          'url': v14,
          'apikey': 'freeApikey'
        },
        'headers': { 'accept': 'application/json' },
        'timeout': 30000,
        'validateStatus': () => !![]
      });
      console.log('[tiktokautodl] API status: ' + v17.status);
      if (v17.status !== 200 || !v17.data?.success) {
        await v7.editMessage('❌ TikTok video fetch nahi ho saka. Link check karo ya thodi der baad try karo.', v16, v9), v7.setMessageReaction('❌', v10, () => {
        }, !![]);
        return;
      }
      const v18 = v17.data?.data?.result;
      if (!v18) {
        await v7.editMessage('❌ Is TikTok link mein koi video nahi mili.', v16, v9), v7.setMessageReaction('❌', v10, () => {
        }, !![]);
        return;
      }
      const v19 = v18.username || 'Unknown', v20 = v18.description || '', v21 = v18.nowatermark, v22 = v18.video;
      if (!v21 && !v22) {
        await v7.editMessage('❌ Video download link nahi mila. Video private ho sakti hai.', v16, v9), v7.setMessageReaction('❌', v10, () => {
        }, !![]);
        return;
      }
      await v7.editMessage(frames[2], v16, v9), fs.mkdirSync(cacheDir, { 'recursive': !![] });
      const v23 = path.join(cacheDir, 'tiktok_' + Date.now() + '.mp4');
      await v7.editMessage(frames[3], v16, v9);
      let v24 = 0;
      v21 && (v24 = await downloadFile(v21, v23));
      !v24 && v22 && (console.log('[tiktokautodl] Fallback to watermark video'), v24 = await downloadFile(v22, v23));
      if (!v24) {
        await v7.editMessage('❌ Video file download nahi ho saki. Server ne block kar diya.', v16, v9), v7.setMessageReaction('❌', v10, () => {
        }, !![]);
        return;
      }
      const v25 = (v24 / 1024 / 1024).toFixed(2);
      console.log('[tiktokautodl] Saved: ' + v25 + ' MB'), await v7.editMessage(frames[4], v16, v9), await v7.editMessage(frames[5], v16, v9), v7.setMessageReaction('✅', v10, () => {
      }, !![]);
      const v26 = '🎵 𝐓𝐢𝐤𝐓𝐨𝐤 𝐕𝐢𝐝𝐞𝐨\n' + '━━━━━━━━━━━━━━━━━━━━\n' + ('👤 𝐔𝐬𝐞𝐫    : ' + v19 + '\n') + (v20 ? '📝 𝐂𝐚𝐩𝐭𝐢𝐨𝐧 : ' + v20.slice(0, 80) + (v20.length > 80 ? '...' : '') + '\n' : '') + ('📦 𝐒𝐢𝐳𝐞    : ' + v25 + ' MB\n') + ('🚫 𝐖𝐚𝐭𝐞𝐫𝐦𝐚𝐫𝐤: ' + (v21 ? 'Hata diya ✅' : 'Watermark ke saath') + '\n') + '━━━━━━━━━━━━━━━━━━━━\n' + '✅ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐁𝐎𝐓';
      v7.sendMessage({
        'body': v26,
        'attachment': fs.createReadStream(v23)
      }, v9, () => {
        try {
          fs.unlinkSync(v23);
        } catch {
        }
        try {
          v7.unsendMessage(v16);
        } catch {
        }
      }, v10);
    } catch (v27) {
      console.error('[tiktokautodl] Error:', v27.message);
      try {
        await v7.editMessage('❌ Error: ' + v27.message, v16, v9);
      } catch {
      }
      v7.setMessageReaction('❌', v10, () => {
      }, !![]);
    }
  }
};