const fs = require('fs');
const path = require('path');

const START_FILE = path.join(__dirname, '../../bot_connect/start_time.json');

function getRealUptime() {
  try {
    const data = JSON.parse(fs.readFileSync(START_FILE, 'utf8'));
    if (data.startTime) return (Date.now() - data.startTime) / 1000;
  } catch {}
  return process.uptime();
}

module.exports = getRealUptime;
