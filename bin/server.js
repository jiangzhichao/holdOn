#!/usr/bin/env node

require('../server.babel');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false;  // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

if (__DEVELOPMENT__) {
  if (!require('piping')({hook: true, ignore: /(\/\.|~$|\.json|\.scss$)/i})) return;
}

// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
const WebpackIsomorphicTools = require('webpack-isomorphic-tools');
global.webpackIsomorphicTools = new WebpackIsomorphicTools(require('../webpack/webpack-isomorphic-tools'))
  .development(__DEVELOPMENT__)
  .server(rootDir, function () {
    require('../src/server');
  });
