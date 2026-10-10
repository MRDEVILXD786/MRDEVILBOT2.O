const fs = require('fs'), path = require('path'), cmdsDir = path.join(__dirname, '..', 'Mr Devil', 'commands'), requireLine = 'const animateProgress = require(\'../../controller/utility/animateProgress\');', commands = [
    {
      'file': 'brother.js',
      'emoji': '😈',
      'label': '𝐁𝐫𝐨𝐭𝐡𝐞𝐫 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("😈 Brother pair image bana raha hun...");'
    },
    {
      'file': 'brother2.js',
      'emoji': '❤️',
      'label': '𝐁𝐫𝐨𝐭𝐡𝐞𝐫 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("❤️ Brother pair image bana raha hun...");'
    },
    {
      'file': 'brother3.js',
      'emoji': '❤️',
      'label': '𝐁𝐫𝐨𝐭𝐡𝐞𝐫 𝐅𝐨𝐫𝐞𝐯𝐞𝐫',
      'old': 'send.reply("❤️ Brother Forever image bana raha hun...");'
    },
    {
      'file': 'sister.js',
      'emoji': '🌸',
      'label': '𝐒𝐢𝐬𝐭𝐞𝐫 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("🌸 Sister pair image bana raha hun...");'
    },
    {
      'file': 'sister2.js',
      'emoji': '💗',
      'label': '𝐒𝐢𝐬𝐭𝐞𝐫𝐬 𝐅𝐨𝐫𝐞𝐯𝐞𝐫',
      'old': 'send.reply("💗 Sisters Forever image bana raha hun...");'
    },
    {
      'file': 'sister3.js',
      'emoji': '💗',
      'label': '𝐒𝐢𝐬𝐭𝐞𝐫𝐬 𝐅𝐨𝐫𝐞𝐯𝐞𝐫',
      'old': 'send.reply("💗 Sisters Forever image bana raha hun...");'
    },
    {
      'file': 'sibling.js',
      'emoji': '🖤',
      'label': '𝐒𝐢𝐛𝐥𝐢𝐧𝐠 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("🖤 Sibling pair image bana raha hun...");'
    },
    {
      'file': 'sibling2.js',
      'emoji': '💛',
      'label': '𝐒𝐢𝐛𝐥𝐢𝐧𝐠 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("💛 Sibling pair image bana raha hun...");'
    },
    {
      'file': 'sibling3.js',
      'emoji': '👑',
      'label': '𝐒𝐢𝐛𝐥𝐢𝐧𝐠 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("👑 Sibling pair image bana raha hun...");'
    },
    {
      'file': 'bestie.js',
      'emoji': '🖤',
      'label': '𝐁𝐞𝐬𝐭𝐢𝐞 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("🖤 Bestie pair image bana raha hun...");'
    },
    {
      'file': 'bestie2.js',
      'emoji': '🐱',
      'label': '𝐁𝐞𝐬𝐭𝐢𝐞 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("🐱🐭 Besties pair image bana raha hun...");'
    },
    {
      'file': 'bestie3.js',
      'emoji': '🦋',
      'label': '𝐅𝐫𝐢𝐞𝐧𝐝𝐬𝐡𝐢𝐩 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("🦋 Friendship pair image bana raha hun...");'
    },
    {
      'file': 'bestie4.js',
      'emoji': '💜',
      'label': '𝐁𝐞𝐬𝐭𝐢𝐞 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("💜 Besties pair image bana raha hun...");'
    },
    {
      'file': 'bestie5.js',
      'emoji': '🩷',
      'label': '𝐁𝐞𝐬𝐭𝐢𝐞 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("🩷 Besties pair image bana raha hun...");'
    },
    {
      'file': 'pair2.js',
      'emoji': '💞',
      'label': '𝐏𝐚𝐢𝐫',
      'old': 'send.reply("💞 Pair image bana raha hun...");'
    },
    {
      'file': 'pair3.js',
      'emoji': '💞',
      'label': '𝐏𝐚𝐢𝐫',
      'old': 'send.reply("💞 Pair image bana raha hun...");'
    },
    {
      'file': 'pair4.js',
      'emoji': '💞',
      'label': '𝐏𝐚𝐢𝐫',
      'old': 'send.reply("💞 Pair image bana raha hun...");'
    },
    {
      'file': 'pair5.js',
      'emoji': '👑',
      'label': '𝐊𝐢𝐧𝐠 & 𝐐𝐮𝐞𝐞𝐧',
      'old': 'send.reply("👑 King & Queen pair image bana raha hun...");'
    },
    {
      'file': 'pair6.js',
      'emoji': '👑',
      'label': '𝐊𝐢𝐧𝐠 & 𝐐𝐮𝐞𝐞𝐧 𝐖𝐢𝐧𝐠𝐬',
      'old': 'send.reply("👑 King & Queen Wings pair image bana raha hun...");'
    },
    {
      'file': 'pair7.js',
      'emoji': '🔥',
      'label': '𝐅𝐢𝐫𝐞 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("🔥 Fire pair image bana raha hun...");'
    },
    {
      'file': 'pair8.js',
      'emoji': '💗',
      'label': '𝐋𝐨𝐯𝐞 𝐏𝐚𝐢𝐫',
      'old': 'send.reply("💗 Love pair image bana raha hun...");'
    },
    {
      'file': 'pair9.js',
      'emoji': '💛',
      'label': '𝐆𝐨𝐥𝐝𝐞𝐧 𝐋𝐨𝐯𝐞',
      'old': 'send.reply("💛 Golden Love pair image bana raha hun...");'
    },
    {
      'file': 'pair10.js',
      'emoji': '💜',
      'label': '𝐏𝐮𝐫𝐩𝐥𝐞 𝐋𝐨𝐯𝐞',
      'old': 'send.reply("💜 Purple Love pair image bana raha hun...");'
    },
    {
      'file': 'pair11.js',
      'emoji': '💗',
      'label': '𝐏𝐢𝐧𝐤 𝐋𝐨𝐯𝐞',
      'old': 'send.reply("💗 Pink Love pair image bana raha hun...");'
    },
    {
      'file': 'pair12.js',
      'emoji': '💙',
      'label': '𝐁𝐥𝐮𝐞 𝐑𝐨𝐬𝐞',
      'old': 'send.reply("💙 Blue Rose pair image bana raha hun...");'
    },
    {
      'file': 'pair13.js',
      'emoji': '💗',
      'label': '𝐂𝐮𝐩𝐢𝐝 𝐋𝐨𝐯𝐞',
      'old': 'send.reply("💗 Cupid Love pair image bana raha hun...");'
    },
    {
      'file': 'pair14.js',
      'emoji': '👑',
      'label': '𝐊𝐢𝐧𝐠 & 𝐐𝐮𝐞𝐞𝐧',
      'old': 'send.reply("👑 King & Queen pair image bana raha hun...");'
    },
    {
      'file': 'pair15.js',
      'emoji': '💗',
      'label': '𝐖𝐢𝐟𝐞 & 𝐇𝐮𝐛𝐛𝐲',
      'old': 'send.reply("💗 Wife & Hubby pair image bana raha hun...");'
    }
  ];
