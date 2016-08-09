'use strict';

const shrew = require ('shrew');
const fs    = require ('fs');
const path  = require ('path');

const root = shrew ();

const varDir       = path.join (root, './var/');
const xcraftEtcDir = path.join (root, './etc/xcraft/');
const etcDir       = path.join (root, './etc/');

const serverConfigFilePath = path.join (etcDir, 'xcraft-core-server', 'config.json');
const initializedFlagFile  = path.join (varDir, '.xcraft-server-initialized');
const xcraftConfigFilePath = path.join (xcraftEtcDir, 'config.json');

const initialized = fs.existsSync (initializedFlagFile);

process.env.XCRAFT_ETC    = etcDir;
process.env.XCRAFT_ATTACH = 0;
process.env.XCRAFT_LOGS   = 1;

if (!fs.existsSync (etcDir)) {
  fs.mkdirSync (etcDir);
}


if (!fs.existsSync (xcraftEtcDir)) {
  fs.mkdirSync (xcraftEtcDir);
}

if (!fs.existsSync (varDir)) {
  fs.mkdirSync (varDir);
}

const runDir = path.join (root, './var/run/');
if (!fs.existsSync (runDir)) {
  fs.mkdirSync (runDir);
}

const nodeModulesDir = path.join (root, './node_modules/');
if (!initialized) {
  require ('xcraft-core-etc') ().createAll (nodeModulesDir, /^xcraft-(core|contrib)/);
}

const serverConfig = {
  userModulesPath: nodeModulesDir,
  userModulesFilter: '^goblin-.*$'
};

fs.writeFileSync (serverConfigFilePath, JSON.stringify (serverConfig, null, '  '));

const xcraftConfig = {
  xcraftRoot: root,
  pkgTargetRoot: root
};

fs.writeFileSync (xcraftConfigFilePath, JSON.stringify (xcraftConfig, null, '  '));
fs.writeFileSync (path.join (varDir, '.xcraft-server-initialized'), 'daboo!');
