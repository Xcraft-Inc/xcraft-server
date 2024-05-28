'use strict';

module.exports = (configPath, projectPath, afterInit, skipEnv = false) => {
  if (!projectPath || !configPath) {
    throw new Error(
      'You must provide a config/project path for deploying the host'
    );
  }

  if (!skipEnv) {
    require('./init-env.js')(configPath, projectPath);
  }

  if (afterInit) {
    afterInit();
  }

  return require('xcraft-core-server').runAsLib();
};
