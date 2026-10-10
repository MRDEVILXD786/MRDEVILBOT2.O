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
  const filePath = path.join(cmdsDir, file);
  if (!fs.existsSync(filePath)) {
    console.log('[SKIP] ' + file + ' not found'), skipped++;
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('animDone')) {
    console.log('[SKIP] ' + file + ' already patched'), skipped++;
    continue;
  }
  content = content.replace(/const loadMsgID = await animateProgress\(/g, 'const { msgID: loadMsgID, done: animDone } = await animateProgress('), content = content.replace(/(\n(\s+))api\.sendMessage\(\s*\n(\s+)\{/, (v1, v2, v3, v4) => '\n' + v3 + 'await animDone;\n' + v3 + 'api.sendMessage(\n' + v4 + '{'), fs.writeFileSync(filePath, content, 'utf8'), console.log('[OK] ' + file), updated++;
}
console.log('\nDone! Updated: ' + updated + ', Skipped: ' + skipped);