/**
 * Created by jiang on 2017/3/6.
 */
export default function ioConnect(io, runnable) {
  const bufferSize = 100;
  const messageBuffer = new Array(bufferSize);
  let messageIndex = 0;

  io.on('connection', (socket) => {
    socket.emit('info', 'socket connect success');
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

    socket.on('name', (data) => {
      socket.name = data.name;
      socket.userId = data.id;
      socket.broadcast.emit('addUser', {name: data.name, id: socket.id, userId: data.id});
      const sockets = io.sockets.sockets;
      socket.emit('userList', Object.keys(sockets).map((item) => {
        return {id: item, name: sockets[item]['name'], userId: sockets[item]['userId']};
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
        console.log('这个地方应该发送离线消息');
      }
    });

  });
  io.listen(runnable);
}