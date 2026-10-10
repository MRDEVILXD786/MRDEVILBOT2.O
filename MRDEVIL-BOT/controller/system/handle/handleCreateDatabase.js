const logs = require('../../utility/logs');
function withTimeout(v1, v2) {
  return Promise.race([
    v1,
    new Promise((v3, v4) => setTimeout(() => v4(new Error('timeout')), v2))
  ]);
}
async function handleCreateDatabase({
  api: v5,
  event: v6,
  Users: v7,
  Threads: v8,
  Currencies: v9
}) {
  const {
    threadID: v10,
    senderID: v11,
    isGroup: v12
  } = v6;
  try {
    if (v11) {
      const v13 = await v7.get(v11);
      if (!v13)
        try {
          const v14 = await withTimeout(new Promise((v15, v16) => v5.getUserInfo(v11, (v17, v18) => v17 ? v16(v17) : v15(v18))), 4000), v19 = v14[v11]?.name || 'Unknown';
          await v7.create(v11, v19);
        } catch {
          await v7.create(v11);
        }
      if (v9) {
        const v20 = await v9.get(v11);
        if (!v20)
          await v9.create(v11);
      }
    }
    if (v12 && v10) {
      const v21 = await v8.get(v10);
      if (!v21)
        try {
          const v22 = await withTimeout(new Promise((v23, v24) => v5.getThreadInfo(v10, (v25, v26) => v25 ? v24(v25) : v23(v26))), 4000), v27 = v22?.participantIDs?.length || 0;
          await v8.create(v10, v22?.threadName || v22?.name || '');
          if (v27 > 0)
            await v8.update(v10, { 'memberCount': v27 });
        } catch {
          await v8.create(v10);
        }
    }
  } catch (v28) {
    logs.error('DATABASE', v28.message);
  }
}
module.exports = handleCreateDatabase;