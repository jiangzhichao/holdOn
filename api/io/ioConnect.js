/**
 * Created by jiang on 2017/3/6.
 */
import saveOffLineMsg from './saveOffLineMsg';
import sendOffLineMsg from './sendOffLineMsg';


export default function ioConnect(io, runnable) {

  io.on('connection', (socket) => {
    socket.emit('info', 'socket connect success');

    socket.on('name', (data) => {
      const {_id, name} = data;
      sendOffLineMsg(_id).then((doc) => {
        socket.emit('message', doc);
      });
      socket.name = name;
      socket._id = _id;
      socket.broadcast.emit('addUser', {name, _id, id: socket.id});
      const sockets = io.sockets.sockets;
      socket.emit('userList', Object.keys(sockets).map((item) => {
        return {id: item, name: sockets[item]['name'], _id: sockets[item]._id};
      }));
    });

    socket.on('disconnect', () => {
      io.sockets.emit('removeUser', {id: socket.id});
    });

    socket.on('message', (data) => {
      const {id} = data;
      const toSocket = io.sockets.sockets[id];
      if (toSocket) {
        toSocket.emit('message', data);
      } else {
        delete data.id;
        data.type = 'server';
        saveOffLineMsg(data);
      }
    });

  });
  io.listen(runnable);
}