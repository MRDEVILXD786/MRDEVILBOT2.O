const express = require('express'), fs = require('fs-extra'), path = require('path'), moment = require('moment-timezone'), logs = require('./controller/utility/logs'), publicPath = path.join(__dirname, 'public'), botConnectDir = path.join(__dirname, 'bot_connect'), appstatePath = path.join(botConnectDir, 'appstate.json'), cookiesPath = path.join(botConnectDir, 'cookies.txt');
let configFile = {};
try {
  configFile = require('./config.json');
} catch {
}
const PORT = process.env.PORT || configFile.PORT || 5000;
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
function startWebPanel({
  getApi: v16,
  getClient: v17,
  getConfig: v18,
  saveConfig: v19,
  loadConfig: v20,
  stopBot: v21,
  startBot: v22
}) {
  const v23 = express();
  v23.use(express.json()), v23.use((v24, v25, v26) => {
    v25.removeHeader('X-Frame-Options'), v25.setHeader('Content-Security-Policy', 'frame-ancestors *'), v26();
  }), v23.use(express.static(publicPath)), v23.get('/api/status', (v27, v28) => {
    const v29 = v16(), v30 = v17(), v31 = v18();
    let v32 = process.uptime();
    try {
      const v33 = JSON.parse(fs.readFileSync(path.join(__dirname, 'bot_connect/start_time.json'), 'utf8'));
      if (v33.startTime)
        v32 = (Date.now() - v33.startTime) / 1000;
    } catch {
    }
    const v34 = Math.floor(v32);
    let v35 = 0;
    try {
      const v36 = new Set();
      v30.commands.forEach(v37 => {
        if (v37.config?.name)
          v36.add(v37.config.name.toLowerCase());
      }), v35 = v36.size;
    } catch {
    }
    v28.json({
      'online': !!v29,
      'botName': v31.BOTNAME || 'MR DEVIL BOT',
      'prefix': v31.PREFIX || '.',
      'uptime': v34,
      'uptimeStr': Math.floor(v34 / 3600) + 'h ' + Math.floor(v34 % 3600 / 60) + 'm ' + Math.floor(v34 % 60) + 's',
      'commands': v35,
      'events': v30.events.size,
      'adminOnly': v31.ADMIN_ONLY_MODE || ![],
      'owner': 'MR DEVIL',
      'time': moment().tz(v31.TIMEZONE || 'Asia/Karachi').format('hh:mm:ss A DD/MM/YYYY')
    });
  }), v23.get('/api/config', (v38, v39) => {
    const v40 = v18();
    v39.json({
      'BOTNAME': v40.BOTNAME,
      'PREFIX': v40.PREFIX,
      'GLOBAL_COOLDOWN': v40.GLOBAL_COOLDOWN,
      'ADMIN_ONLY_MODE': v40.ADMIN_ONLY_MODE,
      'AUTO_ISLAMIC_POST': v40.AUTO_ISLAMIC_POST,
      'REACT_DELETE_EMOJI': v40.REACT_DELETE_EMOJI,
      'DISABLED_COMMANDS': v40.DISABLED_COMMANDS || [],
      'TIMEZONE': v40.TIMEZONE || 'Asia/Karachi'
    });
  }), v23.post('/api/config', (v41, v42) => {
    try {
      const v43 = v18(), v44 = [
          'BOTNAME',
          'PREFIX',
          'GLOBAL_COOLDOWN',
          'ADMIN_ONLY_MODE',
          'REACT_DELETE_EMOJI',
          'TIMEZONE'
        ];
      for (const [v45, v46] of Object.entries(v41.body)) {
        v44.includes(v45) && (v43[v45] = v46, global.config[v45] = v46);
      }
      v19(), v42.json({
        'success': !![],
        'message': 'Config updated!'
      });
    } catch (v47) {
      v42.json({
        'success': ![],
        'error': v47.message
      });
    }
  }), v23.get('/api/commands', (v48, v49) => {
    const v50 = v17(), v51 = v18(), v52 = [], v53 = new Set();
    v50.commands.forEach(v54 => {
      v54.config?.name && !v53.has(v54.config.name) && (v53.add(v54.config.name), v52.push({
        'name': v54.config.name,
        'description': v54.config.description || '',
        'category': v54.config.category || 'General',
        'aliases': v54.config.aliases || [],
        'disabled': (v51.DISABLED_COMMANDS || []).includes(v54.config.name)
      }));
    }), v49.json(v52);
  });
  const v55 = async () => {
    const v56 = require('./controller/system/database/models/threads'), v57 = await v56.getAll();
    return {
      'source': 'db',
      'total': v57.length,
      'threads': v57.map(v58 => ({
        'threadID': v58.id,
        'name': v58.name || 'Unknown',
        'members': v58.memberCount || '?',
        'isGroup': !![],
        'isBanned': v58.banned || ![],
        'isSpam': v58.settings?.spam || ![],
        'inDB': !![]
      }))
    };
  };
  v23.get('/api/threads', async (v59, v60) => {
    try {
      return v60.json(await v55());
    } catch (v61) {
      return v60.json({
        'source': 'db',
        'total': 0,
        'threads': []
      });
    }
  }), v23.post('/api/threads/sync', async (v62, v63) => {
    const v64 = v16();
    if (!v64)
      try {
        return v63.json({
          ...await v55(),
          'synced': 0
        });
      } catch {
        return v63.json({
          'source': 'db',
          'total': 0,
          'threads': [],
          'synced': 0
        });
      }
    const v65 = (v66, v67) => Promise.race([
      v66,
      new Promise((v68, v69) => setTimeout(() => v69(new Error('timeout')), v67))
    ]);
    let v70 = 0;
    try {
      const v71 = require('./controller/system/database/models/threads'), v72 = v64.getCurrentUserID(), v73 = [], v74 = new Set();
      for (const v75 of [
          'INBOX',
          'GROUP'
        ]) {
        try {
          const v76 = await v65(new Promise((v77, v78) => v64.getThreadList(50, null, [v75], (v79, v80) => v79 ? v78(v79) : v77(v80))), 8000);
          if (!v76?.length)
            continue;
          for (const v81 of v76.filter(v82 => v82.isGroup)) {
            !v74.has(v81.threadID) && (v74.add(v81.threadID), v73.push(v81));
          }
        } catch {
          continue;
        }
      }
      for (const v83 of v73) {
        try {
          const v84 = await v65(new Promise((v85, v86) => v64.getThreadInfo(v83.threadID, (v87, v88) => v87 ? v86(v87) : v85(v88))), 5000);
          if (v84 && v84.participantIDs?.includes(v72)) {
            const v89 = v84.participantIDs.length, v90 = v84.threadName || v84.name || v83.threadName || '', v91 = await v71.get(v83.threadID);
            if (!v91) {
              await v71.create(v83.threadID, v90);
              if (v89 > 0)
                await v71.update(v83.threadID, { 'memberCount': v89 });
            } else {
              const v92 = {};
              if (v90)
                v92.name = v90;
              if (v89 > 0)
                v92.memberCount = v89;
              if (Object.keys(v92).length)
                await v71.update(v83.threadID, v92);
            }
            v70++;
          }
        } catch {
          continue;
        }
      }
    } catch {
    }
    try {
      return v63.json({
        ...await v55(),
        'synced': v70,
        'source': 'facebook'
      });
    } catch {
      return v63.json({
        'source': 'db',
        'total': 0,
        'threads': [],
        'synced': v70
      });
    }
  }), v23.get('/api/users', async (v93, v94) => {
    try {
      const v95 = require('./controller/system/database/models/users'), v96 = require('./controller/system/database/models/currencies'), v97 = require('./controller/system/database/index'), v98 = await v95.getAll(), v99 = await v96.getTop ? await v97.findAll(v97.currencies) : [], v100 = await v97.findAll(v97.bank), v101 = {};
      v99.forEach(v102 => {
        v101[v102.id] = v102;
      });
      const v103 = {};
      v100.forEach(v104 => {
        v103[v104.userId] = v104;
      });
      const v105 = v98.map(v106 => {
        const v107 = v101[v106.id] || {}, v108 = v103[v106.id], v109 = (v107.balance || 0) > 0 || (v107.bank || 0) > 0, v110 = !!(v108 && v108.registration_step >= 1);
        return {
          ...v106,
          'balance': v107.balance || 0,
          'bankBalance': v107.bank || 0,
          'hasAccount': v110,
          'hasCoins': v109
        };
      });
      v94.json(v105.slice(0, 500));
    } catch {
      v94.json([]);
    }
  }), v23.get('/api/login-method', (v111, v112) => {
    const v113 = v18(), v114 = v113.LOGIN_METHOD || 'appstate';
    let v115 = ![], v116 = ![];
    try {
      const v117 = fs.readJsonSync(appstatePath);
      v115 = Array.isArray(v117) && v117.length > 0;
    } catch {
    }
    try {
      const v118 = fs.readFileSync(cookiesPath, 'utf-8'), v119 = parseCookiesTxt(v118);
      v116 = !!(v119 && v119.length > 0);
    } catch {
    }
    v112.json({
      'method': v114,
      'appstateOk': v115,
      'cookiesOk': v116
    });
  }), v23.post('/api/login-method', (v120, v121) => {
    try {
      const v122 = v18(), {method: v123} = v120.body;
      if (![
          'appstate',
          'cookies'
        ].includes(v123))
        return v121.json({
          'success': ![],
          'error': 'Method must be "appstate" or "cookies"'
        });
      v122.LOGIN_METHOD = v123, global.config.LOGIN_METHOD = v123, v19(), v121.json({
        'success': !![],
        'message': 'Login method "' + v123 + '" set! Bot restart ho raha hai...'
      }), setTimeout(() => {
        v21(), setTimeout(() => v22(), 2000);
      }, 500);
    } catch (v124) {
      v121.json({
        'success': ![],
        'error': v124.message
      });
    }
  }), v23.get('/api/appstate', (v125, v126) => {
    try {
      const v127 = fs.readJsonSync(appstatePath), v128 = Array.isArray(v127) && v127.length > 0;
      v126.json({
        'exists': v128,
        'count': v128 ? v127.length : 0,
        'data': v128 ? JSON.stringify(v127, null, 2) : null
      });
    } catch {
      v126.json({
        'exists': ![],
        'count': 0,
        'data': null
      });
    }
  }), v23.post('/api/appstate', async (v129, v130) => {
    try {
      const {appstate: v131} = v129.body;
      if (!v131)
        return v130.json({
          'success': ![],
          'error': 'No appstate provided'
        });
      let v132;
      try {
        v132 = typeof v131 === 'string' ? JSON.parse(v131) : v131;
      } catch {
        return v130.json({
          'success': ![],
          'error': 'Invalid JSON format'
        });
      }
      if (!Array.isArray(v132) || v132.length === 0)
        return v130.json({
          'success': ![],
          'error': 'Appstate must be a non-empty array'
        });
      fs.writeJsonSync(appstatePath, v132, { 'spaces': 2 }), v130.json({
        'success': !![],
        'message': 'Appstate save ho gaya! Bot restart ho raha hai...'
      }), setTimeout(() => {
        v21(), setTimeout(() => v22(), 2000);
      }, 500);
    } catch (v133) {
      v130.json({
        'success': ![],
        'error': v133.message
      });
    }
  }), v23.delete('/api/appstate', (v134, v135) => {
    try {
      fs.writeJsonSync(appstatePath, [], { 'spaces': 2 }), v135.json({
        'success': !![],
        'message': 'AppState clear ho gaya!'
      }), setTimeout(() => v21(), 500);
    } catch (v136) {
      v135.json({
        'success': ![],
        'error': v136.message
      });
    }
  }), v23.get('/api/cookies', (v137, v138) => {
    try {
      const v139 = fs.readFileSync(cookiesPath, 'utf-8'), v140 = parseCookiesTxt(v139), v141 = !!(v140 && v140.length > 0);
      v138.json({
        'exists': v141,
        'count': v141 ? v140.length : 0,
        'data': v139
      });
    } catch {
      v138.json({
        'exists': ![],
        'count': 0,
        'data': ''
      });
    }
  }), v23.post('/api/cookies', async (v142, v143) => {
    try {
      const {cookies: v144} = v142.body;
      if (!v144 || !v144.trim())
        return v143.json({
          'success': ![],
          'error': 'No cookies provided'
        });
      const v145 = parseCookiesTxt(v144);
      if (!v145 || v145.length === 0)
        return v143.json({
          'success': ![],
          'error': 'Cookies invalid ya empty hain! Sahi format paste karo.'
        });
      fs.writeFileSync(cookiesPath, v144, 'utf-8'), v143.json({
        'success': !![],
        'message': 'Cookies save ho gayi (' + v145.length + ' cookies)! Bot restart ho raha hai...'
      }), setTimeout(() => {
        v21(), setTimeout(() => v22(), 2000);
      }, 500);
    } catch (v146) {
      v143.json({
        'success': ![],
        'error': v146.message
      });
    }
  }), v23.delete('/api/cookies', (v147, v148) => {
    try {
      fs.writeFileSync(cookiesPath, '# Cookies cleared\n', 'utf-8'), v148.json({
        'success': !![],
        'message': 'Cookies clear ho gayi!'
      }), setTimeout(() => v21(), 500);
    } catch (v149) {
      v148.json({
        'success': ![],
        'error': v149.message
      });
    }
  }), v23.post('/api/bot/stop', (v150, v151) => {
    try {
      v151.json({
        'success': !![],
        'message': 'Bot band ho raha hai...'
      }), setTimeout(() => v21(), 500);
    } catch (v152) {
      v151.json({
        'success': ![],
        'error': v152.message
      });
    }
  }), v23.post('/api/bot/start', (v153, v154) => {
    try {
      v154.json({
        'success': !![],
        'message': 'Bot start ho raha hai...'
      }), setTimeout(() => v22(), 500);
    } catch (v155) {
      v154.json({
        'success': ![],
        'error': v155.message
      });
    }
  }), v23.post('/api/bot/restart', (v156, v157) => {
    try {
      v157.json({
        'success': !![],
        'message': 'Bot restart ho raha hai...'
      }), setTimeout(() => {
        v21(), setTimeout(() => v22(), 2500);
      }, 500);
    } catch (v158) {
      v157.json({
        'success': ![],
        'error': v158.message
      });
    }
  }), v23.get('/api/logs/history', (v159, v160) => {
    const v161 = Math.min(parseInt(v159.query.limit) || 200, 500), v162 = logs.getBuffer();
    v160.json(v162.slice(-v161));
  }), v23.get('/api/logs/stream', (v163, v164) => {
    v164.setHeader('Content-Type', 'text/event-stream'), v164.setHeader('Cache-Control', 'no-cache'), v164.setHeader('Connection', 'keep-alive'), v164.setHeader('X-Accel-Buffering', 'no'), v164.flushHeaders();
    const v165 = v166 => {
      try {
        v164.write('data: ' + JSON.stringify(v166) + '\n\n');
      } catch {
      }
    };
    v165({
      'type': 'connected',
      'title': 'SYS',
      'msg': 'Live log stream connected',
      'time': moment().tz('Asia/Karachi').format('hh:mm:ss A'),
      'ts': Date.now()
    }), logs.emitter.on('log', v165);
    const v167 = setInterval(() => {
      try {
        v164.write(': ping\n\n');
      } catch {
        clearInterval(v167);
      }
    }, 25000);
    v163.on('close', () => {
      clearInterval(v167), logs.emitter.off('log', v165);
    });
  });
  const v168 = v23.listen(PORT, '0.0.0.0', () => {
    const v169 = process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : null;
    logs.success('WEB_PANEL', 'Control Panel running on port ' + PORT), logs.success('WEB_PANEL', 'Local:   http://localhost:' + PORT);
    if (v169)
      logs.success('WEB_PANEL', 'Online:  ' + v169);
  });
  v168.keepAliveTimeout = 65000, v168.headersTimeout = 66000;
  const v170 = require('http'), v171 = 4 * 60 * 1000;
  function v172() {
    try {
      const v173 = v170.get('http://127.0.0.1:' + PORT + '/api/status', v174 => {
        v174.resume();
      });
      v173.on('error', () => {
      }), v173.setTimeout(10000, () => {
        v173.destroy();
      });
    } catch {
    }
  }
  setTimeout(() => {
    v172(), setInterval(v172, v171);
  }, 15000);
}
module.exports = { 'startWebPanel': startWebPanel };