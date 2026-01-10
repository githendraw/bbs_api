const multer = require("multer");
const path = require("path");
const fs=require('fs');
const excelFilter = (req, file, cb) => {
  cb(null, true);
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(path.dirname(fs.realpathSync(__filename)), '../../files/uploads'));
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${Date.now()}-f-${file.originalname}`);
  },
});

var uploadFile = multer({ storage: storage, fileFilter: excelFilter });
module.exports = uploadFile;
