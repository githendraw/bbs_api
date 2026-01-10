const { to, ReE, ReS } = require("../utils/response");
const async = require("async");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CONFIG = require("../config/config");
const message = require("../utils/message");
const logger = require("../utils/logger");
const models = require("../models");
const { Op } = require("../models/index").Sequelize;
const history = require("../middleware/history");
let getToken = function (r) {return jwt.sign(r, CONFIG.private_key, {algorithm: "RS256",expiresIn: "24h"});};
const userLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ReE(res, errors.array(), 403);
  }
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  try {
    const bodyData = req.body;
    let userData = await models.User.findOne({where: { email: bodyData.email },raw: true,});
    if (!userData) {throw new Error("Data tidak ada");}
    let pass = userData.password;
    const match = await bcrypt.compare(bodyData.password, pass);
    if (!match) { throw new Error("email / password tidak sesuai")};
    if (userData && userData.is_block){
      throw new Error("Silahkan hubungin admin ")
    }
    let token=getToken(userData);
    delete userData.password;
    delete userData.temp_password;
    userData.token=token;
    let cmData = await models.Company.findOne({
      where:{company_id:userData.company_id},raw:true
    })
    let destData= await models.Destination.findOne({
      where:{dest_id:cmData.city_code},raw:true
    })
    userData.company={...cmData};
    userData.city={...destData};
    logger.info(JSON.stringify(userData));
    return ReS(res,{data:userData},200);
  } catch (err) {
    logger.error(`${req.originalUrl} , ${err.message}`);
    return errReturn(err.message);
  }
};
const signUp = async (req, res) => {
};
const createUser = async(req,res)=>{
  const body = req.body;
  if (!body.email) {
    return ReE(res, "Please enter an email register.");
  } else if (!body.name) {
    return ReE(res, "Please enter name");
  } else if (!body.password) {
    return ReE(res, "Please enter a password to register.");
  } else if (!body.company_id) {
    return ReE(res, "company id required");
  } else if (!body.company_group_id) {
    return ReE(res, "company group id required");
  } else {
    let err, user;
    let salt, hash
    [err, salt] = await to(bcrypt.genSalt(10));
    if(err) ReE(res,err.message, 403);
    [err, hash] = await to(bcrypt.hash(body.password, salt));
    if(err) ReE(res,err.message, 403);
    user = {
      email:body.email,
      password:hash,
      company_id:body.company_id,
      company_group_id:body.company_group_id,
      name: body.name,
      role: body.role || 'admin',
      temp_password:body.password
    }
    let dataUser = await models.User.findOne({
      where: {
        email: { [Op.iLike]: `%${body.email}%` },
      },
      raw: true,
    });
    if (dataUser) {
      return ReE(res, "Error", "Email " + body.email + " sudah terdaftar");
    }
    models.User.build(user)
    .save()
    .then((response) => {
      return ReS(
        res,
        {
          data: response,
        },
        200
      );
    })
    .catch((err) => {
      return ReE(res, err.message, 403);
    });
  }
};
const createDriver=async(req,res)=>{
  const bd = req.body;
  let isUpdate = false;
 
  try{


  const contactData = await models.Contact.findOne({
    where:{
      company_id:bd.company_id,
      contact_id:bd.contact_id,
      contact_type:'driver'
    }
  })
  const companyData = await models.Company.findOne({
    where: {
      company_id: bd.company_id,
    },
    attributes: ["id", "company_id", "company_name"],
    raw: true,
  });

  const checkUser = await models.User.findOne({
    where: {
      email: bd.email,
    },
    raw: true,
  });

  if (checkUser){

    console.log(checkUser)
    if (checkUser.contact_id !==bd.contact_id){
      return ReE(res,'Email sudah terdaftar dengan akun yang lain');
    }
    isUpdate=true
  }

  if (!contactData) {
    return ReE(res,'Data contact tidak terdaftar');
  }
  if (!companyData) {
    return ReE(res,'Data perusahaan / cabang tidak terdaftar');
  }

  if (!bd.password){
    return ReE(res,'password tidak ada');
  }

  let err, user;
  let salt, hash
  [err, salt] = await to(bcrypt.genSalt(10));
  if(err) ReE(res,err.message, 403);
  [err, hash] = await to(bcrypt.hash(bd.password, salt));

  if (isUpdate){
    models.User.update(
      {
        name:bd.name,
        password:hash,
        temp_password:bd.password,

      },
      {
        where: {
          id: checkUser.id,
        },
      }
    )
      .then((response) => {
        return ReS(
          res,
          {
            data: response,
          },
          200
        );
      })
      .catch((err) => {
        return ReE(res, err.message, 403);
      });

  }else{
    models.User.build({
      company_id:bd.company_id,
      company_group_id:companyData.company_group_id,
      name:bd.name,
      email:bd.email,
      contact_id:bd.contact_id,
      password:hash,
      temp_password:bd.password,
      role:'driver',

    })
    .save()
    .then((response) => {
      return ReS(
        res,
        {
          data: response,
        },
        200
      );
    })
    .catch((err) => {
      return ReE(res, err.message, 403);
    });
  }

} catch (err) {
  return ReE(res, err.message, 403);
}


}
const getMe = async (req,res)=>{
  let user = req.decoded;
  let cmData = await models.Company.findOne({
    where:{company_id:user.company_id},raw:true
  })
  let destData= await models.Destination.findOne({
    where:{dest_id:cmData.city_code},raw:true
  })
  user.company={...cmData};
  user.city={...destData};
  logger.info(JSON.stringify(user));
  return ReS(res,{data:user},200);
};
const getUser = async(req,res)=>{
  const user = req.decoded;
  const companyId=req.params.company_id;

  // if (user && !user.role==='superadmin' && !user.is_user_manager){
  //   return ReE(res, 'Anda tidak berhak', 403);
  // }
  // check auth
  if (user && !user.is_user_manager){
    return ReE(res, 'Anda tidak berhak', 403);
  }

  let where;
  if (companyId.toLowerCase() =='all'){
    where={}
  }else{
    where={
      company_id:companyId
    }
  }
  let dataX = await models.User.findAll({
    where:{...where},
    order:[['name','ASC']]
});
return ReS(res, {
    data:dataX
}, 200);

}


