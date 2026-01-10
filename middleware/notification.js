
const models = require('../models');
const { to, ReE, ReS } = require("../utils/response");
const {Op} = require('../models/index').Sequelize;
const s = require("../models/index").sequelize;
const  nodemailer = require('nodemailer');
const moment = require('moment');
const fs =require('fs');
const CONFIG = require('../config/config');
const ejs = require('ejs');
const email={
    "transport": {
        "host": CONFIG.mail_host,
        "port": CONFIG.mail_port,
        "secureConnection":true,
        "auth": {
            "user": CONFIG.mail_user,
            "pass": CONFIG.mail_pass
        },
        "tls": {
            secureProtocol: "TLSv1_method",
            // rejectUnauthorized: false

        }
    },
    "sender": {
        "noreply": `do not reply <${CONFIG.mail_user}>`,
        "info": "Info <>"
    },
    user:CONFIG.mail_user,
    pass:CONFIG.mail_pass
};
const web_url=CONFIG.web_url;


const mailer = nodemailer.createTransport(email.transport); 
const ForgetPassword = async (data,callback)=>{
    
    data.web_url="https://lms.seonindonesia.id";
    let awal = moment(data.expireDate);
    let skr = moment();
    data.period=awal.diff(skr, 'hours'); 
    let mail_basic=ejs.compile(fs.readFileSync(__dirname+'/../views/email_notification/forget_password.html','utf8'));
    let cnt=mail_basic(data);

    mailer.sendMail({
        from: email.sender.noreply, // sender address
        to: data.email,
        subject: 'SEON INDONESIA - Lupa Password',
        html: cnt // html body
    }, function(error, info){
        console.log(error)
        if (error){
            callback(error);
        }else{
            callback(null,cnt)
        } 
    });

}
const RegisterUser=async(data,callback)=>{
    // let hasil={};
    
    data.web_url=web_url;
    let awal = moment(data.expireDate);
    let skr = moment();
    data.period=awal.diff(skr, 'hours'); 
    let mail_basic=ejs.compile(fs.readFileSync(__dirname+'/../views/email_notification/new_register.html','utf8'));
    let cnt=mail_basic(data);
    mailer.sendMail({
        from: email.sender.noreply, // sender address
        to: data.email,
        subject: 'Registrasi Pengguna SEON INDONESIA Sebagai - ' + data.role,
        html: cnt // html body
    }, function(error, info){
        
            
        console.log(error);
        if (error){
            
            callback(error);
        }else{
            callback(null,cnt)
        } 
    });
};
const REGISTER_SUKSES=async(data,callback)=>{
    // let hasil={};
    console.log('--->>>>>>>>>',data);
    data.login_url=login_url;
    
    let mail_basic=ejs.compile(fs.readFileSync(__dirname+'/../views/notif/mail_register_success.html','utf8'));
    let cnt=mail_basic(data);
    mailer.sendMail({
        from: email.sender.noreply, // sender address
        to: data.Email,
        subject: 'SELAMAT BERGABUNG  ' + data.ClientName + ', DENGAN SEONINDONESIA',
        html: cnt // html body
    }, function(error, info){
        console.log(error);
        if (error){
            callback(error);
        }else{
            callback(null,cnt)
        } 
    });
};

const notification={
    mail:{
        RegisterUser,
        ForgetPassword
    },
    push:{
        // pikcup_notif_driver:PICKUP_NOTIF_DRIVER
    },
    getNotification:{

    },
    

}

module.exports=notification
