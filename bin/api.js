#!/usr/bin/env node

//非生产模式下的热重载
if (process.env.NODE_ENV !== 'production') {
  if (!require('piping')({hook: true, ignore: /(\/\.|~$|\.json$)/i}))return;
}

require('../server.babel');
require('../api/api');
