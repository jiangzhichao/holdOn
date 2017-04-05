import mongoose from 'mongoose';
const Admin = mongoose.model('Admin');
const Message = mongoose.model('Message');
const File = mongoose.model('File');
import config from '../config';
import fs from 'fs';

export default function saveOnLineMsg(data) {

  return new Promise((resolve, reject) => {
    const {to, base, fileName, val, name, _id} = data;
    const msgData = {val, name, _id, to, fileName};

    function saveMsg() {
      const message = new Message();
      message.come = _id;
      message.to = to;
      message.msg = msgData;
      message.save((error) => {
        if (error) reject('存储message错误:' + error);
        resolve(msgData);
      });
    }

    if (base) {
      const baseStr = base.split(';base64,')[1];
      const buffer = new Buffer(baseStr, 'base64');
      const imagePath = `${config.uploadFolder}/${fileName}`;

      fs.writeFile(imagePath, buffer, (error) => {
        if (error) reject('文件写入失败:' + error);
        saveMsg();
      });
    } else {
      saveMsg();
    }

  });
}
