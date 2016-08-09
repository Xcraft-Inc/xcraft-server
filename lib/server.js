'use strict';

const moduleName = 'xcraft-server';

module.exports = (configPath, projectPath) => {
  if (!projectPath || !configPath) {
    throw new Error ('You must provide a config/project path for deploying the host');
  }

  require ('./init-env.js') (configPath, projectPath);

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
