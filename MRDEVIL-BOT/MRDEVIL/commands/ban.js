function isProtected(v1, v2) {
  const v3 = String(v1);
  return (v2.ADMINBOT || []).map(String).includes(v3);
}
module.exports = {
  'config': {
    'credits': 'MR DEVIL',
    'name': 'ban',
    'aliases': ['banuser'],
    'description': 'Ban a user from using the bot.',
    'usage': 'ban @mention [reason]',
    'category': 'Admin',
    'prefix': !![],
    'adminOnly': !![]
  },
  async 'run'({
    api: v4,
    event: v5,
    args: v6,
    send: v7,
    Users: v8,
    config: v9
  }) {
    const {mentions: v10} = v5, v11 = Object.keys(v10 || {});
    if (!v11.length)
      return v7.reply('❌ Please mention a user to ban.\nUsage: ' + v9.PREFIX + 'ban @user [reason]');
    const v12 = v6.slice(Object.keys(v10).length > 0 ? 1 : 0).join(' ') || 'No reason given';
    let v13 = '🚫 BAN RESULTS:\n';
    for (const v14 of v11) {
      if (isProtected(v14, v9)) {
        const v15 = await v8.getNameUser(v14);
        v13 += '⚠️ ' + v15 + ' ko ban nahi kar sakte (Protected Owner)\n';
        continue;
      }
      await v8.ban(v14, v12);
      const v16 = await v8.getNameUser(v14);
      v13 += '✅ Banned: ' + v16 + ' (' + v14 + ')\n📋 Reason: ' + v12 + '\n';
    }
    v7.reply(v13);
  }
};