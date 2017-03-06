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
app.use(bodyParser.json());

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

const bufferSize = 100;
const messageBuffer = new Array(bufferSize);
let messageIndex = 0;

if (config.apiPort) {
  const runnable = app.listen(config.apiPort, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
    console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort);
  });

  const nameArr = [];
  io.on('connection', (socket) => {
    socket.emit('news', {msg: `'Hello World!' from server`});

    socket.on('history', () => {
      for (let index = 0; index < bufferSize; index++) {
        const msgNo = (messageIndex + index) % bufferSize;
        const msg = messageBuffer[msgNo];
        if (msg) {
          socket.emit('msg', msg);
        }
      }
    });

    socket.on('msg', (data) => {
      data.id = messageIndex;
      messageBuffer[messageIndex % bufferSize] = data;
      messageIndex++;
      io.emit('msg', data);
    });

    socket.on('name', function (data) {
      nameArr.push({name: data, id: socket.id});
      socket.broadcast.emit('addUser', {name: data, id: socket.id});
      socket.emit('nameList', nameArr);
      socket.emit('info', {name: data, id: socket.id});
    });

    socket.on('disconnect', function () {
      nameArr.forEach(function (item, index) {
        if (item.id === socket.id) nameArr.splice(index, 1);
      });
      io.sockets.emit('removeUser', {id: socket.id});
    });

    socket.on('message', function (data) {
      console.log(data);
      const id = data.id;
      io.sockets.sockets[id].emit('message', data);
    });

  });
  io.listen(runnable);
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
