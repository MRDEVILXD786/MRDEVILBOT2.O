const spin = ['◐', '◓', '◑', '◒'];
const frames = ['⬜⬜⬜⬜⬜', '🟦⬜⬜⬜⬜', '🟦🟦⬜⬜⬜', '🟦🟦🟦⬜⬜', '🟦🟦🟦🟦⬜', '🟦🟦🟦🟦🟦'];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function pct(done, total) {
  return Math.round((done / Math.max(total, 1)) * 100);
}

function barStr(done, total, size = 12) {
  const f = Math.round((done / Math.max(total, 1)) * size);
  return '█'.repeat(f) + '░'.repeat(size - f);
}

// Fetch INBOX groups — split into active (bot is in) and left (bot not in)
// Uses participantIDs from thread list directly — no extra API calls per group
async function fetchAllGroupThreads(api, botID) {
  const active = [];
  const left = [];
  const seenIDs = new Set();
  let timestamp = null;
  const BATCH = 100;

  while (true) {
    let batch;
    try {
      batch = await new Promise((res, rej) =>
        api.getThreadList(BATCH, timestamp, ['INBOX'], (err, d) => err ? rej(err) : res(d))
      );
    } catch { break; }

    if (!batch || !batch.length) break;

    for (const t of batch) {
      if (!t.isGroup || seenIDs.has(t.threadID)) continue;
      seenIDs.add(t.threadID);
      const participants = (t.participantIDs || []).map(String);
      if (participants.includes(String(botID))) {
        active.push(t);
      } else {
        left.push(t);
      }
    }

    if (batch.length < BATCH) break;
    timestamp = parseInt(batch[batch.length - 1].timestamp);
  }

  return { active, left };
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'clearinbox',
    aliases: ['cleaninbox', 'purgeinbox', 'cleanup'],
    description: 'Bot jahan nahi hai un groups ko DB se delete karo aur inbox clean karo.',
    usage: 'clearinbox',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },

  async run({ api, event, send, Threads }) {
    const { threadID } = event;
    const botID = api.getCurrentUserID();

    const info = await new Promise((resolve, reject) => {
      api.sendMessage(
        `╭───────────────────╮\n` +
        `│  🧹 CLEAR INBOX          │\n` +
        `│  ${spin[0]} Fetching all groups...\n` +
        `╰───────────────────╯`,
        threadID,
        (err, data) => err ? reject(err) : resolve(data)
      );
    });
    const mid = info?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    let sf = 0;
    const anim = setInterval(() => {
      edit(
        `╭───────────────────╮\n` +
        `│  🧹 CLEAR INBOX          │\n` +
        `│  ${spin[sf % 4]} Scanning groups...\n` +
        `│  ${frames[Math.min(sf, 5)]}\n` +
        `╰───────────────────╯`
      );
      sf++;
    }, 500);

    let activeGroups = [], leftGroups = [];
    try {
      const result = await fetchAllGroupThreads(api, botID);
      activeGroups = result.active;
      leftGroups = result.left;
    } catch (e) {
      clearInterval(anim);
      return edit('❌ Error fetching groups: ' + e.message);
    }
    clearInterval(anim);

    const totalScanned = activeGroups.length + leftGroups.length;

    edit(
      `╭────────────────────╮\n` +
      `│  🧹 SCANNING DONE        │\n` +
      `│  📊 Total: ${totalScanned}\n` +
      `│  ✅ Active: ${activeGroups.length}\n` +
      `│  ❌ Left: ${leftGroups.length}\n` +
      `│  🗑️ DB cleaning...\n` +
      `╰────────────────────╯`
    );

    await sleep(500);

    let dbGroups = [];
    try { dbGroups = await Threads.getAll(); } catch {}

    const fbActiveIDs = new Set(activeGroups.map(g => g.threadID));
    const toDelete = dbGroups.filter(t => !fbActiveIDs.has(t.id));
    const toKeep = dbGroups.filter(t => fbActiveIDs.has(t.id));

    edit(
      `╭─────────────────────╮\n` +
      `│  🧹 DELETING...          │\n` +
      `│  📦 DB Total: ${dbGroups.length}\n` +
      `│  ❌ To Delete: ${toDelete.length}\n` +
      `│  ✅ To Keep: ${toKeep.length}\n` +
      `╰─────────────────────╯`
    );

    let deleted = 0;
    for (const t of toDelete) {
      try { await Threads.delete(t.id); deleted++; } catch {}
    }

    const lines = [
      `╭── 🧹 CLEAR INBOX DONE ─╮`,
      `│`,
      `│  📊 Groups Scanned  : ${totalScanned}`,
      `│  ✅ Bot Active      : ${activeGroups.length}`,
      `│  ❌ Bot Left        : ${leftGroups.length}`,
      `│  🗑️ Deleted from DB : ${deleted}`,
      `│  💾 DB Kept         : ${toKeep.length}`,
      `│`,
    ];

    if (toDelete.length > 0) {
      lines.push(`│  📛 Removed Groups:`);
      toDelete.slice(0, 8).forEach((t, i) => {
        lines.push(`│   ${i + 1}. ${t.name || t.id}`);
      });
      if (toDelete.length > 8) lines.push(`│   ...+${toDelete.length - 8} zyada`);
      lines.push(`│`);
    }

    lines.push(`│  ✅ Inbox clean ho gaya!`);
    lines.push(`╰─────────────────────╯`);

    await api.sendMessage(lines.join('\n'), threadID);
  }
};
