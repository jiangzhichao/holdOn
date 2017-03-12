import mongoose from 'mongoose';
const Admin = mongoose.model('Admin');

export default function sendOffLineMsg(_id) {

  return new Promise((resolve, reject) => {
    Admin.findOne({_id})
      .select('_id message_off_line')
      .exec((error, doc) => {
        if (error) {
          console.log('查询失败');
        } else {
          if (doc && doc.message_off_line && doc.message_off_line.length > 0) {
            Admin.findOneAndUpdate({_id: doc._id}, {message_off_line: []}, (error) => {
              if (error) console.log('更新出错:' + error);
            });
            resolve(doc.message_off_line);
          }
        }
      });
  });

}
