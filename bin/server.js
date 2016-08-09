#!/usr/bin/env node
'use strict';

const moduleName = 'goblins';

require ('../lib/init-env.js');

const xLog = require ('xcraft-core-log') (moduleName);

const serverOptions = {
  detached: false,
  logs:     true,
  response: {
    log: xLog
  }
};

const xServer = require ('xcraft-core-server') (serverOptions);

xServer.start ((err) => {
  if (err) {
    xLog.err (err);
  }
});
