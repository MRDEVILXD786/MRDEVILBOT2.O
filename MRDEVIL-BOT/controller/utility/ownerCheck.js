// Shared owner verification utility -- used across events and commands

/**
 * Returns true if the given userID is listed in config.ADMINBOT
 */
function isOwner(userID, config) {
  const uid = String(userID);
  return !!config?.ADMINBOT?.map(String).includes(uid);
}

module.exports = { isOwner };
