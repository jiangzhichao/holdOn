/**
 * Created by isaac on 2/21/16.
 */
import {decodeBase64Image, randomString} from '../../utils/util';
import config from '../../config';
import mongoose from 'mongoose';
import fs from 'fs';
const Admin = mongoose.model('Admin');
const File = mongoose.model('File');

export default function register(req) {

  return new Promise((resolve, reject) => {

    const {name, password, file} = req.body;
    if (name && password) {

      Admin.findOne({name}, (error, doc) => {
        if (doc) {
          reject({
            msg: '此昵称已经被占用了!'
          });
        } else {
          const user = new Admin();
          user.name = name;
          user.password = user.generateHash(password);
          if (file) {
            const buffer = decodeBase64Image(file);
            const imageName = `${randomString()}.${buffer.type.split('/')[1]}`;
            const imagePath = `${config.uploadFolder}/${imageName}`;

            fs.writeFile(imagePath, buffer.data, (err) => {
              if (err) {
                console.log(err);
              } else {
                const file = {};
                file.name = imageName;
                file.size = buffer.data.length;
                file.type = buffer.type.split('/')[1];
                file.path = imagePath;
                const avatarRecord = new File(file);
                user.avatar = avatarRecord._id;
                user.avatar_url = imageName;
                avatarRecord.save();
                user.save();
                delete user.password;
                req.session.user = user;
                resolve({
                  code: 1000,
                  user: user,
                });
              }
            });
          } else {
            user.save((error) => {
              if (error) {
                reject({msg: error});
              } else {
                delete user.password;
                req.session.user = user;
                resolve({
                  code: 1000,
                  user: user,
                });
              }
            });
          }
        }
      });
    } else {
      reject({msg: '缺少参数!'});
    }
  });
}
