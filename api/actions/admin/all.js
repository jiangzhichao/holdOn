import mongoose from 'mongoose';
const Admin = mongoose.model('Admin');

export default function all() {

  return new Promise((resolve, reject) => {
    Admin.find({})
      .select('name _id avatar_url')
      .exec((error, doc) => {
        if (error) {
          reject({msg: '查询错误!'});
        } else {
          if (doc) {
            resolve({
              code: 1000,
              allAdmin: doc,
            });
          } else {
            reject({msg: '无结果'});
          }
        }
      });
  });

}
