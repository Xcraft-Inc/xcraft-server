'use strict';

module.exports = (configPath, projectPath, afterInit) => {
  if (!projectPath || !configPath) {
    throw new Error(
      'You must provide a config/project path for deploying the host'
    );
  }

  require('./init-env.js')(configPath, projectPath);

  if (afterInit) {
    afterInit();
  }

  return require('xcraft-core-server').runAsLib();
};
