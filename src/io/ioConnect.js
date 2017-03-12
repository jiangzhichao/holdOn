/**
 * Created by jiang on 2017/3/7.
 */
import io from 'socket.io-client';

export default function ioConnect() {
  return new Promise((resolve) => {
    const socket = io('', {path: '/ws'});
    socket.on('msg', (data) => {
      console.log(data);
    });

    socket.on('connect', () => {
      resolve(socket);
    });
  });
}