const updatePassword = async(req,res)=>{
  const bd = req.body;
  const id=req.params.id;
   
  try{
    const userData = await models.User.findOne({
      where:{id}
    });
    if (!userData){
      return ReE(res, 'Data tidak di temukan', 403);  
    }
    if (bd && !bd.password){
      return ReE(res,'Password tidak di sertakan',403);
    }
    let err, user;
    let salt, hash
    [err, salt] = await to(bcrypt.genSalt(10));
    console.log('--->>>> salt',err);
    if(err) ReE(res,err.message, 403);
    [err, hash] = await to(bcrypt.hash(bd.password, salt));
    if(err) ReE(res,err.message, 403);

    const rst = await models.User.update({
      password:hash,
      temp_password:bd.password
    },{
      where:{id}
    })


    console.log(rst);
    return ReS(res,{data:userData})
   
  } catch (err) {
    return ReE(res, err.message, 403);
  }

}

const blockUser = async(req,res)=>{
  const bd = req.body;
  const id=req.params.id;
  let isUpdate = false;
  try{


      
    
      models.User.update(
        {
         is_block:true
  
        },
        {
          where: {
            id: id,
          },
        }
      )
        .then((response) => {
          return ReS(
            res,
            {
              data: response,
            },
            200
          );
        })
        .catch((err) => {
          return ReE(res, err.message, 403);
        });
  
   
  } catch (err) {
    return ReE(res, err.message, 403);
  }

}

const unblockUser = async(req,res)=>{
  const bd = req.body;
  const id=req.params.id;
  let isUpdate = false;
  try{


      
    
      models.User.update(
        {
         is_block:false
  
        },
        {
          where: {
            id: id,
          },
        }
      )
        .then((response) => {
          return ReS(
            res,
            {
              data: response,
            },
            200
          );
        })
        .catch((err) => {
          return ReE(res, err.message, 403);
        });
  
   
  } catch (err) {
    return ReE(res, err.message, 403);
  }

}

const getUserId= async(req,res)=>{
  const user = req.decoded;
  const companyId=req.params.company_id;

  // if (user && !user.role==='superadmin' && !user.is_user_manager){
  //   return ReE(res, 'Anda tidak berhak', 403);
  // }
  // check auth
  if (user && !user.is_user_manager){
    return ReE(res, 'Anda tidak berhak', 403);
  }
  
  let dataX = await models.User.findOne({
    where:{ id: Number(req.params.id)}
});
return ReS(res, {
    data:dataX
}, 200);
}
module.exports = {
  userLogin,
  getMe,
  createUser,
  createDriver,
  getUser,
  blockUser,
  unblockUser,
  getUserId,
  updatePassword
};
