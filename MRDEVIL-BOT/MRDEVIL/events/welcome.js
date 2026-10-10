const axios = require('axios');
const moment = require('moment-timezone');

const GIF_URLS = [
    'https://i.ibb.co/WWRt2Vsy/2b3439f71d76.gif',
    'https://i.ibb.co/nNK2TX75/dc82e95aba67.gif',
    'https://i.ibb.co/tMK00Qct/a008ff0dca24.gif'
];

async function fetchGifStream() {
    const url = GIF_URLS[Math.floor(Math.random() * GIF_URLS.length)];
    try {
        const res = await axios.get(url, { responseType: 'stream', timeout: 12000 });
        return res.data;
    } catch {
        return null;
    }
}

module.exports = {
    config: {
        credits: "MR DEVIL",
        name: 'welcome',
        eventType: 'log:subscribe',
        description: 'Welcome new members with stylish animated message'
    },

    async run({ api, event, Users, Threads, config }) {
        const { threadID, logMessageData } = event;
        const addedParticipants = logMessageData?.addedParticipants || [];
        const botID = api.getCurrentUserID();

        const settings = await Threads.getSettings(threadID).catch(() => ({}));
        if (settings?.antijoin) {
            for (const p of addedParticipants) {
                if (String(p.userFbId) === String(botID)) continue;
                api.removeUserFromGroup(p.userFbId, threadID).catch(() => {});
            }
            return;
        }

        const newMembers = addedParticipants.filter(p => String(p.userFbId) !== String(botID));
        if (!newMembers.length) return;

        const adminBots = (config.ADMINBOT || []).map(String);
        const joinTime = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm:ss A');
        const joinDate = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('DD/MM/YYYY');

        // ── Owner welcome ──────────────────────────────────────────
        for (const member of newMembers.filter(m => adminBots.includes(String(m.userFbId)))) {
            const name = member.fullName || 'Owner';
            Users.create(member.userFbId, name).catch(() => {});
            const gifStream = await fetchGifStream();
            const ownerMsg =
                `╭──〔❨✧✧❩〕──╮\n` +
                `  ✨ 𝐌𝐀𝐀𝐋𝐈𝐊 𝐀𝐀𝐆𝐀𝐘𝐄 ✨  \n` +
                `╰──〔❨✧✧❩〕──╯\n\n` +
                `👑 Assalam o Alaikum Owner! 👑\n` +
                `${'꘏'.repeat(18)}\n\n` +
                `🌹 ꧁ ${name} ꧂ 🌹\n\n` +
                `🤖 Aapka Bot intezaar kar raha tha!\n` +
                `💖 Khush Aamdeed Maalik!\n\n` +
                `${'꘏'.repeat(18)}\n` +
                `📊 Stats: 📅 ${joinDate} | 🕐 ${joinTime}\n\n` +
                `💡 Try: ${config.PREFIX}help\n` +
                `🎉 Enjoy your stay! 🎉`;
            try {
                if (gifStream) {
                    await api.sendMessage({ body: ownerMsg, attachment: gifStream }, threadID);
                } else {
                    await api.sendMessage(ownerMsg, threadID);
                }
            } catch {
                try { await api.sendMessage(ownerMsg, threadID); } catch {}
            }
        }

        // ── Regular members welcome ────────────────────────────────
        const regularMembers = newMembers.filter(m => !adminBots.includes(String(m.userFbId)));
        if (!regularMembers.length) return;

        const gifStream = await fetchGifStream();

        let welcomeMsg =
            `╭──〔❨✧✧❩〕──╮\n` +
            `  ✨ 𝐀𝐃𝐃 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 ✨  \n` +
            `╰──〔❨✧✧❩〕──╯\n\n`;

        welcomeMsg += `🎊 New Member Alert 🎊\n${'⫘⫘'.repeat(5)}\n`;

        for (let i = 0; i < regularMembers.length; i++) {
            const member = regularMembers[i];
            const name = member.fullName || 'Amazing Member';
            welcomeMsg += `👑 ${i + 1}. ${name}\n`;
            Users.create(member.userFbId, name).catch(() => {});
        }

        welcomeMsg +=
            `\n${'꘏'.repeat(18)}\n` +
            `📊 Stats: 📅 ${joinDate} | 🕐 ${joinTime}\n\n` +
            `💡 Try: ${config.PREFIX}help\n` +
            `🎉 Enjoy your stay! 🎉`;

        try {
            if (gifStream) {
                await api.sendMessage({ body: welcomeMsg, attachment: gifStream }, threadID);
            } else {
                await api.sendMessage(welcomeMsg, threadID);
            }
        } catch {
            try { await api.sendMessage(welcomeMsg, threadID); } catch {}
        }
    }
};
