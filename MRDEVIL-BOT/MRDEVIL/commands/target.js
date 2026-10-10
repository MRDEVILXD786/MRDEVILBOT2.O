const fs = require('fs-extra');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const editMsg = (api, text, msgID) => { try { api.editMessage(text, msgID); } catch {} };

if (!global.targetConvos) {
    global.targetConvos = new Map();
}

function getMathsMessages() {
    const mathsPath = path.join(__dirname, 'CONVO/MATHS FILE.txt');
    try {
        const content = fs.readFileSync(mathsPath, 'utf8');
        const messages = content.split('\n').filter(m => m.trim().length > 0);
        return messages;
    } catch {
        return ['Hello!', 'How are you?', 'Nice to talk!'];
    }
}

module.exports = {
    config: {
        credits: "MR DEVIL",
        name: 'target',
        aliases: ['targetuser', 'settarget'],
        description: "Target a user — bot will auto-reply to their messages using MATHS FILE",
        usage: 'target @user / target uid / target reply / target off',
        category: 'Tools',
        prefix: true,
        adminOnly: true
    },

    async run({ api, event, args, send, Threads }) {
        const { threadID, senderID, messageReply, mentions } = event;
        const action = args[0]?.toLowerCase();

        if (action === 'off' || action === 'disable') {
            const had = global.targetConvos.has(threadID);

            const sent = await send.reply(
                `╭─── « 🎯 TARGET » ───⟡\n│\n│ ⌛ ▱▱▱▱▱▱▱▱▱▱ Processing...\n╰───────────────⟡`
            );
            await sleep(700);

            global.targetConvos.delete(threadID);
            Threads.setSettings(threadID, {
                targetUserID: null,
                targetUserName: null,
                targetIndex: 0
            });

            await editMsg(api,
                had
                    ? `╭─── « 🎯 TARGET OFF » ───⟡\n│\n│ ✅ ▰▰▰▰▰▰▰▰▰▰ Done!\n│\n│ 🛑 Target DISABLED\n│ ✔️ Bot ab kisi ko target\n│    nahi karega.\n│\n╰───────────────⟡`
                    : `╭─── « 🎯 TARGET OFF » ───⟡\n│\n│ ℹ️ Koi active target nahi\n│    tha is group mein.\n│\n╰───────────────⟡`,
                sent.messageID
            );
            return;
        }

        if (action === 'list' || action === 'status') {
            const active = global.targetConvos.get(threadID);
            return send.reply(
                active
                    ? `╭─── « 🎯 TARGET STATUS » ───⟡\n│\n│ ✅ Target ACTIVE\n│\n│ 👤 User : ${active.targetUserName}\n│ 🆔 UID  : ${active.targetUserID}\n│\n╰───────────────⟡`
                    : `╭─── « 🎯 TARGET STATUS » ───⟡\n│\n│ ❌ Koi target set nahi hai.\n│\n╰───────────────⟡`
            );
        }

        let targetUserID = null;
        let targetUserName = null;

        if (mentions && Object.keys(mentions).length > 0) {
            const mentionKeys = Object.keys(mentions);
            targetUserID = mentionKeys[0];
            targetUserName = mentions[targetUserID].replace(/@/g, '');
        } else if (action === 'reply' && messageReply) {
            targetUserID = messageReply.senderID.toString();
            try {
                const userInfo = await api.getUserInfo(targetUserID);
                targetUserName = userInfo[targetUserID]?.name || 'User';
            } catch {
                targetUserName = 'User';
            }
        } else if (args[0] && /^\d+$/.test(args[0])) {
            targetUserID = args[0];
            try {
                const userInfo = await api.getUserInfo(targetUserID);
                targetUserName = userInfo[targetUserID]?.name || 'User';
            } catch {
                targetUserName = 'User';
            }
        } else {
            return send.reply(
                `╭─── « 🎯 TARGET COMMAND » ───⟡\n│\n│ 📖 Usage:\n│\n│ • target @username\n│   (mention se target kro)\n│\n│ • target [uid]\n│   (UID se target kro)\n│\n│ • target reply\n│   (reply wale user ko target)\n│\n│ • target off\n│   (target band kro)\n│\n│ • target status\n│   (active target dekho)\n│\n╰───────────────⟡`
            );
        }

        if (!targetUserID) {
            return send.reply(
                `╭─── « ❌ ERROR » ───⟡\n│\n│ User identify nahi ho saka.\n│ Dobara try kro.\n│\n╰───────────────⟡`
            );
        }

        const sent = await send.reply(
            `╭─── « 🎯 SETTING TARGET » ───⟡\n│\n│ ⌛ ▱▱▱▱▱▱▱▱▱▱ 0%\n│    Scanning user...\n╰───────────────⟡`
        );
        await sleep(700);
        await editMsg(api,
            `╭─── « 🎯 SETTING TARGET » ───⟡\n│\n│ 🔄 ▰▰▰▰▰▱▱▱▱▱ 50%\n│    Loading MATHS FILE...\n╰───────────────⟡`,
            sent.messageID
        );
        await sleep(700);

        const msgs = getMathsMessages();

        const targetData = {
            targetUserID,
            targetUserName,
            messageIndex: 0
        };

        global.targetConvos.set(threadID, targetData);
        Threads.setSettings(threadID, {
            targetUserID,
            targetUserName,
            targetIndex: 0
        });

        await editMsg(api,
            `╭─── « 🎯 TARGET SET » ───⟡\n│\n│ ✅ ▰▰▰▰▰▰▰▰▰▰ 100%\n│\n│ 👤 User   : ${targetUserName}\n│ 🆔 UID    : ${targetUserID}\n│ 📨 Msgs   : ${msgs.length} loaded\n│\n│ Bot ab unke har message\n│ ka jawab dega! 🔥\n│\n╰───────────────⟡`,
            sent.messageID
        );
    }
};
