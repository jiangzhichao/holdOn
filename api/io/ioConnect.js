/**
 * Created by jiang on 2017/3/6.
 */
import saveOffLineMsg from './saveOffLineMsg';
import sendOffLineMsg from './sendOffLineMsg';

export default function ioConnect(io, runnable) {

  let inlineSum = 0;
  io.on('connection', (socket) => {
    socket.on('name', (data) => {
      inlineSum++;
      const {_id, name} = data;
      sendOffLineMsg(_id)
        .then((doc) => {
          socket.emit('message', doc);
        }, (error) => {
          if (error) console.log(error);
        });
      socket.name = name;
      socket._id = _id;
      socket.broadcast.emit('addUser', {name, _id, id: socket.id});
      const sockets = io.sockets.sockets;
      socket.emit('userList', Object.keys(sockets).map((item) => {
        return {id: item, name: sockets[item]['name'], _id: sockets[item]._id};
      }));
      io.sockets.emit('info', {inlineSum});
    });

    socket.on('disconnect', () => {
      inlineSum--;
      io.sockets.emit('removeUser', {id: socket.id});
      io.sockets.emit('info', {inlineSum});
    });

    socket.on('message', (data) => {
      const {id} = data;
      const toSocket = io.sockets.sockets[id];
      if (toSocket) {
        toSocket.emit('message', data);
      } else {
        delete data.id;
        saveOffLineMsg(data);
      }
    });

  });
  io.listen(runnable);
}