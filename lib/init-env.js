'use strict';

const fs = require('fs-extra');
const path = require('path');

function generateConfigWatcher(overriderFile) {
  return overriderFile
    ? {[overriderFile]: fs.statSync(overriderFile).mtime}
    : {};
}

function isInitialized(initializedFlagFile, xcraftConfigFilePath) {
  try {
    const content = fs.readFileSync(initializedFlagFile).toString();
    const init = JSON.parse(content);
    return (
      init[xcraftConfigFilePath] === fs.statSync(xcraftConfigFilePath).mtime
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

  if (!fs.existsSync(configPath)) {
    fs.ensureDirSync(configPath);
  }

  if (!fs.existsSync(etcDir)) {
    fs.ensureDirSync(etcDir);
  }

  if (!fs.existsSync(xcraftEtcDir)) {
    fs.ensureDirSync(xcraftEtcDir);
  }

  if (!fs.existsSync(varDir)) {
    fs.ensureDirSync(varDir);
  }

  const runDir = path.join(configPath, 'var/run');
  if (!fs.existsSync(runDir)) {
    fs.ensureDirSync(runDir);
  }

  let overriderFile = path.join(projectPath, 'config.js');
  if (!fs.existsSync(overriderFile)) {
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
  fs.writeFileSync(xcraftConfigFilePath, JSON.stringify(xcraftConfig, null, 2));

  if (!initialized) {
    const Etc = new (require('xcraft-core-etc').Etc)(configPath);
    [/^xcraft-(core|contrib)-/, /^goblin-/].forEach((filter) =>
      Etc.createAll(nodeModulesDir, filter, [overriderFile, overrider], appId)
    );
  }

  fs.writeFileSync(
    path.join(varDir, '.xcraft-server-initialized'),
    JSON.stringify(generateConfigWatcher(overriderFile), null, 2)
  );
};

module.exports = (configPath, projectPath, appId = null, overrider = null) => {
  process.env.XCRAFT_ROOT = configPath;
  process.env.XCRAFT_ATTACH = 0;
  process.env.XCRAFT_LOGS = 1;

  initEtc(configPath, projectPath, appId, overrider);
};

module.exports.initEtc = initEtc;
