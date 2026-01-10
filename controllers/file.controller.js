const models = require('../models');
const { to, ReE, ReS } = require("../utils/response");
const CONFIG = require('../config/config');
const async = require('async');
const {Op} = require('../models/index').Sequelize;
const multer=require('multer');
const fs=require('fs');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var folderType = req.query.type.toLocaleLowerCase()||'uploads';
        let basicFile = path.join(path.dirname(fs.realpathSync(__filename)), '../../files');
        let uploadFile = path.join(path.dirname(fs.realpathSync(__filename)), '../../files/'+folderType);
        let checkBasicFile=fs.existsSync(basicFile);
        let checkUploadFile = fs.existsSync(uploadFile);
        if (!checkBasicFile){
            fs.mkdirSync(basicFile);
        }
        if (!checkUploadFile){
            fs.mkdirSync(uploadFile);
        };
        callback(null, uploadFile);
    },
    filename: function (req, file, callback) {
        var fileName=req.query.type.toLocaleLowerCase()+'_'+file.fieldname + Date.now()+'.'+file.originalname.split('.')[file.originalname.split('.').length - 1];
        // var fileName=file.originalname;
        callback(null, fileName);
    }
})
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) { // file filter
        // if (['xls', 'xlsx', 'csv','pdf','png','jpg','jpeg','doc','docx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
        //     return callback(new Error('Wrong extension type'))
        // }
        callback(null, file)
    }
}).single('file');
  const  fileUpload=async(req,res,next)=>{
        let hasil = {
            type:req.query.type.toLocaleLowerCase()
        };
        async.waterfall([
            function (cb) {
                upload(req, res, function (err) {
                    if (err){
                        cb(err)
                    }else{
                        hasil.fileName=req.file;
                        cb(null,hasil);
                    }
                })
            },
        ], function (err, status) {

            console.log(status);
                if (err) {
                return res.status(403).send(err);
            } else {
                return res.status(200).send(status);
            }
        })
    };
    const updateProfilePicture=async (req,res,next)=>{
        let user = req.decoded;
        let hasil = {
            type:req.query.type.toLocaleLowerCase()
        };
        async.waterfall([
            function (cb) {
                upload(req, res, function (err) {
                    if (err){
                        cb(err)
                    }else{

                        hasil.fileName=req.file;
                        cb(null,hasil);
                    }
                })
            },
            function(hasil,cb){
                models.Contact.update({
                    pic_profile:`${hasil.type}/${hasil.fileName.filename}`
                }, {
                    where: {
                      contact_id: req.params.id,
                      company_id:user.company_id
                    },
                  })
                    .then((responses) => {
                      cb(null, hasil);
                    })
                    .catch((err) => {
                      cb("Error Update " + err.message);
                    });
            }
        ], function (err, status) {
                if (err) {
                return res.status(403).send(err);
            } else {
                return res.status(200).send(status);
            }
        })
    };
    const updateCompanyHOPicture=async (req,res,next)=>{
        let user = req.decoded;
        let hasil = {
            type:'profile'
        };
        async.waterfall([
            function (cb) {
                upload(req, res, function (err) {
                    if (err){
                        cb(err)
                    }else{

                        hasil.fileName=req.file;
                        cb(null,hasil);
                    }
                })
            },
            function(hasil,cb){
                models.Company_group.update({
                    logo:`${hasil.type}/${hasil.fileName.filename}`
                }, {
                    where: {
                        company_group_id: req.decoded.company_group_id,
                    },
                  })
                    .then((responses) => {
                      cb(null, hasil);
                    })
                    .catch((err) => {
                      cb("Error Update " + err.message);
                    });
            }
        ], function (err, status) {
                if (err) {
                return res.status(403).send(err);
            } else {
                return res.status(200).send(status);
            }
        })
    }
module.exports={
    fileUpload,
    updateProfilePicture,
    updateCompanyHOPicture
};
