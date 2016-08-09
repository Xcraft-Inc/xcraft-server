#!/usr/bin/env node
'use strict';
const xServer = require ('../server.js') (require ('shrew') ());
xServer.start ((err) => {
  if (err) {
    xLog.err (err);
  }
});
