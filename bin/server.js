#!/usr/bin/env node
'use strict';

require ('../lib/init-env.js');
const moduleName = 'goblins';

const path     = require ('path');
const xLog     = require ('xcraft-core-log') (moduleName);
const serverOptions = {
  detached: false,
  logs:     true,
  response: {
    log: xLog
  }
};

const xServer = require ('xcraft-core-server') (serverOptions);
const busClient = require ('xcraft-core-busclient').initGlobal ();
const boot = watt (function * (next) {
  try {
    xServer.start ();
    yield busClient.connect (null, next);
    xLog.info (`Server started and connected with ${busClient.getOrcName ()}`);
  } catch (err) {
    xLog.err (err);
  }
});

boot ();
