const handleCommand = require('./handle/handleCommand'), handleEvent = require('./handle/handleEvent'), handleReaction = require('./handle/handleReaction'), handleReply = require('./handle/handleReply'), handleCreateDatabase = require('./handle/handleCreateDatabase'), handleAutoDetect = require('./handle/handleAutoDetect'), logs = require('../utility/logs'), messageCounter = new Map();
function listen({
  api: v1,
  client: v2,
  Users: v3,
  Threads: v4,
  Currencies: v5,
  config: v6
}) {
  return async (v7, v8) => {
    if (v7) {
      logs.error('LISTEN', (v7.code || 'UNKNOWN') + ': ' + (v7.message || v7));
      return;
    }
    if (!v8)
      return;
    try {
      if (v8.type === 'message' || v8.type === 'message_reply') {
        const v9 = await v3.getNameUser(v8.senderID).catch(() => v8.senderID);
        logs.info('MSG_IN', '[' + v8.threadID + '] ' + v9 + ': ' + (v8.body || '(no body)'));
      }
      handleCreateDatabase({
        'api': v1,
        'event': v8,
        'Users': v3,
        'Threads': v4,
        'Currencies': v5
      }).catch(() => {
      });
      if (v6.IGNORED_USERS?.includes(v8.senderID))
        return;
      if (v8.threadID)
        try {
          const v10 = await v4.isBanned(v8.threadID);
          if (v10) {
            const v11 = (v8.body || '').trim().toLowerCase(), v12 = (v6.PREFIX || '.').toLowerCase(), v13 = [
                v12 + 'threadban unban',
                v12 + 'tban unban',
                v12 + 'groupban unban',
                v12 + 'blockthread unban'
              ].some(v14 => v11.startsWith(v14));
            if (v13) {
              const v15 = String(v8.senderID || ''), v16 = (v6.ADMINBOT || []).map(String).includes(v15);
              if (!v16)
                return;
            } else
              return;
          }
        } catch {
        }
      switch (v8.type) {
      case 'message':
      case 'message_reply': {
          (async () => {
            try {
              const v20 = v8.senderID, v21 = (messageCounter.get(v20) || 0) + 1;
              messageCounter.set(v20, v21);
              if (v21 % 20 === 0) {
                messageCounter.set(v20, 0);
                const v22 = await v5.getData(v20), v23 = v22.exp || 0, v24 = Math.max(1, Math.floor(Math.sqrt(v23 / 12.5))), v25 = (v24 + 1) * (v24 + 1) * 12.5, v26 = Math.max(1, Math.ceil(v25 - v23));
                await v5.addExp(v20, v26);
                const v27 = await v5.getData(v20), v28 = Math.max(1, Math.floor(Math.sqrt((v27.exp || 0) / 12.5)));
                if (v28 > v24) {
                  logs.info('AUTO_RANKUP', v20 + ' leveled up: ' + v24 + ' → ' + v28);
                  const v29 = v2.commands.get('rankup');
                  if (v29)
                    try {
                      await v29.run({
                        'api': v1,
                        'event': v8,
                        'Users': v3,
                        'Currencies': v5,
                        'args': [],
                        'config': v6,
                        'client': v2,
                        'newLevel': v28
                      });
                    } catch {
                    }
                }
              }
            } catch {
            }
          })(), await handleCommand({
            'api': v1,
            'event': v8,
            'client': v2,
            'Users': v3,
            'Threads': v4,
            'Currencies': v5,
            'config': v6
          }), await handleAutoDetect({
            'api': v1,
            'event': v8,
            'client': v2,
            'Users': v3,
            'Threads': v4,
            'config': v6
          });
          v8.type === 'message_reply' && await handleReply({
            'api': v1,
            'event': v8,
            'client': v2,
            'Users': v3,
            'Threads': v4,
            'Currencies': v5,
            'config': v6
          });
          break;
        }
      case 'event':
        await handleEvent({
          'api': v1,
          'event': v8,
          'client': v2,
          'Users': v3,
          'Threads': v4,
          'config': v6
        });
        break;
      case 'message_reaction':
        await handleReaction({
          'api': v1,
          'event': v8,
          'config': v6
        });
        break;
      case 'message_unsend': {
          for (const [v30, v31] of v2.events) {
            try {
              const v32 = v31.config.eventType, v33 = Array.isArray(v32) ? v32.includes('message_unsend') : v32 === 'message_unsend';
              if (!v33)
                continue;
              await v31.run({
                'api': v1,
                'event': v8,
                'client': v2,
                'Users': v3,
                'Threads': v4,
                'config': v6
              });
            } catch (v34) {
              logs.error('UNSEND', 'Error in ' + v30 + ': ' + v34.message);
            }
          }
          break;
        }
      case 'typ':
      case 'read':
      case 'read_receipt':
      case 'presence':
        break;
      default:
        break;
      }
    } catch (v35) {
      logs.error('LISTEN', v35.message);
    }
  };
}
module.exports = listen;