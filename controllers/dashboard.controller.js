const { to, ReE, ReS } = require("../utils/response");
const async = require("async");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const CONFIG = require("../config/config");
const message = require("../utils/message");
const logger = require("../utils/logger");
const models = require("../models");
const { Op } = require("../models/index").Sequelize;
const s = require("../models/index").sequelize;
const custom=require('../middleware/custom')
let queryShipment = ` SELECT
        S.shipment_awbm,
        S.shipment_date,
        S.partner_id ,
        S.partner_name,
        S.partner_pic ,
        S.partner_address1,
        S.partner_phone1,
        S.receiver_id ,
        S.receiver_name ,
        S.receiver_pic ,
        S.receiver_address2 ,
        S.receiver_phone1 ,
        S.service_id ,
        S.moda_id ,
        S.weight ,
        S.weight_actual,
        S.weight_vol,
        S.uom_id ,
        S.qty ,
        S.origin ,
        S.originname ,
        S.destination ,
        S.destinationname ,
        S.itemdesc,
        S.last_status_remark,
        count(*) OVER() AS total_rows
        FROM
        "Shipment" S `;
const shipmentSummary = async (req, res) => {
  let user = req.decoded;
  let hasil = {};
  let whereCondition = {
    company_id: user.company_id,
  };
  if (req.query && req.query.filter == "customer") {
    whereCondition.partner_id = req.query.contact_id;
  }
  async.waterfall(
    [
      (cb) => {
        models.Shipment.findAll({
          attributes: [
            [
              s.fn(
                "count",
                s.col("shipment_awb")
              ),
              "totalShipment",
            ],
            [
              s.fn(
                "sum",
                s.literal(  
                  "CASE WHEN (is_incoming_wh=false) THEN 1 ELSE 0 END"
                )
              ),
              "osIncomingWH",
            ],
            [
              s.fn(
                "sum",
                s.literal(
                  "CASE WHEN (is_incoming_wh=true and is_manifest=false) THEN 1 ELSE 0 END"
                )
              ),
              "osManifest",
            ],
            [
              s.fn(
                "sum",
                s.literal(
                  "CASE WHEN (is_incoming_wh=true and is_manifest=true and is_departure=false) THEN 1 ELSE 0 END"
                )
              ),
              "osDeparture",
            ],
            [
              s.fn(
                "sum",
                s.literal(
                  "CASE WHEN (is_incoming_wh=true and is_manifest=true and is_departure=true and is_arrive=false) THEN 1 ELSE 0 END"
                )
              ),
              "osArrival",
            ],
            [
              s.fn(
                "sum",
                s.literal(
                  "CASE WHEN (is_incoming_wh=true and is_manifest=true and is_departure=true and is_arrive=true and is_delivery=false) THEN 1 ELSE 0 END"
                )
              ),
              "osDelivery",
            ],
            [
              s.fn(
                "sum",
                s.literal(
                  "CASE WHEN (is_incoming_wh=true and   is_departure=true and is_manifest=true and is_arrive=true and is_delivery=true and is_received=false) THEN 1 ELSE 0 END"
                )
              ),
              "osReceive",
            ],
            [
              s.fn(
                "sum",
                s.literal(
                  "CASE WHEN (is_incoming_wh=true and is_manifest=true and is_arrive=true and is_delivery=true and is_received=true and is_return_pod=false) THEN 1 ELSE 0 END"
                )
              ),
              "osReturnPOD",
            ],
            // [s.fn("sum", s.col("total")), "totalRevenue"],
            // [s.fn("count", s.col("shipment_awb")), "totalShipment"],
          ],
          where: whereCondition
        }).then(
          function (r) {
            if (r && r.length > 0) {
              hasil = r[0];
            } else {
              hasil = {};
            }
            cb(null, hasil);
          },
          function (e) {
            cb(e);
          }
        );
      },
      // (hasil,cb)=>{
      //   models.Shipment.findAll({
      //     order:[['shipment_date','desc']],
      //     limit:10
      //   }).then(
      //     function (r) {
      //       if (r && r.length > 0) {
      //         hasil.topTen = r;
      //       } else {
      //         hasil.topTen = {};
      //       }
      //       cb(null, hasil);
      //     },
      //     function (e) {
      //       cb(e);
      //     }
      //   );
      // }
    ],
    (e, r) => {
      if (e) {
        console.log(e);
        return ReE(res, e, "404");
      } else {
        return ReS(
          res,
          {
            data: r,
          },
          200
        );
      }
    }
  );
};
const shipmentSummaryByMonthYear=async(req,res)=>{
  const user = req.decoded;
  const start_date = req.query.start_date || null;
  const end_date = req.query.end_date || null;
  const typeReport=req.query.type||'harian';

  let st, ed;
  if (start_date) {
    st = moment(new Date(start_date)).format("YYYY-MM-DD 00:00:00");
    if (end_date) {
      ed = moment(new Date(end_date)).add(1,"day").format("YYYY-MM-DD 00:00:00");
    } else {
      ed = moment(new Date(start_date))
        .add(1, "day")
        .format("YYYY-MM-DD 00:00:00");
    }
  } else {
    st =null; //custom.getFirstAndLastDateYear().fDay
    ed =null  //custom.getFirstAndLastDateYear().lDay
  };
  let sRes=[];
  console.log(st,ed);
  let sql1;
  let sQry2;
   if (!st){
     sQry2=`where sh.company_id=?`;
     sRes= [user.company_id];
   }else{
    sQry2=`where sh.company_id=? and  sh.shipment_date between ? and ?`;
    sRes= [user.company_id, st, ed];
   }

   let sQry3
   
  
  if (typeReport==='harian'){
    sql1=`select extract(day from sh.shipment_date)  as hari, 	 extract(month from sh.shipment_date) as  bulan, extract(year from sh.shipment_date) as tahun`
    sQry3=`GROUP BY 1,2,3  order by tahun, bulan, hari`;
  };
  if (typeReport==='bulanan'){
    sql1=` select extract(month from sh.shipment_date) as  bulan, extract(year from sh.shipment_date) as tahun`
    sQry3=`GROUP BY 1,2  order by tahun, bulan`;
  };
  if (typeReport==='tahunan'){
    sql1=`select extract(year from sh.shipment_date) as tahun`
    sQry3=`GROUP BY 1  order by tahun`;

  };
  

  

  let sQry1=`${sql1},
  SUM(CASE WHEN sh.is_incoming_wh=false  THEN 1 ELSE 0 END) os_incoming_wh,
  SUM(CASE WHEN sh.is_incoming_wh=true and sh.is_manifest=false THEN 1 ELSE 0 END) os_manifest,
  SUM(CASE WHEN sh.is_incoming_wh=true and sh.is_manifest=true and sh.is_departure=false THEN 1 ELSE 0 END) os_departure,
  SUM(CASE WHEN sh.is_incoming_wh=true and sh.is_manifest=true and sh.is_departure=true and sh.is_arrive=false THEN 1 ELSE 0 END) os_arrival,
  SUM(CASE WHEN sh.is_incoming_wh=true and sh.is_manifest=true and sh.is_departure=true and sh.is_arrive=true and sh.is_delivery=false THEN 1 ELSE 0 END) os_delivery,
  SUM(CASE WHEN sh.is_incoming_wh=true and  sh.is_manifest=true and sh.is_arrive=true and sh.is_delivery=true and sh.is_received=false THEN 1 ELSE 0 END) os_received,
  SUM(CASE WHEN sh.is_incoming_wh=true and  sh.is_manifest=true and sh.is_arrive=true and sh.is_delivery=true and sh.is_received=true THEN 1 ELSE 0 END) received,
  SUM(CASE WHEN  sh.is_incoming_wh=true and sh.is_manifest=true and sh.is_received=true and sh.is_return_pod=false THEN 1 ELSE 0 END) os_return,
  COUNT(sh.shipment_awb) as total_shipment 
   from "Shipment" sh`;
   
   
   let sQry=`${sQry1} ${sQry2} ${sQry3}`;
   console.log(sQry);
   s.query(sQry, {
    replacements: sRes,
    type: s.QueryTypes.SELECT,
  })
  .then(function (data)   {
    return ReS(
      res,
      {
        data: data,
      },
      200
    );
  })
  .catch(function (err) {
    return ReE(res, err.message, 402);
  });
};

