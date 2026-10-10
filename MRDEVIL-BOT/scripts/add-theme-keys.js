const fs = require('fs'), path = require('path'), cmdsDir = path.join(__dirname, '..', 'Mr Devil', 'commands'), files = [
    'brother.js',
    'brother2.js',
    'brother3.js',
    'sister.js',
    'sister2.js',
    'sister3.js',
    'sibling.js',
    'sibling2.js',
    'sibling3.js',
    'bestie.js',
    'bestie2.js',
    'bestie3.js',
    'bestie4.js',
    'bestie5.js',
    'pair2.js',
    'pair3.js',
    'pair4.js',
    'pair5.js',
    'pair6.js',
    'pair7.js',
    'pair8.js',
    'pair9.js',
    'pair10.js',
    'pair11.js',
    'pair12.js',
    'pair13.js',
    'pair14.js',
    'pair15.js'
  ];
let updated = 0, skipped = 0;
for (const file of files) {
  const themeKey = file.replace('.js', ''), filePath = path.join(cmdsDir, file);
  if (!fs.existsSync(filePath)) {
    console.log('[SKIP] ' + file + ' not found'), skipped++;
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('\'' + themeKey + '\')')) {
    console.log('[SKIP] ' + file + ' already has theme key'), skipped++;
    continue;
  }
  const before = content;
  content = content.replace(/(await animateProgress\(api, threadID, messageID, '[^']*', '[^']*')\)/, '$1, \'' + themeKey + '\')');
  if (content === before) {
    console.log('[WARN] ' + file + ' — pattern not matched'), skipped++;
    continue;
  }
  fs.writeFileSync(filePath, content, 'utf8'), console.log('[OK] ' + file + ' → theme: ' + themeKey), updated++;
}
console.log('\nDone! Updated: ' + updated + ', Skipped: ' + skipped);