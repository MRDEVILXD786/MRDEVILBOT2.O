const stringSimilarity = require('string-similarity'), moment = require('moment-timezone'), logs = require('../../utility/logs'), Send = require('../../utility/send'), SPAM_WINDOW_MS = 8000, SPAM_THRESHOLD = 5, spamTracker = new Map(), spamWarnedSet = new Set();
function checkSpam(v1) {
  const v2 = Date.now(), v3 = (spamTracker.get(v1) || []).filter(v4 => v2 - v4 < SPAM_WINDOW_MS);
  return v3.push(v2), spamTracker.set(v1, v3), v3.length >= SPAM_THRESHOLD;
}
setInterval(() => {
  const v5 = Date.now();
  for (const [v6, v7] of spamTracker) {
    const v8 = v7.filter(v9 => v5 - v9 < SPAM_WINDOW_MS);
    v8.length === 0 ? (spamTracker.delete(v6), spamWarnedSet.delete(v6)) : spamTracker.set(v6, v8);
  }
}, 10 * 60 * 1000);
async function handleCommand({
  api: v12,
  event: v13,
  client: v14,
  Users: v15,
  Threads: v16,
  Currencies: v17,
  config: v18
}) {
  const {
    threadID: v19,
    senderID: v20,
    body: v21,
    messageID: v22
  } = v13;
  if (!v21)
    return;
  if (global.activeConvos?.has(v19)) {
    const v23 = v18.PREFIX || '.', v24 = v21.toLowerCase().trim();
    if (!v24.startsWith(v23 + 'convo off') && !v24.startsWith('convo off'))
      return;
  }
  const v25 = v18.PREFIX || '.', v26 = v18.PREFIX_ENABLED !== ![];
  let v27 = '', v28 = [], v29 = ![];
  if (v21.toLowerCase().startsWith(v25.toLowerCase())) {
    v29 = !![];
    const v30 = v21.slice(v25.length).trim().split(/\s+/);
    v27 = v30.shift()?.toLowerCase() || '', v28 = v30;
  } else {
    const v31 = v21.trim().split(/\s+/);
    v27 = v31.shift()?.toLowerCase() || '', v28 = v31;
  }
  if (!v27) {
    if (v29)
      return await showBotInfo(v12, v13, v14, v15, v18);
    return;
  }
  let v32 = v14.commands.get(v27);
  if (!v32)
    for (const [, v33] of v14.commands) {
      if (v33.config?.aliases?.includes(v27)) {
        v32 = v33, v27 = v33.config.name.toLowerCase();
        break;
      }
    }
  if (!v32) {
    if (v29)
      return await showSuggestion(v12, v13, v14, v18, v27);
    return;
  }
  const v34 = v32.config;
  if ((v18.DISABLED_COMMANDS || []).includes(v34.name))
    return v12.sendMessage('❌ Command "' + v34.name + '" is disabled.', v19, v22);
  if (v34.prefix === !![] && !v29)
    return;
  if (v34.prefix === ![] && v29)
    return;
  if (v34.prefix !== 'both' && v26 && v34.prefix !== ![] && !v29)
    return;
  const v35 = v18.ADMINBOT?.includes(v20);
  if (v18.ADMIN_ONLY_MODE && !v35)
    return v12.sendMessage('🔒 Bot is in Admin-Only mode.', v19, v22);
  if (v34.adminOnly && !v35)
    return v12.sendMessage('👑 This command is for bot admins only.', v19, v22);
  if (v34.groupOnly && !v13.isGroup)
    return v12.sendMessage('👥 This command can only be used in groups.', v19, v22);
  const [v36, v37] = await Promise.all([
    v15.isBanned(v20),
    v16.isBanned(v19)
  ]);
  if (v36) {
    const v38 = await v15.get(v20), v39 = v38?.banReason?.startsWith('⚠️ SpamLock');
    if (v39)
      return v12.sendMessage('╭─── « 𝗦𝗣𝗔𝗠𝗟𝗢𝗖𝗞 » ───⟡\n' + '│\n' + '│ 🔒 Tumhara account SpamLock\n' + '│    mein hai!\n' + '│\n' + '│ ⚡ Wajah: Fast spam detected\n' + '│ 👑 Sirf Bot Owner unlock\n' + '│    kar sakta hai.\n' + '│\n' + '╰───────────────⟡', v19, v22);
    return v12.sendMessage('🚫 You are banned from using this bot.', v19, v22);
  }
  if (v37)
    return;
  if (!v35) {
    const v40 = checkSpam(v20);
    if (v40) {
      if (!spamWarnedSet.has(v20))
        return spamWarnedSet.add(v20), v12.sendMessage('╭─── « ⚠️ 𝗦𝗣𝗔𝗠 𝗪𝗔𝗥𝗡𝗜𝗡𝗚 » ───⟡\n' + '│\n' + '│ ❗ Tum bohot fast commands\n' + '│    use kar rahe ho!\n' + '│\n' + '│ ⏱️ Thodi der ruko warna\n' + '│    SpamLock lag jayega.\n' + '│\n' + '╰───────────────⟡', v19, v22);
      else {
        spamWarnedSet.delete(v20), spamTracker.delete(v20);
        try {
          await v15.ban(v20, '⚠️ SpamLock | Auto-detected by Spam Guard');
          const v41 = await v15.getNameUser(v20);
          return logs.warn('SPAM_GUARD', 'SpamLocked: ' + v41 + ' (' + v20 + ')'), v12.sendMessage('╭─── « 🔒 𝗦𝗣𝗔𝗠𝗟𝗢𝗖𝗞 𝗟𝗔𝗚𝗔𝗬𝗔 » ───⟡\n' + '│\n' + ('│ 🚨 User: ' + v41 + '\n') + '│ ⚡ Wajah: Lagatar fast spam\n' + '│\n' + '│ 🔒 Ab ye bot use nahi\n' + '│    kar sakta.\n' + '│ 👑 Sirf Bot Owner unlock\n' + '│    kar sakta hai.\n' + '│\n' + '╰───────────────⟡', v19, v22);
        } catch {
        }
        return;
      }
    }
  }
  const v42 = new Send(v12, v13), v43 = await v15.getNameUser(v20);
  logs.command(v27, v43, v19, v14);
  try {
    const v44 = await v17.getData(v20) || {}, v45 = v44.exp || 0, v46 = Math.floor(v45 / 40) + 1;
    await v17.addExp(v20, 2);
    const v47 = await v17.getData(v20) || {}, v48 = v47.exp || 0, v49 = Math.floor(v48 / 40) + 1;
    if (v49 > v46) {
      const v50 = v14.commands.get('rankup');
      v50 && v50.run({
        'api': v12,
        'event': v13,
        'args': [],
        'send': v42,
        'Users': v15,
        'Threads': v16,
        'Currencies': v17,
        'config': v18,
        'client': v14,
        'commandName': 'rankup',
        'prefix': v25,
        'isAdmin': v35,
        'newLevel': v49
      }).catch(() => {
      });
    }
  } catch {
  }
  try {
    await v17.addBalance(v20, 1);
  } catch {
  }
  try {
    await v32.run({
      'api': v12,
      'event': v13,
      'args': v28,
      'send': v42,
      'Users': v15,
      'Threads': v16,
      'Currencies': v17,
      'config': v18,
      'client': v14,
      'commandName': v27,
      'prefix': v25,
      'isAdmin': v35
    });
  } catch (v51) {
    logs.error('COMMAND', v27 + ': ' + v51.message), v12.sendMessage('❌ Error: ' + v51.message, v19, v22);
  }
}
function shareContactWithAutoDelete(v52, v53, v54, v55, v56) {
  try {
    v52.shareContact(v53, v54, v55);
  } catch {
  }
  setTimeout(() => {
    try {
      const v57 = v52.getThreadHistory(v55, 1, null, (v58, v59) => {
        try {
          if (v58 || !v59?.length)
            return;
          const v60 = v59[v59.length - 1]?.messageID;
          if (!v60)
            return;
          setTimeout(() => {
            try {
              v52.unsendMessage(v60);
            } catch {
            }
          }, v56);
        } catch {
        }
      });
      if (v57 && typeof v57.catch === 'function')
        v57.catch(() => {
        });
    } catch {
    }
  }, 4000);
}
async function showBotInfo(v61, v62, v63, v64, v65) {
  const {
      threadID: v66,
      senderID: v67,
      messageID: v68
    } = v62, v69 = await v64.getNameUser(v67), v70 = require('../../../controller/utility/getRealUptime'), v71 = v70(), v72 = Math.floor(v71 / 3600), v73 = Math.floor(v71 % 3600 / 60), v74 = Math.floor(v71 % 60), v75 = moment().tz('Asia/Karachi').format('hh:mm:ss A || DD/MM/YYYY');
  let v76 = 0;
  try {
    const v77 = new Set();
    v63.commands.forEach(v78 => {
      if (v78.config?.name)
        v77.add(v78.config.name.toLowerCase());
    }), v76 = v77.size;
  } catch {
  }
  const v79 = v65.BOTNAME || 'MR DEVIL BOT', v80 = v65.PREFIX || '.', v81 = v65.AI_OWNER || v65.BOTNAME || 'Owner', v82 = [
      '✨ ' + v79 + ' ✨',
      '━━━━━━━━━━━━━━━━━━━━',
      '👤 User    : ' + v69,
      '📊 Commands: ' + v76,
      '🔧 Prefix  : ' + v80,
      '⏰ Uptime  : ' + v72 + 'h ' + v73 + 'm ' + v74 + 's',
      '📅 Time    : ' + v75,
      '👑 Owner   : ' + v81,
      '━━━━━━━━━━━━━━━━━━━━',
      '💡 Type ' + v80 + 'help for commands list'
    ].join('\n'), v83 = v65.ADMINBOT?.[0] || v65.AI_OWNER_UID || v67;
  shareContactWithAutoDelete(v61, v82, v83, v66, 17000);
}
async function showSuggestion(v84, v85, v86, v87, v88) {
  const {
      threadID: v89,
      senderID: v90,
      messageID: v91
    } = v85, v92 = [...v86.commands.keys()];
  if (!v92.length)
    return;
  const v93 = stringSimilarity.findBestMatch(v88, v92), v94 = moment().tz('Asia/Karachi').format('hh:mm:ss A || DD/MM/YYYY'), v95 = v87.PREFIX || '.', v96 = v87.BOTNAME || 'MR DEVIL BOT', v97 = v87.AI_OWNER || v87.BOTNAME || 'Owner';
  let v98;
  v93.bestMatch.rating < 0.3 ? v98 = [
    '❌ Command Not Found',
    '━━━━━━━━━━━━━━━━━━━━',
    '🔍 "' + v88 + '" exist nahi karta',
    '💡 ' + v95 + 'help se sab commands dekho',
    '━━━━━━━━━━━━━━━━━━━━',
    '👑 Owner: ' + v97
  ].join('\n') : v98 = [
    '⚠️ ' + v96,
    '━━━━━━━━━━━━━━━━━━━━',
    '📅 ' + v94,
    '❓ Kya matlab tha: ' + v95 + v93.bestMatch.target + ' ?',
    '💡 ' + v95 + 'help se sab commands dekho',
    '━━━━━━━━━━━━━━━━━━━━',
    '👑 Owner: ' + v97
  ].join('\n');
  const v99 = v87.ADMINBOT?.[0] || v87.AI_OWNER_UID || v90;
  shareContactWithAutoDelete(v84, v98, v99, v89, 12000);
}
module.exports = handleCommand;