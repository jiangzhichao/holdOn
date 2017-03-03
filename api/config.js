/**
 * Created by isaac on 15/10/28.
 */
import path from 'path';
const uploadFolder = path.join(__dirname, '../uploads');
module.exports = {
  db: 'mongodb://localhost/jzc',
  uploadFolder,
};
