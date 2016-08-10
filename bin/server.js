#!/usr/bin/env node
'use strict';

const root    = require ('shrew') ();
const xServer = require ('../server.js') (root, root);
xServer.start ((err) => {
  if (err) {
    xLog.err (err);
  }
});
