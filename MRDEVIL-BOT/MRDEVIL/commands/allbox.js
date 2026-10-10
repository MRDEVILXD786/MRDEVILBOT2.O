function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAllGroupThreads(api, botID) {
  const groups = [];
  const seenIDs = new Set();
  const BATCH = 100;
  const folders = ['INBOX'];

  for (const folder of folders) {
    let timestamp = null;
    while (true) {
      let batch;
      try {
        batch = await new Promise((res, rej) =>
          api.getThreadList(BATCH, timestamp, [folder], (err, d) => err ? rej(err) : res(d))
        );
      } catch { break; }

      if (!batch || !batch.length) break;

      for (const t of batch) {
        if (!t.isGroup) continue;
        if (seenIDs.has(t.threadID)) continue;
        const participants = t.participantIDs || [];
        if (!participants.map(String).includes(String(botID))) continue;
        seenIDs.add(t.threadID);
        groups.push(t);
      }

      if (batch.length < BATCH) break;
      timestamp = parseInt(batch[batch.length - 1].timestamp);
    }
    await sleep(300);
  }

  return groups;
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'allbox',
    aliases: ['allgroups', 'grouplist'],
    description: 'Bot jin jin groups mein hai unki puri list show karo.',
    usage: 'allbox',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },

  async run({ api, event, send, Threads }) {
    const { threadID } = event;
    const botID = api.getCurrentUserID();

    const info = await new Promise((resolve, reject) => {
      api.sendMessage('⏳ Facebook se sab groups la raha hun...', threadID, (err, d) => err ? reject(err) : resolve(d));
    });
    const mid = info?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    let fbGroups = [];
    try {
      fbGroups = await fetchAllGroupThreads(api, botID);
    } catch (e) {
      return edit('❌ Groups fetch nahi ho sake: ' + e.message);
    }

    if (!fbGroups.length) {
      return edit('❌ Bot kisi bhi active group mein nahi mila.');
    }

    let dbMap = {};
    try {
      const all = await Threads.getAll();
      all.forEach(t => { dbMap[t.id] = t; });
    } catch {}

    const lines = [];
    fbGroups.forEach((g, i) => {
      const db = dbMap[g.threadID];
      const status = db?.banned ? '🚫' : db?.settings?.spam ? '⚠️' : '✅';
      const members = g.participantIDs?.length || '?';
      lines.push(`${i + 1}. ${status} ${g.threadName || 'Unnamed'}\n    🆔 ${g.threadID} | 👥 ${members}`);
    });

    const CHUNK = 30;
    for (let i = 0; i < lines.length; i += CHUNK) {
      const chunk = lines.slice(i, i + CHUNK);
      const isFirst = i === 0;
      const header = isFirst
        ? `╭─ 📋 ALL GROUPS (${fbGroups.length}) ─╮\n│ ✅ Active  ⚠️ Spam  🚫 Banned\n╰────────────────╯\n\n`
        : `📋 Groups ${i + 1}–${Math.min(i + CHUNK, fbGroups.length)}:\n\n`;

      const msg = header + chunk.join('\n\n');

      if (isFirst) {
        edit(msg);
      } else {
        await sleep(500);
        await api.sendMessage(msg, threadID);
      }
    }
  }
};
