const fs = require('fs-extra'), path = require('path'), logs = require('../../utility/logs');
function clearRequireCache(v1) {
  const v2 = require.resolve(v1);
  if (require.cache[v2]) {
    const v3 = require.cache[v2];
    v3.children?.forEach(v4 => {
      (v4.id.includes('MRDEVIL/commands') || v4.id.includes('MRDEVIL/events')) && delete require.cache[v4.id];
    }), delete require.cache[v2];
  }
}
async function loadCommands(v5, v6) {
  v5.commands.clear();
  let v7 = 0;
  try {
    const v8 = fs.readdirSync(v6).filter(v9 => v9.endsWith('.js'));
    for (const v10 of v8) {
      try {
        const v11 = path.join(v6, v10);
        clearRequireCache(v11);
        const v12 = require(v11);
        v12.config?.name && (v5.commands.set(v12.config.name.toLowerCase(), v12), v12.config.aliases?.forEach(v13 => v5.commands.set(v13.toLowerCase(), v12)), v7++, logs.success('COMMAND', 'Loaded: ' + v12.config.name));
      } catch (v14) {
        logs.error('COMMAND', 'Failed: ' + v10 + ' - ' + v14.message);
      }
    }
    return logs.info('REFRESH', 'Loaded ' + v7 + ' commands'), {
      'success': !![],
      'count': v7
    };
  } catch (v15) {
    return logs.error('REFRESH', v15.message), {
      'success': ![],
      'error': v15.message
    };
  }
}
async function loadEvents(v16, v17) {
  v16.events.clear();
  try {
    const v18 = fs.readdirSync(v17).filter(v19 => v19.endsWith('.js'));
    for (const v20 of v18) {
      try {
        const v21 = path.join(v17, v20);
        clearRequireCache(v21);
        const v22 = require(v21);
        v22.config?.name && (v16.events.set(v22.config.name.toLowerCase(), v22), logs.success('EVENT', 'Loaded: ' + v22.config.name));
      } catch (v23) {
        logs.error('EVENT', 'Failed: ' + v20 + ' - ' + v23.message);
      }
    }
    return logs.info('REFRESH', 'Loaded ' + v16.events.size + ' events'), {
      'success': !![],
      'count': v16.events.size
    };
  } catch (v24) {
    return logs.error('REFRESH', v24.message), {
      'success': ![],
      'error': v24.message
    };
  }
}
async function reloadEvent(v25, v26, v27) {
  try {
    const v28 = v27.toLowerCase();
    let v29 = path.join(v26, v28 + '.js');
    if (!fs.existsSync(v29)) {
      const v30 = fs.readdirSync(v26).filter(v31 => v31.endsWith('.js'));
      let v32 = ![];
      for (const v33 of v30) {
        const v34 = path.join(v26, v33);
        try {
          clearRequireCache(v34);
          const v35 = require(v34);
          if (v35.config?.name?.toLowerCase() === v28) {
            v29 = v34, v32 = !![];
            break;
          }
        } catch {
        }
      }
      if (!v32)
        return {
          'success': ![],
          'error': 'Event "' + v27 + '" not found'
        };
    }
    clearRequireCache(v29);
    const v36 = require(v29);
    if (v36.config?.name)
      return v25.events.delete(v36.config.name.toLowerCase()), v25.events.set(v36.config.name.toLowerCase(), v36), {
        'success': !![],
        'name': v36.config.name
      };
    return {
      'success': ![],
      'error': 'Invalid event structure'
    };
  } catch (v37) {
    return {
      'success': ![],
      'error': v37.message
    };
  }
}
async function loadNewCommand(v38, v39, v40) {
  try {
    const v41 = v40.toLowerCase(), v42 = path.join(v39, v41 + '.js');
    if (!fs.existsSync(v42))
      return {
        'success': ![],
        'error': 'File "' + v41 + '.js" not found'
      };
    clearRequireCache(v42);
    const v43 = require(v42);
    if (!v43.config?.name)
      return {
        'success': ![],
        'error': 'Invalid command structure'
      };
    return v38.commands.set(v43.config.name.toLowerCase(), v43), v43.config.aliases?.forEach(v44 => v38.commands.set(v44.toLowerCase(), v43)), {
      'success': !![],
      'name': v43.config.name
    };
  } catch (v45) {
    return {
      'success': ![],
      'error': v45.message
    };
  }
}
async function reloadCommand(v46, v47, v48) {
  try {
    const v49 = v48.toLowerCase();
    let v50 = path.join(v47, v49 + '.js');
    if (!fs.existsSync(v50)) {
      const v51 = fs.readdirSync(v47).filter(v52 => v52.endsWith('.js'));
      let v53 = ![];
      for (const v54 of v51) {
        const v55 = path.join(v47, v54);
        try {
          clearRequireCache(v55);
          const v56 = require(v55);
          if (v56.config?.name?.toLowerCase() === v49 || v56.config?.aliases?.map(v57 => v57.toLowerCase()).includes(v49)) {
            v50 = v55, v53 = !![];
            break;
          }
        } catch {
        }
      }
      if (!v53)
        return {
          'success': ![],
          'error': 'Command "' + v48 + '" not found'
        };
    }
    clearRequireCache(v50);
    const v58 = require(v50);
    if (v58.config?.name) {
      const v59 = [...v46.commands.entries()].filter(([v60, v61]) => v61.config?.name?.toLowerCase() === v58.config.name.toLowerCase()).map(([v62]) => v62);
      return v59.forEach(v63 => v46.commands.delete(v63)), v46.commands.set(v58.config.name.toLowerCase(), v58), v58.config.aliases?.forEach(v64 => v46.commands.set(v64.toLowerCase(), v58)), {
        'success': !![],
        'name': v58.config.name
      };
    }
    return {
      'success': ![],
      'error': 'Invalid command structure'
    };
  } catch (v65) {
    return {
      'success': ![],
      'error': v65.message
    };
  }
}
module.exports = {
  'loadCommands': loadCommands,
  'loadEvents': loadEvents,
  'reloadCommand': reloadCommand,
  'reloadEvent': reloadEvent,
  'loadNewCommand': loadNewCommand,
  'clearRequireCache': clearRequireCache
};