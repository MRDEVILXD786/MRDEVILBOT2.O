const logs = require('../../utility/logs'), Send = require('../../utility/send'), crypto = require('crypto');
async function handleReply({
  api: v4,
  event: v5,
  client: v6,
  Users: v7,
  Threads: v8,
  Currencies: v9,
  config: v10
}) {
  const {
    threadID: v11,
    senderID: v12,
    messageID: v13,
    messageReply: v14
  } = v5;
  if (!v14 || !v6.replies)
    return;
  const v15 = v6.replies.get(v14.messageID);
  if (!v15)
    return;
  if (global.activeConvos?.has(v11) && v15.commandName !== 'convo')
    return;
  if (v15.author && v12 !== v15.author)
    return v4.sendMessage('❌ This reply is not for you.', v11, v13);
  const v16 = v6.commands.get(v15.commandName);
  if (!v16?.handleReply)
    return;
  const v17 = new Send(v4, v5);
  try {
    await v16.handleReply({
      'api': v4,
      'event': v5,
      'send': v17,
      'Users': v7,
      'Threads': v8,
      'config': v10,
      'client': v6,
      'Currencies': v9,
      'data': v15.data,
      'callback': v15.callback
    });
  } catch (v18) {
    logs.error('REPLY', 'Error in ' + v15.commandName + ': ' + v18.message);
  }
}
module.exports = handleReply;