const shipmentSummaryProvince=async(req,res)=>{
  const user = req.decoded;
  const start_date = req.query.start_date || null;
  const end_date = req.query.end_date || null;
  const typeReport=req.query.type||'harian';
  let st, ed;
  if (start_date) {
    st = moment(new Date(start_date)).format("YYYY-MM-DD 00:00:00");
    if (end_date) {
      ed = moment(new Date(end_date)).add(1,"day").format("YYYY-MM-DD 00:00:00");
    } else {
      ed = moment(new Date(start_date))
        .add(1, "day")
        .format("YYYY-MM-DD 00:00:00");
    }
  } else {
    st =null; //custom.getFirstAndLastDateYear().fDay
    ed =null  //custom.getFirstAndLastDateYear().lDay
  };
  let sRes=[];
  console.log(st,ed);
  let sql1;
  let sQry2;
   if (!st){
     sQry2=`where sh.company_id=?`;
     sRes= [user.company_id];
   }else{
    sQry2=`where sh.company_id=? and  sh.shipment_date between ? and ?`;
    sRes= [user.company_id, st, ed];
   }

   sql1=`
   SELECT
   prv.province_name,
   prv.latitude,
   prv.longitude,
   shpp.ttl 
 FROM
   "Province" prv
   INNER JOIN (
   SELECT SUM
     ( shp.total_shipment ) ttl,
     kota.province_id 
   FROM
     (
     SELECT COUNT
       ( sh.shipment_awb ) AS total_shipment,
       destination 
     FROM
       "Shipment" sh 
     
      ${sQry2}

     GROUP BY
       destination 
     ) shp
     INNER JOIN (
     SELECT
       "P".province_id,
       "P".country_id,
       "P".province_name,
       "P".longitude,
       "P".latitude,
       "H".hub_id,
       "H".hub_name,
       "D".dest_id,
       "D".city,
       "D".dest_name 
     FROM
       "Destination" AS "D"
       INNER JOIN "Hub" AS "H" ON "D".hub_id = "H".hub_id
       INNER JOIN "Province" AS "P" ON "H".province_id = "P".province_id 
     ) kota ON shp.destination = kota.dest_id 
   GROUP BY
     kota.province_id 
   ) shpp ON prv.province_id = shpp.province_id 
 ORDER BY
   prv.province_name
   `
   s.query(sql1, {
    replacements: sRes,
    type: s.QueryTypes.SELECT,
  })
  .then(function (data)   {
    return ReS(
      res,
      {
        data: data,
      },
      200
    );
  })
  .catch(function (err) {
    return ReE(res, err.message, 402);
  });

}
module.exports = {
  shipmentSummary,
  shipmentSummaryByMonthYear,
  shipmentSummaryProvince
};
