import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import config from '../src/config';
import * as actions from './actions/index';
import resClear from './utils/resClear';
import http from 'http';
import SocketIo from 'socket.io';
import mongoose from 'mongoose';
import dbConfig from './config';
import ConnectMongo from 'connect-mongo';
import ioConnect from './io/ioConnect';

const app = express();
const server = new http.Server(app);
const io = new SocketIo(server);
const MongoStore = ConnectMongo(session);

io.path('/ws');

const {db, sessionDbConf, sessionDb} = dbConfig;
mongoose.connect(db);
app.use(session({...sessionDbConf, store: new MongoStore({url: sessionDb})}));

app.use(bodyParser.json({limit: '5mb'}));
app.use(resClear(actions));

if (config.apiPort) {
  const runnable = app.listen(config.apiPort, (err) => {
    if (err) console.error(err);
    console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
    console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort);
  });
  ioConnect(io, runnable);
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
