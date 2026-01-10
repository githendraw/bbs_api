const { to, ReE, ReS } = require("../utils/response");
const async = require("async");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const CONFIG = require("../config/config");
const message = require("../utils/message");
const logger = require("../utils/logger");
const models = require("../models");
const history = require("../middleware/history");
const numbering = require("../middleware/numbering");
const custom = require("../middleware/custom");
const { Op } = require("../models/index").Sequelize;
const { v1: uuidv1 } = require("uuid");
const { mOSManifest, mShipmentInclude } = require("./shipment.controller");
const s = require("../models/index").sequelize;
const checkShipmentData=async(preData,manifest)=>{
  let hasil=[];
  const errReturn=async (err)=>{
    return await Promise.reject(err)
  }
  for (const f of manifest ) {
    // const contents = await fs.readFile(file, 'utf8');
    let shipmentData = await models.Shipment.findOne({where:{shipment_awb :f},raw:true});
    if (!shipmentData){
        return errReturn('data tidak ada')
    }
    if (shipmentData.is_manifest){
        return errReturn(`${shipmentData.shipment_awbm} sudah di manifest`)
    }
    let hub= await models.Destination.findOne({where:{dest_id:shipmentData.destination}});
    if (hub && hub.hub_id !== preData.hub_id){
      return errReturn(`${shipmentData.shipment_awbm} Hub Tidak sesuai`)
    }
    hasil.push({
      company_id:preData.company_id,
      manifest_id:preData.manifest_no,
      bag_id:preData.manifest_no,
      shipment_awb:f,
      usrupd:preData.usrupd,
      qty:shipmentData.qty,
      qty_bagging:shipmentData.qty
    })
  }
  return await Promise.resolve(hasil);
};

