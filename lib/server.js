'use strict';

const moduleName = 'goblins';

module.exports = (path) => {
  if (!path) {
    throw new Error ('You must provide a root path for deploying config');
  }

  require ('./init-env.js') (path);

  const xLog = require ('xcraft-core-log') (moduleName);

  const serverOptions = {
    detached: false,
    logs:     true,
    response: {
      log: xLog
    }
  };

  return require ('xcraft-core-server') (serverOptions);
};
