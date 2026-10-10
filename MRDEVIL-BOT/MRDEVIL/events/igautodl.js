const axios = require('axios'), fs = require('fs-extra'), path = require('path'), cacheDir = path.join(__dirname, '..', 'cache', 'instagram'), frames = [
    '🔍 Instagram link detect hua!\n\n⌛▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒  10%',
    '📡 Media info fetch ho rahi hai...\n\n⌛▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒  30%',
    '📥 Media download ho raha hai...\n\n⏳▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒  55%',
    '📦 Files ready ho rahi hain...\n\n⏳▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒  85%',
    '✅ Complete!\n\n🟢▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% 😍'
  ];
function extractIgUrl(v1) {
  const v2 = v1.match(/https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories\/[^/\s?]+)\/([A-Za-z0-9_\-]+)/i);
  if (!v2)
    return null;
  return 'https://www.instagram.com/' + v2[2] + '/' + v2[3] + '/';
}
async function tryCobalt(v3) {
  const v4 = await axios.post('https://api.cobalt.tools/api/json', {
    'url': v3,
    'vQuality': 'max',
    'isNoTTWatermark': !![]
  }, {
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    'timeout': 25000,
    'validateStatus': () => !![]
  });
  if (v4.status !== 200)
    return null;
  const v5 = v4.data;
  console.log('[igautodl] cobalt status: ' + v5?.status);
  if (v5?.status === 'stream' && v5?.url)
    return [{
        'url': v5.url,
        'isVideo': !![]
      }];
  if (v5?.status === 'picker' && Array.isArray(v5?.picker))
    return v5.picker.map(v6 => ({
      'url': v6.url,
      'isVideo': v6.type === 'video'
    }));
  if (v5?.status === 'redirect' && v5?.url)
    return [{
        'url': v5.url,
        'isVideo': !![]
      }];
  return null;
}
async function tryAnabot(v7) {
  const v8 = await axios.get('https://anabot.my.id/api/download/instagram', {
    'params': {
      'url': v7,
      'apikey': 'freeApikey'
    },
    'headers': { 'accept': 'application/json' },
    'timeout': 20000,
    'validateStatus': () => !![]
  });
  if (v8.status !== 200 || !Array.isArray(v8.data?.data?.result))
    return null;
  return v8.data.data.result.map(v9 => ({ 'url': v9.url || v9.thumbnail }));
}
async function trySnapinsta(v10) {
  const v11 = await axios.post('https://snapsave.app/action.php', 'url=' + encodeURIComponent(v10), {
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://snapsave.app/'
    },
    'timeout': 20000,
    'validateStatus': () => !![]
  });
  if (v11.status !== 200 || !v11.data?.data)
    return null;
  const v12 = [];
  return Array.isArray(v11.data.data) && v11.data.data.forEach(v13 => {
    if (v13?.url)
      v12.push({
        'url': v13.url,
        'isVideo': v13.type === 'video' || v13.url.includes('.mp4')
      });
  }), v12.length ? v12 : null;
}
module.exports = {
  'config': {
    'credits': 'MR DEVIL',
    'name': 'igautodl',
    'eventType': 'message',
    'description': 'Instagram link auto detect karke media download aur send karo.'
  },
  async 'run'({
    api: v14,
    event: v15
  }) {
    const {
      threadID: v16,
      messageID: v17,
      body: v18,
      senderID: v19
    } = v15;
    if (!v18)
      return;
    const v20 = v14.getCurrentUserID();
    if (v19 === v20)
      return;
    if (!v18.includes('instagram.com'))
      return;
    const v21 = extractIgUrl(v18);
    if (!v21)
      return;
    console.log('[igautodl] Detected: ' + v21);
    const v22 = await v14.sendMessage(frames[0], v16), v23 = v22?.messageID;
    try {
      await v14.editMessage(frames[1], v23, v16);
      let v24 = null;
      try {
        v24 = await tryCobalt(v21);
      } catch (v25) {
        console.log('[igautodl] cobalt err: ' + v25.message);
      }
      console.log('[igautodl] cobalt: ' + (v24 ? v24.length + ' items' : 'failed'));
      if (!v24) {
        try {
          v24 = await tryAnabot(v21);
        } catch (v26) {
          console.log('[igautodl] anabot err: ' + v26.message);
        }
        console.log('[igautodl] anabot: ' + (v24 ? v24.length + ' items' : 'failed'));
      }
      if (!v24) {
        try {
          v24 = await trySnapinsta(v21);
        } catch (v27) {
          console.log('[igautodl] snapinsta err: ' + v27.message);
        }
        console.log('[igautodl] snapinsta: ' + (v24 ? v24.length + ' items' : 'failed'));
      }
      if (!v24 || v24.length === 0) {
        await v14.editMessage('❌ Instagram media download nahi ho saka. Post private ho sakti hai.', v23, v16), v14.setMessageReaction('❌', v17, () => {
        }, !![]);
        return;
      }
      await v14.editMessage(frames[2], v23, v16), fs.mkdirSync(cacheDir, { 'recursive': !![] });
      const v28 = [];
      for (let v29 = 0; v29 < Math.min(v24.length, 10); v29++) {
        const v30 = v24[v29];
        if (!v30?.url)
          continue;
        const v31 = v30.isVideo || v30.url.includes('.mp4'), v32 = v31 ? 'mp4' : 'jpg', v33 = path.join(cacheDir, 'ig_' + Date.now() + '_' + v29 + '.' + v32);
        try {
          const v34 = await axios.get(v30.url, {
            'responseType': 'arraybuffer',
            'timeout': 90000,
            'headers': {
              'User-Agent': 'Mozilla/5.0',
              'Referer': 'https://www.instagram.com/'
            }
          });
          v34.data?.byteLength > 1000 && (fs.writeFileSync(v33, Buffer.from(v34.data)), v28.push(v33), console.log('[igautodl] saved ' + v29 + ': ' + (v34.data.byteLength / 1024).toFixed(0) + ' KB'));
        } catch (v35) {
          console.log('[igautodl] file ' + v29 + ' fail: ' + v35.message);
        }
      }
      if (v28.length === 0) {
        await v14.editMessage('❌ Media file save nahi ho saki.', v23, v16), v14.setMessageReaction('❌', v17, () => {
        }, !![]);
        return;
      }
      await v14.editMessage(frames[3], v23, v16), await v14.editMessage(frames[4], v23, v16), v14.setMessageReaction('✅', v17, () => {
      }, !![]);
      const v36 = '📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐌𝐞𝐝𝐢𝐚\n' + '━━━━━━━━━━━━━━━━━━━━\n' + ('🖼️ 𝐅𝐢𝐥𝐞𝐬 : ' + v28.length + '\n') + '━━━━━━━━━━━━━━━━━━━━\n' + '✅ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐁𝐎𝐓';
      v14.sendMessage({
        'body': v36,
        'attachment': v28.map(v37 => fs.createReadStream(v37))
      }, v16, () => {
        v28.forEach(v38 => {
          try {
            fs.unlinkSync(v38);
          } catch {
          }
        });
        try {
          v14.unsendMessage(v23);
        } catch {
        }
      }, v17);
    } catch (v39) {
      console.error('[igautodl] Error:', v39.message);
      try {
        await v14.editMessage('❌ Error: ' + v39.message, v23, v16);
      } catch {
      }
      v14.setMessageReaction('❌', v17, () => {
      }, !![]);
    }
  }
};