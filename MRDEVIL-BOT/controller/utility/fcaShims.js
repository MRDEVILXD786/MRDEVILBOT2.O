// Compatibility layer: adds functions that the bot commands use but
// the base mrdevil-fca does not ship. Missing features degrade gracefully.
module.exports = function applyShims(api) {
  const profileUrl = (uid) => 'https://www.facebook.com/' + uid;

  // keep a handle so api.stopListenMqtt() works
  if (typeof api.listenMqtt === 'function' && !api.__shimmedListen) {
    const orig = api.listenMqtt.bind(api);
    api.listenMqtt = function (cb) {
      const h = orig(cb);
      api.__stopHandle = h;
      return h;
    };
    api.__shimmedListen = true;
  }
  if (typeof api.stopListenMqtt !== 'function') {
    api.stopListenMqtt = function (cb) {
      const h = api.__stopHandle;
      try {
        if (typeof h === 'function') return h();
        if (h && typeof h.stopListening === 'function') return h.stopListening(cb);
        if (typeof api.stopListening === 'function') return api.stopListening(cb);
      } catch {}
    };
  }

  if (typeof api.shareContact !== 'function') {
    api.shareContact = function (text, uid, threadID, cb) {
      return api.sendMessage({ body: (text ? text + '\n' : '') + profileUrl(uid) }, threadID, cb);
    };
  }
  if (typeof api.shareLink !== 'function') {
    api.shareLink = function (text, url, threadID, cb) {
      return api.sendMessage({ body: text || '', url }, threadID, cb);
    };
  }
  if (typeof api.leaveThread !== 'function') {
    api.leaveThread = function (threadID, cb) {
      return api.removeUserFromGroup(api.getCurrentUserID(), threadID, cb);
    };
  }
  if (typeof api.editMessage !== 'function') {
    // Not supported by this FCA: silently ignore (commands wrap this in try/catch)
    api.editMessage = function (text, messageID, cb) {
      if (typeof cb === 'function') cb(null);
      return Promise.resolve();
    };
  }
  if (typeof api.getUID !== 'function') {
    api.getUID = function (input) {
      return new Promise((resolve, reject) => {
        const s = String(input || '').trim();
        if (/^\d{5,}$/.test(s)) return resolve(s);
        const m = s.match(/[?&]id=(\d+)/) || s.match(/facebook\.com\/(\d{5,})/);
        if (m) return resolve(m[1]);
        if (typeof api.getUserID === 'function') {
          const name = s.replace(/^https?:\/\/(www\.|m\.)?facebook\.com\//, '').replace(/\/$/, '');
          return api.getUserID(name, (err, data) => {
            if (err || !data || !data[0]) return reject(err || new Error('User not found'));
            resolve(data[0].userID);
          });
        }
        reject(new Error('Cannot resolve UID'));
      });
    };
  }
  // Not available in this FCA -> commands check typeof before use for these two:
  // api.addUserToFriend, api.getFriendRequests, api.changeAvatar stay undefined.
};
