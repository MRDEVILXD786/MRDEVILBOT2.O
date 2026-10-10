const logs = require('../../utility/logs');
async function handleReaction({
  api: v1,
  event: v2,
  config: v3
}) {
  const {
    threadID: v4,
    messageID: v5,
    userID: v6,
    reaction: v7
  } = v2;
  if (!v7)
    return;
  const v8 = v3.REACT_DELETE_EMOJI || '😡';
  if (v7 === v8) {
    try {
      const v9 = v1.getCurrentUserID();
      if (v6 === v9)
        return;
      await v1.unsendMessage(v5), logs.info('REACTION', 'Deleted msg by ' + v8 + ' reaction from ' + v6);
    } catch (v10) {
      logs.error('REACTION', v10.message);
    }
    return;
  }
  if (!global.client?.handleReaction)
    return;
  const v11 = global.client.handleReaction.find(v12 => v12.messageID === v5);
  if (!v11)
    return;
  try {
    const v13 = global.client.commands.get(v11.name);
    if (!v13?.handleReaction)
      return;
    await v13.handleReaction({
      'api': v1,
      'event': v2,
      'config': v3,
      'handleReaction': v11
    });
  } catch (v14) {
    logs.error('REACTION_CMD', v14.message);
  }
}
module.exports = handleReaction;