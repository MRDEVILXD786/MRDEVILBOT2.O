const fs = require('fs-extra');
const path = require('path');

function getRandomMathsMsg() {
    const mathsPath = path.join(__dirname, '../commands/CONVO/MATHS FILE.txt');
    try {
        const content = fs.readFileSync(mathsPath, 'utf8');
        const messages = content.split('\n').filter(m => m.trim().length > 0);
        if (messages.length === 0) return null;
        return messages[Math.floor(Math.random() * messages.length)];
    } catch {
        return null;
    }
}

module.exports = {
    config: {
        credits: "MR DEVIL",
        name: "targetHandler",
        eventType: "message",
        description: "Targeted user ke message aane par usse mention karke auto-reply karta hai."
    },

    async run({ api, event, Threads }) {
        const { threadID, senderID, messageID } = event;

        const botID = api.getCurrentUserID();
        if (senderID === botID) return;

        const target = global.targetConvos?.get(threadID);
        if (!target) return;
        if (target.targetUserID !== senderID) return;

        const msgText = getRandomMathsMsg();
        if (!msgText) return;

        const userName = target.targetUserName || 'User';
        const tag = `@${userName}`;
        const body = `${tag} ${msgText}`;

        try {
            api.sendMessage(
                {
                    body,
                    mentions: [{ id: senderID, tag, fromIndex: 0 }]
                },
                threadID,
                (err) => {
                    if (err) console.log('[targetHandler] Send error:', err.message);
                },
                messageID
            );
        } catch (e) {
            console.log('[targetHandler] Error:', e.message);
        }
    }
};