let updated = 0, skipped = 0;
for (const {file, emoji, label, old} of commands) {
  const filePath = path.join(cmdsDir, file);
  if (!fs.existsSync(filePath)) {
    console.log('[SKIP] ' + file + ' not found'), skipped++;
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('animateProgress')) {
    console.log('[SKIP] ' + file + ' already patched'), skipped++;
    continue;
  }
  const newCall = 'const loadMsgID = await animateProgress(api, threadID, messageID, \'' + emoji + '\', \'' + label + '\');';
  if (!content.includes(old)) {
    console.log('[WARN] ' + file + ' — old string not found: ' + old), skipped++;
    continue;
  }
  content = content.replace(old, newCall);
  const lastRequireIdx = (() => {
    const v1 = content.split('\n');
    let v2 = -1;
    for (let v3 = 0; v3 < v1.length; v3++) {
      if (v1[v3].startsWith('const ') && v1[v3].includes('require('))
        v2 = v3;
    }
    return v2;
  })();
  if (lastRequireIdx !== -1) {
    const lines = content.split('\n');
    lines.splice(lastRequireIdx + 1, 0, requireLine), content = lines.join('\n');
  }
  fs.writeFileSync(filePath, content, 'utf8'), console.log('[OK] ' + file), updated++;
}
console.log('\nDone! Updated: ' + updated + ', Skipped: ' + skipped);