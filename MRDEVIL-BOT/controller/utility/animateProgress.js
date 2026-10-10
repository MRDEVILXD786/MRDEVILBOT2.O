/*
 * Animated Progress Bar Utility
 * MR DEVIL BOT v2
 * Usage: const { msgID, done } = await animateProgress(api, threadID, replyToMsgID, emoji, label, themeKey)
 *        // do image work ...
 *        await done;  // wait for 100% before sending result
 */

const FILLED = '■';
const EMPTY  = '□';
const TOTAL  = 10;
const DELAY  = 450;

const THEMES = require('./themes');

const DEFAULT_THEME = {
  top:    '╔══════════════╗',
  bottom: '╚══════════════╝',
  sep:    '══════════════',
  steps: [
    '🔄 Starting...',
    '📡 Connecting...',
    '🖼️  Loading...',
    '👤 Getting Pics...',
    '✂️  Processing...',
    '🎨 Designing...',
    '💫 Almost There...',
    '🖌️  Finishing Up...',
    '✅ Finalizing...',
    '🎉 Ready!'
  ]
};

function buildFrame(emoji, label, bar, pct, statusText, theme) {
  const b = FILLED.repeat(bar) + EMPTY.repeat(TOTAL - bar);
  return (
    `${theme.top}\n` +
    `${emoji} 𝗣𝗮𝗶𝗿 𝗕𝗮𝗻𝗮 𝗥𝗮𝗵𝗮 𝗛𝗮𝗶...\n` +
    `💞 ${label}\n` +
    `${theme.sep}\n` +
    `[${b}] ${pct}%\n` +
    `${statusText}\n` +
    `${theme.bottom}`
  );
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function animateProgress(api, threadID, replyToMessageID, emoji, label, themeKey) {
  const theme = (themeKey && THEMES[themeKey]) ? THEMES[themeKey] : DEFAULT_THEME;
  const steps = theme.steps;

  const firstFrame = buildFrame(emoji, label, 1, 10, steps[0], theme);

  const msgID = await new Promise((resolve) => {
    api.sendMessage(
      { body: firstFrame },
      threadID,
      (err, info) => resolve(err ? null : (info?.messageID || null)),
      replyToMessageID
    );
  });

  if (!msgID) return { msgID: null, done: Promise.resolve() };

  const done = (async () => {
    for (let i = 1; i < 10; i++) {
      await sleep(DELAY);
      const bar = i + 1;
      const pct = (i + 1) * 10;
      const statusText = steps[i] || steps[steps.length - 1];
      try {
        api.editMessage(buildFrame(emoji, label, bar, pct, statusText, theme), msgID, () => {});
      } catch {}
    }
  })();

  return { msgID, done };
}

module.exports = animateProgress;
