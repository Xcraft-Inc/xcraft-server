#!/usr/bin/env node
'use strict';

const moduleName = 'goblins';

require ('../lib/init-env.js');

const watt     = require ('watt');
const xLog     = require ('xcraft-core-log') (moduleName);

const serverOptions = {
  detached: false,
  logs:     true,
  response: {
    log: xLog
  }
};

const xServer   = require ('xcraft-core-server') (serverOptions);

const boot = watt (function * (next) {
  yield xServer.start (next);
});

boot ((err) => {
  if (err) {
    xLog.err (err);
  }
});
