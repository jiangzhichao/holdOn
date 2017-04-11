/**
 * Created by isaac on 15/10/28.
 */
import path from 'path';

module.exports = {
  db           : 'mongodb://localhost/jzc',
  sessionDb    : 'mongodb://localhost/jzc',
  sessionDbConf: {secret: 'jzc rule!!!!', resave: false, saveUninitialized: false, cookie: {maxAge: 1000 * 60 * 60}},
  uploadFolder : path.join(__dirname, '../uploads')
};
