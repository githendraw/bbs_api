require('express-router-group');
const models = require('../models');
const { to, ReE, ReS } = require('../utils/response');
const CONFIG = require('../config/config');
const numbering = require('../middleware/numbering');
const { body, validationResult } = require('express-validator');
const async = require('async');
const { mShipmentInclude } = require('../controllers/shipment.controller');
const custom = require('../middleware/custom');
const message = require('../utils/message');
const logger = require('../utils/logger');
const { Op } = require('../models/index').Sequelize;
const s = require('../models/index').sequelize;
const moment=require('moment')
const history = require('../middleware/history');
const SHIPMENT_FILTER=async(req,res)=>{
        let user = req.decoded;

        let companyId=req.params.company_id;
        let pg = req.query.pg || 1;
        let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
        const shipmentInclude = mShipmentInclude();
        const mOSManifest = () => {
            return {
              is_incoming_wh: true,
              is_manifest: false,
            };
          };
        let order = [
          ['company_id', 'ASC'],
          ['shipment_date', 'DESC'],
          [ 'history', 'history_date', 'ASC' ]
        ];
        let src={};
        if (companyId !=='ALL'){
            src.company_id=companyId;
        }

        if (req.query.type == 'TOTALSHIPMENT' && req.query.type == 'ALL') {
            if (companyId !=='ALL'){
                src.company_id=companyId;
            }
    
        }
        if (req.query.type == 'OSINCOMINGWH') {
          
                src = {
                    is_incoming_wh: false,
                  };
           
             
        }
        if (req.query.type == 'OSMANIFEST') {
          src = {
         
            ...mOSManifest(),
          };
    
          
        }
        if (req.query.type == 'OSDEPARTURE') {
          src = {
       
            is_incoming_wh: true,
            is_manifest: true,
            is_departure: false,
          };
         
        }
        if (req.query.type == 'OSARRIVAL') {
          src = {
           
            is_incoming_wh: true,
            is_manifest: true,
            is_departure: true,
            is_arrive: false,
          };
        
        }
        if (req.query.type == 'OSDELIVERY') {
          src = {
            
            is_incoming_wh: true,
            is_manifest: true,
            is_departure: true,
            is_arrive: true,
            is_delivery: false,
          };
        }
        if (req.query.type == 'OSRECEIVE') {
        
          src = {
           
            is_incoming_wh: true,
            is_manifest: true,
            is_departure: true,
            is_arrive: true,
            is_delivery: true,
            is_received: false,
          };
        
        }
        if (req.query.type == 'OSRETURNPOD') {
          src = {     
            is_incoming_wh: true,
            is_manifest: true,
            is_departure: true,
            is_arrive: true,
            is_delivery: true,
            is_received: true,
            is_return_pod: false,
          };
       
        }
        if (req.query.type=='OSINVOICE'){
          src={
            is_invoice:false
          }
        }
        if (req.query.type=='INVOICED'){
          src={
            is_invoice:true
          }
        }
        if (req.query.type=='ZEROAMOUNT'){
          src={
            total: {
              [Op.lte]: 0,
            },
            is_invoice: false,
          }
        }
        if (req.query.type=='PAID'){
          src={
            is_paid: true,
          }
        }


        if (req.query && req.query.term) {
          src = {
            ...src,
            [Op.or]: [
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
            ],
          };
        } else {
          src = {
            ...src,
          };
        }
     
        if (companyId!=='ALL') src.company_id=companyId;
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
          src.shipment_date = {
            [Op.between]: [st, ed],
          };
        }
        if (req.query.contact_id) {
          src.partner_id = req.query.contact_id;
        }

        let options = {
          where: src,
          order: order,
          page: pg,
          paginate: limit,
          include: [...shipmentInclude],
        };
        try {
          const { docs, pages, total } = await models['Shipment'].paginate(options);
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
            console.log(err);
          return ReE(res, err, 404);
        }
}
module.exports={
    SHIPMENT_FILTER
}