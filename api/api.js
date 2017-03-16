import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import config from '../src/config';
import * as actions from './actions/index';
import {mapUrl} from 'utils/url.js';
import PrettyError from 'pretty-error';
import http from 'http';
import SocketIo from 'socket.io';
import mongoose from 'mongoose';
import dbConfig from './config';
import ConnectMongo from 'connect-mongo';
import ioConnect from './io/ioConnect';

const pretty = new PrettyError();
const app = express();
const server = new http.Server(app);
const io = new SocketIo(server);
const MongoStore = ConnectMongo(session);

io.path('/ws');
mongoose.connect(dbConfig.db);
app.use(session({
  secret: 'jzc rule!!!!',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000 * 60 * 60},
  store: new MongoStore({
    url: 'mongodb://localhost/jzc'
  })
}));
app.use(bodyParser.json({limit: '5mb'}));
app.use((req, res) => {
  const splittedUrlPath = req.url.split('?')[0].split('/').slice(1);
  const {action, params} = mapUrl(actions, splittedUrlPath);

  if (action) {
    action(req, params)
      .then((result) => {
        if (result instanceof Function) {
          result(res);
        } else {
          res.json(result);
        }
      }, (reason) => {
        if (reason && reason.redirect) {
          res.redirect(reason.redirect);
        } else {
          console.error('API ERROR:', pretty.render(reason));
          res.status(reason.status || 500).json(reason);
        }
      });
  } else {
    res.status(404).end('NOT FOUND');
  }
});


if (config.apiPort) {
  const runnable = app.listen(config.apiPort, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
    console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort);
  });
  ioConnect(io, runnable);
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
