/**
 * Created by isaac on 2/21/16.
 */

import mongoose from 'mongoose';
const Admin = mongoose.model('Admin');

export default function register(req) {

  return new Promise((resolve, reject) => {

    const {name, password} = req.body;
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
          user.save((error) => {
            if (error) {
              reject({msg: error});
            } else {
              req.session.user = user;
              delete user.password;
              resolve({
                code: 1000,
                user: user,
              });
            }
          });
        }
      });
    } else {
      reject({msg: '缺少参数!'});
    }
  });
}
