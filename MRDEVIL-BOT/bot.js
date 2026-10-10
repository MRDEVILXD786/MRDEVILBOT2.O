const mrdevil_fca = require('./mrdevil-fca/index.js'), fs = require('fs-extra'), path = require('path'), cron = require('node-cron'), moment = require('moment-timezone'), {startWebPanel} = require('./server'), logs = require('./controller/utility/logs'), listen = require('./controller/system/listen'), {loadCommands, loadEvents} = require('./controller/system/handle/handleRefresh'), UsersController = require('./controller/system/controllers/users'), ThreadsController = require('./controller/system/controllers/threads'), CurrenciesController = require('./controller/system/controllers/currencies'), configPath = path.join(__dirname, 'config.json'), botConnectDir = path.join(__dirname, 'bot_connect'), appstatePath = path.join(__dirname, 'bot_connect/appstate.json'), cookiesPath = path.join(__dirname, 'bot_connect/cookies.txt'), commandsPath = path.join(__dirname, 'MRDEVIL/commands'), eventsPath = path.join(__dirname, 'MRDEVIL/events');
function parseCookiesTxt(v1) {
  const v2 = v1.split('\n').map(v3 => v3.trim()).filter(v4 => v4 && !v4.startsWith('#'));
  if (!v2.length)
    return null;
  const v5 = v2[0], v6 = v5.includes('	');
  if (v6) {
    const v7 = [];
    for (const v8 of v2) {
      const v9 = v8.split('	');
      v9.length >= 7 && v7.push({
        'key': v9[5].trim(),
        'value': v9[6].trim(),
        'domain': v9[0].trim().replace(/^\./, ''),
        'path': v9[2].trim(),
        'expires': parseInt(v9[4]) || 0,
        'secure': v9[3].trim().toUpperCase() === 'TRUE',
        'hostOnly': !v9[0].startsWith('.')
      });
    }
    return v7.length > 0 ? v7 : null;
  }
  const v10 = v2.join('; '), v11 = [];
  return v10.split(';').forEach(v12 => {
    const v13 = v12.indexOf('=');
    if (v13 === -1)
      return;
    const v14 = v12.slice(0, v13).trim(), v15 = v12.slice(v13 + 1).trim();
    if (v14)
      v11.push({
        'key': v14,
        'value': v15,
        'domain': 'facebook.com',
        'path': '/',
        'secure': !![]
      });
  }), v11.length > 0 ? v11 : null;
}
let config = {}, api = null, scheduledTasks = [], isStarting = ![], listenerCallback = null, client = {
    'commands': new Map(),
    'events': new Map(),
    'replies': new Map(),
    'cooldowns': new Map()
  };
