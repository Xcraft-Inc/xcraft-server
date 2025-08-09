'use strict';

const fse = require('fs-extra');
const path = require('path');

function generateConfigWatcher(overriderFile) {
  return overriderFile
    ? {[overriderFile]: fse.statSync(overriderFile).mtime}
    : {};
}

function isInitialized(initializedFlagFile, xcraftConfigFilePath) {
  try {
    const init = fse.readJSONSync(initializedFlagFile);
    return (
      init[xcraftConfigFilePath] === fse.statSync(xcraftConfigFilePath).mtime
    );
  } catch (ex) {
    return false;
  }
}

const initEtc = (configPath, projectPath, appId = null, overrider = null) => {
  const xHost = require('xcraft-core-host');

  if (!appId) {
    appId = xHost.appId;
  }

  const varDir = path.join(configPath, 'var');
  const xcraftEtcDir = path.join(configPath, 'etc/xcraft');
  const etcDir = path.join(configPath, 'etc');

  const initializedFlagFile = path.join(varDir, '.xcraft-server-initialized');
  const xcraftConfigFilePath = path.join(xcraftEtcDir, 'config.json');

  const initialized = isInitialized(initializedFlagFile, xcraftConfigFilePath);

  if (!fse.existsSync(configPath)) {
    fse.ensureDirSync(configPath);
  }

  if (!fse.existsSync(etcDir)) {
    fse.ensureDirSync(etcDir);
  }

  if (!fse.existsSync(xcraftEtcDir)) {
    fse.ensureDirSync(xcraftEtcDir);
  }

  if (!fse.existsSync(varDir)) {
    fse.ensureDirSync(varDir);
  }

  const runDir = path.join(configPath, 'var/run');
  if (!fse.existsSync(runDir)) {
    fse.ensureDirSync(runDir);
  }

  let overriderFile = path.join(projectPath, 'config.js');
  if (!fse.existsSync(overriderFile)) {
    overriderFile = null;
  }

  const nodeModulesDir = path.join(projectPath, 'node_modules');

  const xcraftConfig = {
    xcraftRoot: configPath,
    pkgTargetRoot: configPath,
    path: process.env.PATH.split(path.delimiter),
  };

  /* Ensure to create the main config file before xEtc.createAll which depends
   * of this config.
   */
  fse.writeJSONSync(xcraftConfigFilePath, xcraftConfig);

  if (!initialized) {
    const Etc = new (require('xcraft-core-etc').Etc)(configPath);
    const overriders = [];
    if (overriderFile) {
      overriders.push(overriderFile);
    }
    if (overrider) {
      overriders.push(overrider);
    }
    [/^xcraft-(core|contrib)-/, /^goblin-/].forEach((filter) =>
      Etc.createAll(nodeModulesDir, filter, overriders, appId)
    );
  }

  fse.writeJSONSync(
    path.join(varDir, '.xcraft-server-initialized'),
    generateConfigWatcher(overriderFile)
  );
};

module.exports = (configPath, projectPath, appId = null, overrider = null) => {
  process.env.XCRAFT_ROOT = configPath;
  process.env.XCRAFT_ATTACH = 0;
  process.env.XCRAFT_LOGS = 1;

  initEtc(configPath, projectPath, appId, overrider);
};

module.exports.initEtc = initEtc;
