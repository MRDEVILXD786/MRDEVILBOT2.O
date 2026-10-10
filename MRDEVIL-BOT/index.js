const {spawn} = require('child_process'), chalk = require('chalk'), moment = require('moment-timezone'), fs = require('fs'), BOT_SCRIPT = 'bot.js', RESTART_DELAY = 2000, MAX_RESTARTS_FAST = 10, FAST_RESTART_WINDOW = 60000, START_TIME_FILE = __dirname + '/bot_connect/start_time.json';
let restartCount = 0, lastRestartTime = Date.now();
try {
  fs.mkdirSync(__dirname + '/bot_connect', { 'recursive': !![] }), fs.writeFileSync(START_TIME_FILE, JSON.stringify({ 'startTime': Date.now() }));
} catch {
}
function getTime() {
  return moment().tz('Asia/Karachi').format('hh:mm:ss A');
}
function log(v1, v2) {
  const v3 = getTime(), v4 = {
      'INFO': () => console.log(chalk.cyan('[' + v3 + '] [INFO] ') + chalk.white(v2)),
      'SUCCESS': () => console.log(chalk.green('[' + v3 + '] [OK]   ') + chalk.greenBright(v2)),
      'WARN': () => console.log(chalk.yellow('[' + v3 + '] [WARN] ') + chalk.yellowBright(v2)),
      'ERROR': () => console.log(chalk.red('[' + v3 + '] [ERR]  ') + chalk.redBright(v2)),
      'SYSTEM': () => console.log(chalk.magenta('[' + v3 + '] [SYS]  ') + chalk.magentaBright(v2))
    };
  (v4[v1] || v4.INFO)();
}
function showBanner() {
  console.clear(), console.log(chalk.hex('#FF4D4D').bold(' ╔══════════════════════════╗')), console.log(chalk.hex('#FF6B6B').bold(' ║  ★ MR DEVIL  BOT ★   ║')), console.log(chalk.hex('#FF8E8E').bold(' ║  ─────────────────────  ║')), console.log(chalk.hex('#FF4D4D').bold(' ║  MRDEVIL-FCA v2  |  Node.js ║')), console.log(chalk.hex('#CC0000').bold(' ╚══════════════════════════╝')), console.log(chalk.dim(' ──────────────────────────')), console.log(chalk.gray(' Owner  : ') + chalk.white.bold('MR DEVIL')), console.log(chalk.gray(' System : ') + chalk.white(process.platform + ' | Node ' + process.version)), console.log(chalk.gray(' FCA    : ') + chalk.white.bold('mrdevil-fca v2')), console.log(chalk.dim(' ──────────────────────────\n'));
}
function start() {
  if (Date.now() - lastRestartTime > FAST_RESTART_WINDOW)
    restartCount = 0;
  lastRestartTime = Date.now(), log('SYSTEM', 'Starting MR DEVIL Bot Process...');
  try {
    require.resolve('./' + BOT_SCRIPT);
  } catch (v5) {
    log('ERROR', BOT_SCRIPT + ' not found!');
    return;
  }
  const v6 = spawn('node', [BOT_SCRIPT], {
    'stdio': 'inherit',
    'shell': !![],
    'cwd': __dirname
  });
  v6.on('error', v7 => log('ERROR', 'Process error: ' + v7.message)), v6.on('close', v8 => {
    if (v8 === null)
      log('WARN', 'Bot killed via signal.'), process.exit(0);
    else
      v8 === 0 ? (log('SUCCESS', 'Bot stopped cleanly.'), process.exit(0)) : (restartCount++, restartCount > MAX_RESTARTS_FAST ? (log('ERROR', 'Too many restarts (' + restartCount + '). Pausing 30s...'), setTimeout(start, 30000)) : (log('WARN', 'Bot crashed (code: ' + v8 + '). Restarting in ' + RESTART_DELAY / 1000 + 's...'), setTimeout(start, RESTART_DELAY)));
  });
}
showBanner(), log('SYSTEM', 'Initializing MR DEVIL Bot Controller...'), start();