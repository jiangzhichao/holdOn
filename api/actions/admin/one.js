import mongoose from 'mongoose';
const Admin = mongoose.model('Admin');

export default function one(req) {

  return new Promise((resolve, reject) => {
    const {_id} = req.query;
    Admin
      .findOne({_id})
      .select('name _id avatar_url message')
      .populate('message')
      .exec((error, doc) => {
        if (error) {
          reject({msg: '查询错误!', error});
        } else {
          if (doc) {
            resolve({oneAdmin: doc});
          } else {
            reject({msg: '无结果'});
          }
        }
      });
  });

}
