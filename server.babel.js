var fs = require('fs');
var babelrc = fs.readFileSync('./.babelrc');
var config = null;

try {
  config = JSON.parse(babelrc);
} catch (err) {
  console.error('==>     ERROR: Error parsing your .babelrc.  :', err);
}

require('babel-register')(config);
