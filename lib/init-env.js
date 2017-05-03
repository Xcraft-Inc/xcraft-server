'use strict';

const fs = require ('fs');
const path = require ('path');

function generateConfigWatcher (overriderFile) {
  return overriderFile
    ? {
        [overriderFile]: fs.statSync (overriderFile).mtime,
      }
    : {};
}

function isInitialized (initializedFlagFile, xcraftConfigFilePath) {
  try {
    const content = fs.readFileSync (initializedFlagFile).toString ();
    const init = JSON.parse (content);
    return (
      init[xcraftConfigFilePath] === fs.statSync (xcraftConfigFilePath).mtime
    );
  } catch (ex) {
    return false;
  }
}

module.exports = (configPath, projectPath) => {
  const varDir = path.join (configPath, './var/');
  const xcraftEtcDir = path.join (configPath, './etc/xcraft/');
  const etcDir = path.join (configPath, './etc/');

  const serverConfigFilePath = path.join (
    etcDir,
    'xcraft-core-server',
    'config.json'
  );
  const initializedFlagFile = path.join (varDir, '.xcraft-server-initialized');
  const xcraftConfigFilePath = path.join (xcraftEtcDir, 'config.json');

  const initialized = isInitialized (initializedFlagFile, xcraftConfigFilePath);

  process.env.XCRAFT_ETC = etcDir;
  process.env.XCRAFT_ATTACH = 0;
  process.env.XCRAFT_LOGS = 1;

  if (!fs.existsSync (configPath)) {
    fs.mkdirSync (configPath);
  }

  if (!fs.existsSync (etcDir)) {
    fs.mkdirSync (etcDir);
  }

  if (!fs.existsSync (xcraftEtcDir)) {
    fs.mkdirSync (xcraftEtcDir);
  }

  if (!fs.existsSync (varDir)) {
    fs.mkdirSync (varDir);
  }

  const runDir = path.join (configPath, './var/run/');
  if (!fs.existsSync (runDir)) {
    fs.mkdirSync (runDir);
  }

  let overriderFile = path.join (projectPath, 'config.js');
  if (!fs.existsSync (overriderFile)) {
    overriderFile = null;
  }

  const nodeModulesDir = path.join (projectPath, './node_modules/');
  if (!initialized) {
    require ('xcraft-core-etc') ().createAll (
      nodeModulesDir,
      /^xcraft-(core|contrib)/,
      overriderFile
    );
  }

  const serverConfig = {
    userModulesPath: nodeModulesDir,
    userModulesFilter: '^(xcraft-(core|contrib)|goblin)-.*$',
  };

  fs.writeFileSync (
    serverConfigFilePath,
    JSON.stringify (serverConfig, null, 2)
  );

  const xcraftConfig = {
    xcraftRoot: configPath,
    pkgTargetRoot: configPath,
  };

  fs.writeFileSync (
    xcraftConfigFilePath,
    JSON.stringify (xcraftConfig, null, 2)
  );
  fs.writeFileSync (
    path.join (varDir, '.xcraft-server-initialized'),
    JSON.stringify (generateConfigWatcher (overriderFile), null, 2)
  );
};
