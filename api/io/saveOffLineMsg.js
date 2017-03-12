import mongoose from 'mongoose';
const Admin = mongoose.model('Admin');

export default function saveOffLineMsg(data) {
  const {to} = data;
  Admin.findOne({_id: to})
    .select('_id message_off_line')
    .exec((error, doc) => {
      if (error) {
        console.log('查询出错');
      } else {
        const newMessageArr = (doc.message_off_line && doc.message_off_line.length > 0) ? doc.message_off_line : [];
        newMessageArr.push(data);
        Admin.findOneAndUpdate({_id: doc._id}, {message_off_line: newMessageArr}, (error, doc) => {
          if (error) console.log('更新出错:' + error);
        });
      }
    });
}
