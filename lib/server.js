'use strict';

module.exports = (configPath, projectPath) => {
  if (!projectPath || !configPath) {
    throw new Error ('You must provide a config/project path for deploying the host');
  }

  require ('./init-env.js') (configPath, projectPath);

  return require ('xcraft-core-server').runAsLib ();
};
