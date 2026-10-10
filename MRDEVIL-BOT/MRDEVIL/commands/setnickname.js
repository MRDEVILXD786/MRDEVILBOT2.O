const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const spin = ['◐', '◓', '◑', '◒'];

function bar(done, total, size = 12) {
  const f = Math.round((done / Math.max(total, 1)) * size);
  return '█'.repeat(f) + '░'.repeat(size - f);
}

function pct(done, total) {
  return Math.round((done / Math.max(total, 1)) * 100);
}

function bold(t) {
  const map = {
    a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',
    k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',
    u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',
    E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',
    O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',
    Y:'𝗬',Z:'𝗭',0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',
    8:'𝟴',9:'𝟵'
  };
  return String(t).split('').map(c => map[c] || c).join('');
}

function setNick(api, nick, threadID, botID) {
  return new Promise((resolve) => {
    api.changeNickname(nick, threadID, botID, (err) => {
      if (err) {
        resolve({ ok: false, error: err.error || err.message || String(err) });
      } else {
        resolve({ ok: true });
      }
    });
  });
}

module.exports = {
  config: {
    credits: 'MR DEVIL',
    name: 'setnickname',
    aliases: ['botnick', 'fixnick', 'nickfix'],
    description: 'Sab groups mein bot ka nickname set karo.',
    usage: 'setnickname',
    category: 'Admin',
    prefix: true,
    adminOnly: true,
    cooldowns: 15
  },

  async run({ api, event, send, config, threadID: _tid }) {
    const { threadID } = event;
    const botID = api.getCurrentUserID();
    const correctNick = config.BOTNAME || 'MR DEVIL BOT';

    const info = await send.reply(
      `╭─── « 🏷️ ɴɪᴄᴋ ꜱᴇᴛᴛᴇʀ » ───⟡\n` +
      `│\n` +
      `│ ${spin[0]} Groups fetch ho rahe hain...\n` +
      `│ 🎯 Target Nick:\n` +
      `│    ${correctNick.slice(0, 25)}\n` +
      `│\n` +
      `│ [░░░░░░░░░░░░] 0%\n` +
      `│\n` +
      `╰───────────────⟡`
    );

    const mid = info?.messageID;
    const edit = (txt) => {
      try { api.editMessage(txt, mid); } catch {}
    };

    let groups = [];
    try {
      let allThreads = [];

      const fetchThreads = (tags) => new Promise((res) =>
        api.getThreadList(200, null, tags, (err, d) => res(err ? [] : (d || [])))
      );

      const [inbox, archived] = await Promise.all([
        fetchThreads(['INBOX']),
        fetchThreads(['ARCHIVED'])
      ]);

      allThreads = [...inbox, ...archived];

      const seen = new Set();
      groups = allThreads.filter(t => {
        if (!t.isGroup) return false;
        if (seen.has(t.threadID)) return false;
        seen.add(t.threadID);
        return true;
      });
    } catch (e) {
      return edit(
        `╭─── « ❌ ERROR » ───⟡\n` +
        `│\n` +
        `│ 😔 Groups list nahi mili.\n` +
        `│ ◈ ${String(e.message || e).slice(0, 60)}\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    if (!groups.length) {
      return edit(
        `╭─── « ❌ KHAALI » ───⟡\n` +
        `│\n` +
        `│ 😕 Koi group nahi mila!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    edit(
      `╭─── « 🏷️ ɴɪᴄᴋ ꜱᴇᴛᴛᴇʀ » ───⟡\n` +
      `│\n` +
      `│ ${spin[1]} Processing shuru...\n` +
      `│ 📦 Groups: ${bold(String(groups.length))}\n` +
      `│ 🎯 Nick: ${correctNick.slice(0, 20)}\n` +
      `│\n` +
      `│ [░░░░░░░░░░░░] 0%\n` +
      `│\n` +
      `╰───────────────⟡`
    );

    await sleep(800);

    let done = 0;
    let updated = 0;
    let alreadyOk = 0;
    let failed = 0;
    let spinIdx = 0;
    const updatedNames = [];
    const sampleErrors = [];

    for (const group of groups) {
      spinIdx++;
      const gid = group.threadID;

      try {
        const threadInfo = await new Promise((res, rej) =>
          api.getThreadInfo(gid, (err, d) => err ? rej(err) : res(d))
        );

        const currentNick = threadInfo?.nicknames?.[botID] || '';
        const botInThread = threadInfo?.participantIDs?.includes(String(botID)) ||
                            threadInfo?.participantIDs?.includes(botID);

        if (!botInThread) { done++; continue; }

        if (currentNick === correctNick) {
          alreadyOk++;
        } else {
          const result = await setNick(api, correctNick, gid, botID);
          await sleep(400);

          if (result.ok) {
            updated++;
            const name = (group.threadName || group.name || String(gid)).slice(0, 20);
            updatedNames.push(name);
          } else {
            failed++;
            const errMsg = String(result.error || 'unknown').slice(0, 50);
            if (sampleErrors.length < 2) sampleErrors.push(errMsg);
            console.error(`[BOTNICK] Failed ${gid}: ${errMsg}`);
          }
        }
      } catch (e) {
        failed++;
        const errMsg = String(e.message || e).slice(0, 50);
        if (sampleErrors.length < 2) sampleErrors.push(errMsg);
        console.error(`[BOTNICK] Error ${gid}:`, errMsg);
      }

      done++;

      if (done % 3 === 0 || done === groups.length) {
        const p = pct(done, groups.length);
        const b = bar(done, groups.length);
        edit(
          `╭─── « 🏷️ ɴɪᴄᴋ ꜱᴇᴛᴛᴇʀ » ───⟡\n` +
          `│\n` +
          `│ ${spin[spinIdx % 4]} Nickname set ho raha hai...\n` +
          `│ 📦 ${bold(String(done))}/${bold(String(groups.length))} groups\n` +
          `│\n` +
          `│ [${b}] ${bold(String(p))}%\n` +
          `│\n` +
          `│ ✅ Updated : ${bold(String(updated))}\n` +
          `│ 💚 Already : ${bold(String(alreadyOk))}\n` +
          `│ ❌ Failed  : ${bold(String(failed))}\n` +
          `│\n` +
          `╰───────────────⟡`
        );
      }

      await sleep(500);
    }

    await sleep(600);

    let finalMsg =
      `╭─── « ✅ ɴɪᴄᴋ ᴄᴏᴍᴘʟᴇᴛᴇ » ───⟡\n` +
      `│\n` +
      `│ 🏷️ ${bold('Nickname Complete!')}\n` +
      `│\n` +
      `│ ◈ 🎯 Nick    : ${correctNick.slice(0, 20)}\n` +
      `│ ◈ 📦 Total   : ${bold(String(groups.length))}\n` +
      `│ ◈ ✅ Updated : ${bold(String(updated))}\n` +
      `│ ◈ 💚 OK      : ${bold(String(alreadyOk))}\n` +
      `│ ◈ ❌ Failed  : ${bold(String(failed))}\n`;

    if (updatedNames.length > 0) {
      finalMsg += `│\n│ 📝 Updated Groups:\n`;
      updatedNames.slice(0, 8).forEach((name, i) => {
        finalMsg += `│  ${i + 1}. ${name}\n`;
      });
      if (updatedNames.length > 8) {
        finalMsg += `│  ... aur ${bold(String(updatedNames.length - 8))} aur\n`;
      }
    }

    if (sampleErrors.length > 0) {
      finalMsg += `│\n│ ⚠️ Error:\n`;
      sampleErrors.forEach(e => {
        finalMsg += `│  • ${e.slice(0, 40)}\n`;
      });
    }

    finalMsg +=
      `│\n` +
      `╰───────────────⟡`;

    await sleep(300);
    try { api.editMessage(finalMsg, mid); } catch {}
    await sleep(800);
    send.reply(finalMsg);
  }
};
