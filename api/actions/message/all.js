import mongoose from 'mongoose';
const Message = mongoose.model('Message');

export default function all(req) {

  return new Promise((resolve, reject) => {
    const {come, to} = req.query;
    console.log(come, to);
    Message
      .find()
      .where({$or: [{come, to}, {come: to, to: come}]})
      .sort({'create_time': 1})
      .select('msg come to')
      .exec((error, doc) => {
        if (error) {
          reject({msg: '查询错误!', error});
        } else {
          if (doc) {
            resolve({msg: doc});
          } else {
            reject({msg: '无结果'});
          }
        }
      });
  });

}