const updateShipment=async(manifest,tgl,user)=>{
  const errReturn=async (err)=>{
    return await Promise.reject(err)
  };
  for (const f of manifest ) {
      let x= await history.MANIFEST({
        shipment_awb: f.shipment_awb,
        manifest_id: f.manifest_id,
        tanggal: tgl,
      },user)
      // if (x && !x.status){
      //   return errReturn(x.error);
      // }
  };
  return await Promise.resolve(true);
}
const unmanifestSummaryByHub=async (req,res)=>{
    let user= req.decoded;
    let squery =`
select p.province_id,p.province_name,os.hub_id,os.hub_name , os.total from "Province" as p
INNER JOIN
(
    select h.hub_id,h.hub_name,h.province_id, sum(dd.total_shipment) as total
    from "Hub" as h
    INNER JOIN
    (
    select
    d.hub_id,
        d.dest_id,
        S.total_shipment
        from "Destination" as D
    INNER JOIN
        (
            SELECT
            COUNT(sh.shipment_awb) as total_shipment ,sh.destination
            FROM
            "Shipment" as sh
            where sh.is_incoming_wh=true and sh.is_manifest = false and sh.company_id=?
        GROUP BY
            sh.destination
            ORDER BY
            sh.destination
        ) as S
        on D.dest_id = S.destination
        ) dd
        on h.hub_id = dd.hub_id
        GROUP BY
        h.hub_id,h.hub_name,h.province_id
        order by
        h.hub_id ) as os
        on p.province_id=os.province_id
        ORDER BY p.province_name
`;
s.query(squery, {
replacements: [user.company_id],
type: s.QueryTypes.SELECT,
})
.then(function (data) {
    return ReS(res, {data:data}, 200);
})
.catch(function (err) {
    return ReE(res, err, err.message)
});
};
const unmanifestByHubDetail=async(req,res)=>{
    let user = req.decoded;
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let src = null;
    const errReturn = function (message) {
        return ReE(res, message, 403);
      };
    let destData=await models.Destination.findAll({
        attributes:['dest_id'],
        where:{
            hub_id:req.params.hub
        },
        raw:true
    })
    if (!destData){
        return errReturn('hub tidak terdaftar');
    }
    let arrDest=[];
    for(const val of destData) {
        arrDest.push(val.dest_id);
    }
    src={
        company_id:user.company_id,
        ...mOSManifest(),
        destination:{
            [Op.in]: arrDest
        }
    }
    if (req.query.term){
        src[Op.or]= [
            {
              shipment_awbm: {
                [Op.iLike]: `%${req.query.term}%`,
              },
            },
            {
              shipment_do: {
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
              originname: {
                [Op.iLike]: `%${req.query.term}%`,
              },
            },
            {
              destinationname: {
                [Op.iLike]: `%${req.query.term}%`,
              },
            },
          ];
    }
    let options = {
        where: src,
        order: [["shipment_date", "DESC"]],
        page: pg,
        paginate: limit,
        include: [...mShipmentInclude()],
      };
      try {
        const { docs, pages, total } = await models["Shipment"].paginate(options);
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
const unmanifestByHubByShipment=async(req,res)=>{
    let where;
  if (req && req.query.type == "id") {
    where = {
      id: req.params.id,
      company_id:req.decoded.company_id
    };
  } else if (req && req.query.type == "shipment_id") {
    where = {
      shipment_awb: req.params.id,
      company_id:req.decoded.company_id
    };
  } else {
    where = {
      shipment_awbm: req.params.id,
      company_id:req.decoded.company_id
    };
  }
  let shipmentData = await models.Shipment.findOne({
    where: where,
    include: [...mShipmentInclude()],
  });
  if (!shipmentData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  let destination = shipmentData.destination;
  const destData = await models.Destination.findOne({
    where:{
      dest_id:destination
    }
  })
  if (destData.hub_id!==req.params.hub){
    return ReE(res,'Kode Hub tidak sesuai dengan shipment tersebut',403);
  }
  return ReS(res, { data: shipmentData }, 200);
};
const simpanManifest = async(req,res)=>{
  let user = req.decoded;
  const bd = req.body;
  let dm =bd;
  let dd=bd.detail;
  delete dm['detail'];
  let transaction;
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  try {
    transaction = await s.transaction();
    let hasil ={};
    //
    let manifestNo = await numbering.MANIFEST(req);
    let paramMaster = {
      ...dm,
      is_manual:true,
      company_id:user.company_id,
      bag_id:manifestNo.numeric,
      manifest_id:manifestNo.numeric,
      manifest_date:new Date(dm.manifest_date),
      bag_id:manifestNo.numeric,
      usrupd:user.name
    };
    let paramDetail = await checkShipmentData( {hub_id:dm.hub_id,manifest_no:manifestNo.numeric,company_id:user.company_id,usrupd:user.name},dd);
    await models.Manifest_header.create({...paramMaster},{transaction});
    await models.Manifest_detail.bulkCreate(paramDetail,{ transaction });
    await updateShipment(paramDetail,paramMaster.manifest_date,user);
    await transaction.commit();
    logger.info(JSON.stringify(paramMaster));
    return ReS(res,{
        ...paramMaster
    },200)
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    return errReturn(err);
  }
}
const getManifest = async(req,res)=>{
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  if (req.query && req.query.term) {
    src = {
      company_id: user.company_id,
      [Op.or]: [
        {
          manifest_id: {
            [Op.iLike]: `%${req.query.term}%`,
          },
        },
        {
          hub_name: {
            [Op.iLike]: `%${req.query.term}%`,
          },
        },
        {
          description: {
            [Op.like]: `%${req.query.term}%`,
          },
        },
      ],
    };
  } else {
    src = {
      company_id: user.company_id,
    };
  }
  let start_date = req.query.start_date || null;
  let end_date = req.query.end_date || null;
  let st, ed;
  if (start_date) {
    st = moment(new Date(start_date)).format("YYYY-MM-DD 00:00:00");
    if (end_date) {
      ed = moment(new Date(end_date)).format("YYYY-MM-DD 23:59:00");
    } else {
      ed = moment(new Date(start_date))
        .add(1, "day")
        .format("YYYY-MM-DD 23:00:00");
    }
  } else {
    st: null;
    ed: null;
  }
  if (st) {
    src.manifest_date = {
      [Op.between]: [st, ed],
    };
  }
  let options = {
    where: src,
    order: [["manifest_date", "DESC"]],
    page: pg,
    paginate: limit,
    include: [
      {
        model: models.Manifest_detail,
        as: "detail_manifest",
        required: false,
        include:[
          {
            model:models.Shipment,
            as:"shipment_detail",
            required:false
          }
        ]
      },
    ],
  };
  try {
    const { docs, pages, total } = await models["Manifest_header"].paginate(options);
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
}
const getManifestByManifestId=async(req,res)=>{
  try{
  let shipmentData = await models.Manifest_header.findOne({
    where: {
      manifest_id:req.params.manifest_id
    },
    include: [
      {
        model: models.Manifest_detail,
        as: "detail_manifest",
        required: false,
        include:[
          {
            model:models.Shipment,
            as:"shipment_detail",
            required:false
          }
        ]
      },
    ],
  });
  if (!shipmentData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  return ReS(res, { data: shipmentData }, 200);
  } catch(error){
    return ReE(res, error, 404);
  }
}
const getManifestOsBerangkat = async(req,res)=>{
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  if (req.query && req.query.term) {
    src = {
      company_id: user.company_id,
      is_confirm_outbound:false,
      [Op.or]: [
        {
          manifest_id: {
            [Op.iLike]: `%${req.query.term}%`,
          },
        },
        {
          hub_name: {
            [Op.iLike]: `%${req.query.term}%`,
          },
        },
        {
          description: {
            [Op.like]: `%${req.query.term}%`,
          },
        },
      ],
    };
  } else {
    src = {
      company_id: user.company_id,
      is_confirm_outbound:false
    };
  }
  if (req.params && req.params.hub){
    src.hub_id=req.params.hub;
  }
  let options = {
    where: src,
    order: [["manifest_date", "DESC"]],
    page: pg,
    paginate: limit,
    include: [
      {
        model: models.Manifest_detail,
        as: "detail_manifest",
        required: false,
        include:[
          {
            model:models.Shipment,
            as:"shipment_detail",
            required:false
          }
        ]
      },
    ],
  };
  try {
    const { docs, pages, total } = await models["Manifest_header"].paginate(options);
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
}
const getManifestOsBerangkatByHubById=async(req,res)=>{
  try{
    let where;
  if (req && req.query.type == "id") {
    where = {
      id: req.params.id,
      company_id:req.decoded.company_id,
      is_confirm_outbound:false,
      hub_id:req.params.hub
    };
  } else {
    where = {
      manifest_id: req.params.id,
      company_id:req.decoded.company_id,
      is_confirm_outbound:false,
      hub_id:req.params.hub
    };
  }
  let shipmentData = await models.Manifest_header.findOne({
    where: where,
    include: [
      {
        model: models.Manifest_detail,
        as: "detail_manifest",
        required: false,
        include:[
          {
            model:models.Shipment,
            as:"shipment_detail",
            required:false
          }
        ]
      },
    ],
  });
  if (!shipmentData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  return ReS(res, { data: shipmentData }, 200);
  } catch(error){
    return ReE(res, error, 404);
  }
}
const getManifestOsBerangkatById=async(req,res)=>{
  try{
    let where;
  if (req && req.query.type == "id") {
    where = {
      id: req.params.id,
      company_id:req.decoded.company_id,
      is_confirm_outbound:false,
    };
  } else {
    where = {
      manifest_id: req.params.id,
      company_id:req.decoded.company_id,
      is_confirm_outbound:false,
    };
  }
  let shipmentData =( await models.Manifest_header.findOne({
    where: where,
    include: [
      {
        model: models.Manifest_detail,
        as: "detail_manifest",
        required: false,
        include:[
          {
            model:models.Shipment,
            as:"shipment_detail",
            required:false
          }
        ]
      },
    ],
  })).toJSON();
  const companyData = await models.Company.findAll({where:{city_code:shipmentData.hub_id},attributes:['company_id','company_name','alias']});
  if (companyData && companyData.length>0){
    shipmentData.company_branch_id=companyData[0].company_id;
    shipmentData.company_branch_name=companyData[0].company_name;
  }
  if (!shipmentData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  return ReS(res, { data: shipmentData }, 200);
  } catch(error){
    return ReE(res, error, 404);
  }
}
module.exports={
    unmanifestSummaryByHub,
    unmanifestByHubDetail,
    unmanifestByHubByShipment,
    simpanManifest,
    getManifest,
    getManifestOsBerangkat,
    getManifestOsBerangkatByHubById,
    getManifestByManifestId,
    getManifestOsBerangkatById
}