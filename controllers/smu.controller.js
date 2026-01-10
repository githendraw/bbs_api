const { to, ReE, ReS } = require('../utils/response');
const async = require('async');
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const CONFIG = require('../config/config');
const message = require('../utils/message');
const logger = require('../utils/logger');
const models = require('../models');
const history = require('../middleware/history');
const numbering = require('../middleware/numbering');
const custom = require('../middleware/custom');
const { Op } = require('../models/index').Sequelize;
const { v1: uuidv1 } = require('uuid');
const s = require('../models/index').sequelize;
const hitungSmu= async(we,user)=>{
    let findHarga = await models.Smu_harga.findOne({
        where :{
            company_id:user.company_id
        },raw:true
    });
    return new Promise( (resolve,reject)=>{
        let harga = 0;
        let min = 0;
        let total = 0;
        let total_ppn=0;
        let total_amount=0;
        let ppn =0
        if(findHarga){
            harga = findHarga.harga_satuan;
            min = findHarga.minimum;
            ppn=findHarga.ppn||0
        }
        if (we<=min && min !==0){
          total = harga * min ;
        }else{
            total = harga * we;
        }
        total_ppn = total*(ppn/100);
        total_amount=total+total_ppn;
        return resolve ({
            minimun:min,
            harga:harga,
            berat:we,
            total,
            ppn,
            total_ppn,
            total_amount
        });
    })
}
const smuSewaGudangView=async(req,res)=>{
    let user = req.decoded;
    let pg = req.query.pg || 1;
    const type = req.params.type;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let src = null;
    if (req.query && req.query.term) {
      src = {
        company_id: user.company_id,
        smu_type:type,
        [Op.or]: [
          {
            smu_no: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            partner_name: {
              [Op.like]: `%${req.query.term}%`,
            },
          },
          {
            receiver_name: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            receiver_pic: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            receiver_address1: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            host_origin: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            host_originname: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            host_destination: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            host_destinationname: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
        ],
      };
    } else {
      src = {
        company_id: user.company_id,
        smu_type:type,
      };
    }
    let start_date = req.query.start_date || null;
    let end_date = req.query.end_date || null;
    let st, ed;
    if (start_date) {
      st = moment(new Date(start_date)).format('YYYY-MM-DD 00:00:00');
      if (end_date) {
        ed = moment(new Date(end_date)).format('YYYY-MM-DD 23:59:00');
      } else {
        ed = moment(new Date(start_date)).add(1, 'day').format('YYYY-MM-DD 23:00:00');
      }
    } else {
      st: null;
      ed: null;
    }
    if (st) {
      src.smu_date = {
        [Op.between]: [st, ed],
      };
    }
    let options = {
      where: src,
      order: [['smu_date', 'DESC']],
      page: pg,
      paginate: limit
    };
    try {
      const { docs, pages, total } = await models['Smu'].paginate(options);
      let rsp = {
        total: total,
        current: pg,
        pages: pages,
        limit: limit,
        data: docs,
        filter: req.query.term || null,
      };
      return ReS(res, rsp, 200);
    } catch (err) {
      return ReE(res, err, 404);
    }
};
const smuSewaGudangId=async(req,res) => {
  try {
    const cariData = await models.Smu.findOne({
      where:{
        id:req.params.id
      }
    })
      return ReS(res,{data:cariData},200)
  } catch (err) {
    return ReE(res, err.message,401);
  }
}
const smuSewaGudangEntry=async(req,res)=>{
    const errors = validationResult(req);
    const bd = req.body;
    let user = req.decoded;
    const errReturn = function (message) {
        return ReE(res, message, 403);
      };
      if (!errors.isEmpty()) {
        errReturn(errors.array());
      }
      console.log('-->>>>')
      let smuType=req.params.type.toLowerCase();
      let tgl = moment(new Date(bd.smu_date)).format('YYYY-MM-DD HH:mm:ss');
      try {
        let host_origin = await models.Hub.findOne({
            where:{hub_id:bd.host_origin}
        })
        let host_destination = await models.Hub.findOne({
            where:{hub_id:bd.host_destination}
        })
        let contact = await models.Contact.findOne({
            where: { contact_id: bd.partner_id },
            raw: true,
          });
          let vendor = await models.Contact.findOne({
            where: { contact_id: bd.airline },
            raw: true,
          });
        let smu = await models.Smu.findOne({
            where:{smu_no:bd.smu_no,smu_type:smuType}})
        if (!host_origin) {
           return errReturn('Kode Asal tidak terdaftar');
          }
          if (!host_destination) {
            return  errReturn('Kode tujuan tidak terdaftar');
          }
          if (!contact) {
            return errReturn('Kode Customer tidak terdaftar');
          }
          if (!vendor) {
            return errReturn('Kode Vendor tidak terdaftar');
          }
          if (smu) {
            return errReturn('Nomor smu ini sudah terdaftar');
          }
          let params = {
            smu_id:uuidv1(),
            smu_no:bd.smu_no,
            company_id:user.company_id,
            company_group_id:user.company_group_id,
            smu_type:smuType,
            smu_date:tgl,
            partner_id:bd.partner_id,
            partner_pic:bd.partner_pic,
            partner_address1:bd.partner_address1,
            partner_name:bd.partner_name,
            receiver_name:bd.receiver_name,
            receiver_address1:bd.receiver_address1,
            host_origin:bd.host_origin,
            host_originname:host_origin.hub_name,
            host_destination:bd.host_destination,
            host_destinationname:host_destination.hub_name,
            description:bd.description,
            count_by:bd.count_by,
            usrupd:user.name,
            airline:bd.airline,
            airline_name:vendor.name,
            komoditi_id:bd.komoditi_id,
            item_desc:bd.item_desc,
            qty:bd.qty,
            weight:bd.weight,
            handling_wh:bd.handling_wh,
            admin_wh:bd.admin_wh,
            disc_wh:bd.disc_wh,
            sub_total:bd.sub_total,
            min_weight:bd.min_weight,
            price_wh:bd.price_wh,
            tax_wh:bd.tax_wh,
            total_tax_wh:bd.total_tax_wh,
            total_wh:bd.total_wh,
            terbilang:custom.terbilang(bd.total_wh)
           };
           const create = await models.Smu.create(params);
           return ReS(
             res,
             {
               data: create,
             },
             200
           );
      }catch (err) {
        console.log(err);
        return errReturn(err.message);
      }
};
const smuSewaGudangUpdate=async(req,res)=>{
    const errors = validationResult(req);
    const bd = req.body;
    let user = req.decoded;
    const id=req.params.id;
    const errReturn = function (message) {
        return ReE(res, message, 403);
      };
      if (!errors.isEmpty()) {
        errReturn(errors.array());
      }
      let smuType=req.params.type.toLowerCase();
      let tgl = moment(new Date(bd.smu_date)).format('YYYY-MM-DD HH:mm:ss');
      try {
        let host_origin = await models.Hub.findOne({
            where:{hub_id:bd.host_origin}
        })
        let host_destination = await models.Hub.findOne({
            where:{hub_id:bd.host_destination}
        })
        let contact = await models.Contact.findOne({
            where: { contact_id: bd.partner_id },
            raw: true,
          });
          let vendor = await models.Contact.findOne({
            where: { contact_id: bd.airline },
            raw: true,
          });
        if (!host_origin) {
            errReturn('Kode Asal tidak terdaftar');
          }
          if (!host_destination) {
            errReturn('Kode tujuan tidak terdaftar');
          }
          if (!contact) {
            errReturn('Kode Customer tidak terdaftar');
          }
          if (!vendor) {
            errReturn('Kode Vendor tidak terdaftar');
          }
          let params = {
            smu_no:bd.smu_no,
            company_id:user.company_id,
            company_group_id:user.company_group_id,
            smu_type:smuType,
            smu_date:tgl,
            partner_id:bd.partner_id,
            partner_pic:bd.partner_pic,
            partner_address1:bd.partner_address1,
            partner_name:bd.partner_name,
            receiver_name:bd.receiver_name,
            receiver_address1:bd.receiver_address1,
            host_origin:bd.host_origin,
            host_originname:host_origin.hub_name,
            host_destination:bd.host_destination,
            host_destinationname:host_destination.hub_name,
            description:bd.description,
            count_by:bd.count_by,
            usrupd:user.name,
            airline:bd.airline,
            airline_name:vendor.name,
            komoditi_id:bd.komoditi_id,
            item_desc:bd.item_desc,
            qty:bd.qty,
            weight:bd.weight,
            handling_wh:bd.handling_wh,
            admin_wh:bd.admin_wh,
            disc_wh:bd.disc_wh,
            sub_total:bd.sub_total,
            min_weight:bd.min_weight,
            price_wh:bd.price_wh,
            tax_wh:bd.tax_wh,
            total_tax_wh:bd.total_tax_wh,
            total_wh:bd.total_wh,
            terbilang:custom.terbilang(bd.total_wh)
           };
           const create = await models.Smu.update(params,{
            where:{
                id:id,
                company_id:user.company_id
            }
           });
           return ReS(
             res,
             {
               data: params,
             },
             200
           );
      }catch (err) {
        console.log(err);
        return errReturn(err.message);
      }
}
const smuSaveHargaSewaGudang=async(req,res)=>{
    let user = req.decoded;
    const bd = req.body;
    const errReturn = function (message) {
        return ReE(res, message, 403);
      };
    try{
        let params ={
            company_id:user.company_id,
            company_group_id:user.company_group_id,
            tipe_sewa:req.params.type.toLowerCase(),
            minimum:bd.minimum,
            harga_satuan:bd.harga_satuan,
            ppn:bd.ppn,
            usrupd:user.email
        };
        let cariHarga = await models.Smu_harga.findOne({
            company_id:user.company_id,
            tipe_sewa:req.params.type.toLowerCase()
        })
        let rst;
        if (cariHarga){
            rst=await models.Smu_harga.update(
                {
                  ...params
                },
                {
                  where: {
                    company_id: user.company_id
                  },
                }
              );
        }else{
           rst= await models.Smu_harga.create(
                {
                  ...params
                }
              );
        }
        return ReS(res,{data:params},200);
    } catch(error){
        return errReturn(error);
    }
}
const smuGetHargaSewaGudang=async(req,res)=>{
  let user = req.decoded;
  const bd = req.body;
  const errReturn = function (message) {
      return ReE(res, message, 403);
    };
  try{
      let cariHarga = await models.Smu_harga.findOne({
          where:{
            company_id:user.company_id,
          tipe_sewa:req.params.type      }
          })
      return ReS(res,{data:cariHarga},200);
  } catch(error){
      return errReturn(error);
  }
}
const smuDeleteHargaSewaGudang=async(req,res) => {
  try {
    const cariData = await models.Smu.findOne({
      where:{
        id:req.params.id
      }
    })
    if (cariData && cariData.is_invoice){
      return ReE(res,'Data ini sudah di invoice',404);
    }
    models
    .Smu
    .destroy({
        where: {
            id:req.params.id
        }
    })
    .then(responses => {
      return ReS(res, {data: responses}, 200);
    })
    .catch(err => {
      return ReE(res, err.message, 401)
    });
  } catch (err) {
    return ReE(res, err.message,401);
  }
}
module.exports={
    smuSewaGudangView,
    smuSewaGudangId,
    smuSaveHargaSewaGudang,
    smuSewaGudangEntry,
    smuSewaGudangUpdate,
    smuGetHargaSewaGudang,
    smuDeleteHargaSewaGudang
};