process.on('unhandledRejection', v16 => {
  const v17 = v16?.message || String(v16);
  if (/EPIPE|ECONNRESET|ECONNREFUSED|socket hang up/i.test(v17))
    return;
  logs.error('UNHANDLED_REJECTION', v16?.stack || v17);
}), process.on('uncaughtException', v18 => {
  if (v18.code === 'EPIPE' || /EPIPE|ECONNRESET|write after end/i.test(v18.message))
    return;
  logs.error('UNCAUGHT_EXCEPTION', v18.stack || v18.message);
});
let keepAliveInterval = null;
function startKeepAlive() {
  if (keepAliveInterval)
    return;
  const v19 = require('axios'), v20 = process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN + '/api/status' : 'http://localhost:' + (process.env.PORT || 5000) + '/api/status';
  keepAliveInterval = setInterval(async () => {
    try {
      await v19.get(v20, { 'timeout': 10000 }), logs.info('KEEP_ALIVE', 'Self-ping OK');
    } catch {
    }
  }, 4 * 60 * 1000);
}
async function saveCurrentAppState(v21) {
  try {
    const v22 = v21.getAppState();
    if (!v22 || !v22.length)
      return;
    const v23 = (config.LOGIN_METHOD || 'appstate').toLowerCase();
    v23 === 'appstate' && (fs.writeJsonSync(appstatePath, v22, { 'spaces': 2 }), logs.success('SESSION', 'AppState auto-saved (session refreshed)'));
  } catch (v24) {
    logs.warn('SESSION', 'AppState save failed: ' + v24.message);
  }
}
async function cleanChatHistory() {
  try {
    const v25 = path.join(__dirname, 'MRDEVIL/commands/cache/chat_history.json');
    if (!fs.existsSync(v25))
      return;
    const v26 = await fs.readJson(v25), v27 = 500, v28 = 10, v29 = Object.keys(v26), v30 = {}, v31 = v29.slice(-v27);
    for (const v32 of v31) {
      v30[v32] = (v26[v32] || []).slice(-v28);
    }
    await fs.writeJson(v25, v30, { 'spaces': 2 }), logs.success('CLEANUP', 'Chat history cleaned: ' + v29.length + ' → ' + v31.length + ' users');
  } catch {
  }
}
function isSessionExpiredError(v33) {
  const v34 = (v33?.message || v33?.error || String(v33)).toLowerCase();
  return v34.includes('login') || v34.includes('checkpoint') || v34.includes('suspended') || v34.includes('disabled') || v34.includes('appstate') || v34.includes('not-logged-in') || v34.includes('auth') || v34.includes('session');
}
let reconnectDelay = 3000;
const MAX_RECONNECT_DELAY = 5 * 60 * 1000;
let lastMqttEventTime = Date.now();
function loadConfig() {
  try {
    config = fs.readJsonSync(configPath);
    if (!Array.isArray(config.ADMINBOT))
      config.ADMINBOT = [];
    global.config = config;
  } catch {
    config = {
      'BOTNAME': 'MR DEVIL BOT',
      'PREFIX': '.',
      'ADMINBOT': [],
      'TIMEZONE': 'Asia/Karachi',
      'PREFIX_ENABLED': !![],
      'REACT_DELETE_EMOJI': '😡'
    }, global.config = config;
  }
}
function saveConfig() {
  try {
    fs.writeJsonSync(configPath, config, { 'spaces': 2 });
  } catch (v39) {
    logs.error('CONFIG', v39.message);
  }
}
function stopSchedulers() {
  scheduledTasks.forEach(v40 => {
    try {
      v40.stop();
    } catch {
    }
  }), scheduledTasks = [];
}
function setupSchedulers() {
  stopSchedulers();
  const v41 = config.TIMEZONE || 'Asia/Karachi', v42 = cron.schedule('0 */6 * * *', async () => {
      logs.info('SCHEDULER', 'Auto cache clear...');
      try {
        const v43 = path.join(__dirname, 'MRDEVIL/commands/cache'), v44 = ['rankup'];
        if (fs.existsSync(v43)) {
          const v45 = [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.mp3',
            '.mp4',
            '.webp',
            '.wav'
          ];
          let v46 = 0;
          function v47(v48) {
            fs.readdirSync(v48).forEach(v49 => {
              const v50 = path.join(v48, v49);
              if (fs.statSync(v50).isDirectory()) {
                if (!v44.includes(v49))
                  v47(v50);
              } else {
                if (v45.includes(path.extname(v49).toLowerCase()))
                  try {
                    fs.unlinkSync(v50), v46++;
                  } catch {
                  }
              }
            });
          }
          v47(v43), logs.success('CACHE', 'Cleared ' + v46 + ' temp files');
        }
      } catch (v51) {
        logs.error('CACHE', v51.message);
      }
    }, { 'timezone': v41 });
  scheduledTasks.push(v42);
  const v52 = cron.schedule('0 0 * * *', async () => {
    logs.info('SCHEDULER', 'Midnight reset starting...');
    if (global.Currencies) {
      const v53 = await global.Currencies.dailyMidnightReset();
      if (v53.success)
        logs.success('MIDNIGHT', v53.message);
      const v54 = await global.Currencies.midnightCoinsReset();
      if (v54.success)
        logs.success('MIDNIGHT', v54.message);
      else
        logs.error('MIDNIGHT', v54.error);
    }
  }, { 'timezone': v41 });
  scheduledTasks.push(v52);
  const v55 = cron.schedule('*/5 * * * *', async () => {
    if (api)
      try {
        api.getUserInfo(api.getCurrentUserID(), v56 => {
          if (!v56)
            logs.info('HEARTBEAT', 'Connection active');
        });
      } catch {
      }
  }, { 'timezone': v41 });
  scheduledTasks.push(v55);
  const v57 = cron.schedule('*/2 * * * *', async () => {
    const v58 = Date.now() - lastMqttEventTime, v59 = Math.floor(v58 / 60000), v60 = 10 * 60 * 1000;
    v58 > v60 ? (logs.warn('WATCHDOG', 'MQTT silent for ' + v59 + ' min — connection frozen! Force restarting...'), lastMqttEventTime = Date.now(), setTimeout(() => process.exit(1), 1000)) : logs.info('WATCHDOG', 'MQTT OK — last event ' + v59 + 'm ago');
  }, { 'timezone': v41 });
  scheduledTasks.push(v57);
  const v61 = cron.schedule('*/15 * * * *', () => {
    const v62 = Date.now();
    let v63 = 0;
    for (const [v64, v65] of client.cooldowns) {
      v62 - v65 > 30000 && (client.cooldowns.delete(v64), v63++);
    }
    let v66 = 0;
    client.replies.size > 300 && (v66 = client.replies.size, client.replies.clear());
    const v67 = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    logs.info('CLEANUP', 'RAM: ' + v67 + 'MB | Cooldowns cleared: ' + v63 + ' | Replies cleared: ' + v66);
  }, { 'timezone': v41 });
  scheduledTasks.push(v61);
  const v70 = cron.schedule('0 */12 * * *', async () => {
    await cleanChatHistory();
  }, { 'timezone': v41 });
  scheduledTasks.push(v70);
  const v71 = cron.schedule('*/30 * * * *', async () => {
    if (api)
      await saveCurrentAppState(api);
  }, { 'timezone': v41 });
  scheduledTasks.push(v71);
  const {setupIslamicScheduler: v72} = require('./MRDEVIL/commands/islamicscheduler');
  v72(() => api, config, scheduledTasks);
  const v73 = cron.schedule('5 * * * *', async () => {
    const v74 = require('moment-timezone'), v75 = v74().tz(v41).format('hh:mm A'), v76 = config.NOTIFY_TID;
    logs.info('AUTO_RESTART', 'Hourly auto-restart triggered at ' + v75);
    try {
      api && v76 && await new Promise(v77 => {
        api.sendMessage('🔄 *AUTO RESTART*\n\n⏰ Time: ' + v75 + '\n✅ Bot har ghante baad khud restart hota hai.\n🤖 MR DEVIL BOT ab dobara online ho raha hai...', v76, () => v77());
      });
    } catch (v78) {
      logs.error('AUTO_RESTART', 'Failed to send restart msg: ' + v78.message);
    }
    setTimeout(() => process.exit(1), 2000);
  }, { 'timezone': v41 });
  scheduledTasks.push(v73), logs.success('SCHEDULER', 'All schedulers started');
}
async function startBot() {
  if (isStarting)
    return;
  api && (stopBot(), await new Promise(v83 => setTimeout(v83, 2000)));
  isStarting = !![], logs.banner(), loadConfig();
  try {
    const v84 = (config.LOGIN_METHOD || 'appstate').toLowerCase();
    let v85 = null;
    if (v84 === 'cookies') {
      logs.info('BOT', 'Login method: COOKIES (cookies.txt)');
      try {
        const v86 = fs.readFileSync(cookiesPath, 'utf-8'), v87 = parseCookiesTxt(v86);
        if (!v87 || v87.length === 0) {
          logs.error('COOKIES', 'cookies.txt is empty or invalid! Please add your Facebook cookies.'), isStarting = ![];
          return;
        }
        v85 = { 'appState': v87 }, logs.success('COOKIES', 'Loaded ' + v87.length + ' cookies from cookies.txt');
      } catch (v88) {
        logs.error('COOKIES', 'Cannot read cookies.txt: ' + v88.message), isStarting = ![];
        return;
      }
    } else {
      logs.info('BOT', 'Login method: APPSTATE (appstate.json)');
      try {
        const v89 = fs.readJsonSync(appstatePath);
        if (!Array.isArray(v89) || v89.length === 0) {
          logs.error('APPSTATE', 'appstate.json is empty! Please add your Facebook appstate.'), isStarting = ![];
          return;
        }
        v85 = { 'appState': v89 }, logs.success('APPSTATE', 'Loaded ' + v89.length + ' cookies from appstate.json');
      } catch (v90) {
        logs.error('APPSTATE', 'Cannot read appstate.json: ' + v90.message), isStarting = ![];
        return;
      }
    }
    logs.info('BOT', 'Starting ' + config.BOTNAME + '...'), logs.info('BOT', 'Timezone: ' + (config.TIMEZONE || 'Asia/Karachi')), logs.info('BOT', 'Prefix: ' + (config.PREFIX || '.')), mrdevil_fca(v85, {
      'autoMarkDelivery': ![],
      'autoMarkRead': ![],
      'listenEvents': !![],
      'selfListen': ![],
      'online': !![],
      'logLevel': 'warn'
    }, async (v91, v92) => {
      if (v91) {
        const v93 = v91.message || String(v91);
        logs.error('LOGIN', 'Failed: ' + v93), isStarting = ![];
        isSessionExpiredError(v91) ? (logs.error('SESSION', '⚠️ Session expired or account suspended! Update your cookies/appstate. Bot will pause for 10 minutes.'), setTimeout(() => startBot(), 10 * 60 * 1000)) : (setTimeout(() => startBot(), reconnectDelay), reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY));
        return;
      }
      reconnectDelay = 3000, api = v92, isStarting = ![], require('./controller/utility/fcaShims')(api), global.api = api, global.startTime = Date.now(), api.setOptions({
        'listenEvents': !![],
        'selfListen': ![],
        'autoMarkRead': ![],
        'autoMarkDelivery': ![],
        'online': !![],
        'logLevel': 'warn',
        'updatePresence': !![]
      }), logs.success('LOGIN', 'Logged in successfully!'), await saveCurrentAppState(v92);
      const v94 = new UsersController(api), v95 = new ThreadsController(api), v96 = new CurrenciesController(api);
      global.Users = v94, global.Threads = v95, global.Currencies = v96, await loadCommands(client, commandsPath), await loadEvents(client, eventsPath), global.client = client;
      for (const [v97, v98] of client.events) {
        const v99 = Array.isArray(v98.config?.eventType) ? v98.config.eventType : [v98.config?.eventType];
        if (v99.includes('onload'))
          try {
            v98.run({
              'api': api,
              'client': client,
              'Users': v94,
              'Threads': v95,
              'Currencies': v96,
              'config': config,
              'event': { 'type': 'onload' }
            });
          } catch {
          }
      }
      setupSchedulers(), startKeepAlive(), setTimeout(async () => {
        const v100 = config.NOTIFY_TID;
        if (!v100)
          return;
        try {
          let v101 = process.uptime();
          try {
            const v102 = JSON.parse(fs.readFileSync(path.join(__dirname, 'bot_connect/start_time.json'), 'utf8'));
            if (v102.startTime)
              v101 = (Date.now() - v102.startTime) / 1000;
          } catch {
          }
          const v103 = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1), v104 = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm:ss A | DD/MM/YYYY');
          let v105 = 0;
          const v106 = new Set();
          client.commands.forEach(v107 => {
            if (v107.config?.name)
              v106.add(v107.config.name.toLowerCase());
          }), v105 = v106.size, await api.sendMessage('╭─── « 🟢 BOT ONLINE » ───⟡\n│\n│ ✅ Bot Online aa gaya!\n│\n│ ◈ 🤖 Bot    : ' + (config.BOTNAME || 'MR DEVIL BOT') + '\n│ ◈ ⏰ Uptime  : ' + Math.floor(v101 / 3600) + 'h ' + Math.floor(v101 % 3600 / 60) + 'm\n│ ◈ 💾 RAM     : ' + v103 + ' MB\n│ ◈ 📂 Cmds    : ' + v105 + '\n│ ◈ 🕐 Time    : ' + v104 + '\n│ ◈ 🌐 Status  : 🟢 ONLINE\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡', v100);
        } catch {
        }
      }, 4000);
      let v108 = 0;
      const v109 = new Set();
      client.commands.forEach(v110 => {
        if (v110.config?.name)
          v109.add(v110.config.name.toLowerCase());
      }), v108 = v109.size;
      const v111 = listen({
        'api': api,
        'client': client,
        'Users': v94,
        'Threads': v95,
        'Currencies': v96,
        'config': config
      });
      let v112 = 0, v113 = ![];
      const v114 = 10, v115 = [
          'ECONNRESET',
          'ECONNREFUSED',
          'ENOTFOUND',
          'Keepalive timeout',
          'read ECONNRESET'
        ], v116 = [
          'ETIMEDOUT',
          'read ETIMEDOUT',
          'setReaction',
          'setMessageReaction'
        ], v117 = async v118 => {
          if (v113)
            return;
          v113 = !![], logs.warn('BOT', 'Reconnecting due to: ' + v118 + ' (retry in ' + Math.round(reconnectDelay / 1000) + 's)'), await new Promise(v119 => setTimeout(v119, reconnectDelay)), reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY), stopBot(), await new Promise(v120 => setTimeout(v120, 1000)), v113 = ![], startBot();
        }, v121 = async (v122, v123) => {
          if (!v121.active)
            return;
          if (v122) {
            const v124 = v122.message || v122.error || String(v122), v125 = v122.code || v124, v126 = v116.some(v127 => v125.includes(v127) || v124.includes(v127));
            if (v126)
              return;
            logs.error('MQTT', v125 + ': ' + v124);
            const v128 = v115.some(v129 => v125.includes(v129) || v124.includes(v129));
            if (v128) {
              v117(v125);
              return;
            }
            v112++;
            v112 >= v114 && (v112 = 0, v117(v114 + ' errors accumulated'));
            return;
          }
          v123 && (v112 = 0, lastMqttEventTime = Date.now());
          if (v123?.type === 'message') {
            const v130 = Date.now(), v131 = (config.GLOBAL_COOLDOWN || 3) * 1000, v132 = client.cooldowns.get('g_' + v123.senderID) || 0;
            if (v130 - v132 < v131)
              return;
            client.cooldowns.set('g_' + v123.senderID, v130);
          }
          try {
            return v111(v122, v123);
          } catch (v133) {
            logs.error('LISTENER', v133.message);
          }
        };
      v121.active = !![], listenerCallback = v121, logs.info('BOT', 'Attaching MQTT listener...'), api.listenMqtt(v121), logs.success('BOT', config.BOTNAME + ' is now ONLINE!'), logs.info('BOT', 'Commands: ' + v108 + ' | Events: ' + client.events.size + ' | Prefix: ' + config.PREFIX);
    });
  } catch (v136) {
    logs.error('START', v136.message), isStarting = ![];
  }
}
function stopBot() {
  stopSchedulers(), client.cooldowns.clear(), client.replies.clear();
  listenerCallback && (listenerCallback.active = ![], listenerCallback = null);
  if (api) {
    logs.info('BOT', 'Stopping MQTT...');
    try {
      api.stopListenMqtt();
    } catch {
    }
    api = null, global.api = null, logs.success('BOT', 'Bot stopped.');
  }
  isStarting = ![];
}
module.exports = {
  'startBot': startBot,
  'stopBot': stopBot,
  'getApi': () => api,
  'getClient': () => client,
  'getConfig': () => config,
  'saveConfig': saveConfig,
  'loadConfig': loadConfig
};
require.main === module && (startWebPanel({
  'getApi': () => api,
  'getClient': () => client,
  'getConfig': () => config,
  'saveConfig': saveConfig,
  'loadConfig': loadConfig,
  'stopBot': stopBot,
  'startBot': startBot
}), startBot());