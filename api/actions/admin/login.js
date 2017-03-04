import mongoose from 'mongoose';
const Admin = mongoose.model('Admin');

export default function login(req) {

  return new Promise((resolve, reject) => {
    const name = req.body.name;
    const password = req.body.password;
    Admin.findOne({name})
      .exec((error, doc) => {
        if (error) {
          console.log(error);
          reject({msg: '登陆失败!'});
        } else {
          if (doc) {
            if (doc.validPassword(password)) {
              doc.password = null;
              req.session.user = doc;
              resolve({
                code: 1000,
                user: doc,
              });
            } else {
              reject({msg: '密码错误'});
            }
          } else {
            reject({msg: '邮箱不存在'});
          }
        }
      });

  });
}
