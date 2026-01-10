const models = require('../models');
const {to, ReE, ReS} = require('../utils/response');
const CONFIG = require('../config/config');
const numbering = require('../middleware/numbering');
const { body, validationResult } = require("express-validator");
const async = require("async");
const { Op } = require("../models/index").Sequelize;
const getBranchByHost=async(req,res)=>{
    try {
        let dataX = await models.Company.findAll({
            where:{
                city_code:req.params.hub_id
            }
        });
        return ReS(res, {
            data:dataX
        }, 200);
    } catch (err) {
        return ReE(res, err.message, 404)
    }
};
const bankList = async (req,res)=>{
    let user =req.decoded;
    let pg = req.query.pg || 1;
    let limit =10;
    let options = {};
    options.page = pg;
    options.paginate = limit;
    options.where={
        company_id:user.company_id
    }
    try {
        const {docs, pages, total} = await models['Company_bank'].paginate(options);
        let rsp = {
            total: total,
            current: pg,
            pages: pages,
            limit: limit,
            data: docs
        };
        return ReS(res, rsp, 200);
    } catch (err) {
        return ReE(res, err, err.message)
    }
};
const saveBankList = async(req,res)=>{
    let user = req.decoded;
    if (req.body && !req.body.no_rek1 ){
        return ReE(res, 'No Rek wajib diisi', 404)
    }
    if (req.body && !req.body.bank_1 ){
        return ReE(res, 'Nama wajib diisi', 404)
    }
    try {
    let dataBank = await models.Company_bank.findOne({
        where:{
            company_id: {
                [Op.iLike]: `%${user.company_id}%`
            },
            no_rek1: {
                [Op.iLike]: `%${req.body.no_rek1}%`
            }
        }
    })
    if (dataBank){
        models.Company_bank.update({
            note:req.body.note,
            no_rek1:req.body.no_rek1,
            bank_1:req.body.bank_1,
            bank_br_1:req.body.bank_br_1,
            usrupd:user.email
        },{
            where:{
                company_id: {
                    [Op.iLike]: `%${user.company_id}%`
                },
                no_rek1: {
                    [Op.iLike]: `%${req.body.no_rek1}%`
                }
            }
        }) .then(response => {
            return ReS(res, {
                data: response
            }, 200);
        })
    }else{
        models
        .Company_bank
        .build({
            note:req.body.note,
            no_rek1:req.body.no_rek1,
            bank_1:req.body.bank_1,
            bank_br_1:req.body.bank_br_1,
            company_id:user.company_id,
            usrupd:user.email
        })
        .save()
        .then(response => {
            return ReS(res, {
                data: response
            }, 200);
        })
        .catch(err => {
            return ReE(res, err, 404)
        });
    }
} catch (err) {
    return ReE(res, err, 404);
  }
}
const getCompanyByCompanyId=async (req,res)=>{
    let user =req.decoded;
    try {
        let dataX = await models.Company.findOne({
            where:{
                company_id:req.params.id
            }
        });
        return ReS(res, {
            data:dataX
        }, 200);
    } catch (err) {
        return ReE(res, err, err.message)
    }
}
const getCompanyHo=async (req,res)=>{
    let user = req.decoded
    try {
        let dataX = await models.Company_group.findOne({
            where:{
                company_group_id:user.company_group_id
            }
        });
        return ReS(res, {
            data:dataX
        }, 200);
    } catch (err) {
        return ReE(res, err, err.message)
    }
}
const updateCompanyHo = async(req,res)=>{
    let user =req.decoded;
    try{
        models
        .Company_group
        .update(req.body,{
            where :{
                company_group_id:user.company_group_id
            }
        })
        .then(response => {
            return ReS(res, {
                data: response
            }, 200);
        })
        .catch(err => {
            return ReE(res, err, err.message)
        });
    } catch(err){
        return ReE(req,err,err.message)
    }
};

const getCompanyBranchList=async(req,res)=>{
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let options = {};
    options.page = pg;
    options.paginate = limit;
    // options.where={
    //     country_id:req.params.country
    // };
    options.include = [
        {
            model: models.User,
            as: "user_account",
            required: false
        }
    ];
    options.order= [['company_id','ASC']]
    if (req.query && req.query.term){
        options.where={
            [Op.or]: [
                {
                    company_name: {
                        [Op.iLike]: `%${req.query.term}%`
                    }
                },
            {
                company_id: {
                    [Op.iLike]: `%${req.query.term}%`
                }
            },
            {
                city_code: {
                    [Op.iLike]: `%${req.query.term}%`
                }
            },
            {
                city_name: {
                    [Op.iLike]: `%${req.query.term}%`
                }
            },
        ]
        };
    }
    try {
        const {docs, pages, total} = await models['Company'].paginate(options);
        let rsp = {
            total: total,
            current: pg,
            pages: pages,
            limit: limit,
            data: docs
        };
        return ReS(res, rsp, 200);
    } catch (err) {
        return ReE(res, err, err.message)
    }
};
const saveBranch=async(req,res)=>{
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ReE(res, errors.array(), 404);
  }

  let bd = req.body;
  let user =req.decoded;
  bd.company_group_id=user.company_group_id;
  bd.usrUpd=user.email;
  try {
    const numeric=await numbering.BRANCH(req);
  bd.company_id=numeric.numeric;
  const result = await models.Company.create(bd);
  if (result){
    return ReS(res, {data: result}, 200);
  };
  throw new Error();
  } catch(err){
    return ReE(res, err, 401)
  }
};
const updateBranch = async(req,res)=>{
    let bd = req.body;
    let hasil = {};
    let id = req.params.id;

    console.log(req.body);
    async.waterfall([
        cariData = (cb) => {
            models['Company']
                .findOne({
                    where: {
                        company_id: id
                    },
                    raw:true
                })
                .then(function (r) {
                    if (r) {
                        cb(null, hasil)
                    } else {
                        cb('Data tidak terdaftar');
                    }
                }, function (e) {
                    cb(e);
                });
        },
        updateData = (hasil, cb) => {
            var params = bd;
            models
                .Company
                .update(params, {
                    where: {
                        company_id: id
                    }
                })
                .then(responses => {
                    cb(null, params);
                })
                .catch(err => {
                    cb('Error Update ' + err.message)
                });
        }
    ], function (e, s) {
        if (e) {
            return ReE(res, e, 404)
        } else {
            return ReS(res, {
                data: s
            }, 200);
        }
    })
};
module.exports={
    getBranchByHost,
    bankList,
    saveBankList,
    getBranchByHost,
    getCompanyByCompanyId,
    getCompanyBranchList,
    getCompanyHo,
    updateCompanyHo,
    saveBranch,
    updateBranch
}