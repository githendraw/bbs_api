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
const s = require("../models/index").sequelize;


const getContact=async(req,res)=>{
    let user = req.decoded;
    let pg = req.query.pg || 1;
    const companyId=req.params.company_id;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  
    
    let options = {
      where: {
        contact_type: req.params.type,
    
      },
    };
    if (req.params.company_id!=='ALL'){
      options.where.company_id= companyId
    }
    options.page = pg;
    options.paginate = limit;
    options.order = [["updated", "DESC"]];
    if (req.query && req.query.term) {
      if (req.params.type == "internal") {
        options.where = {
          contact_type: {
            [Op.in]: ["internal", "driver"],
          },
          [Op.or]: [
            {
              contact_id: {
                [Op.iLike]: `%${req.query.term}%`,
              },
            },
            {
             
              name: {
                [Op.iLike]: `%${req.query.term}%`,
              },
            },

          ],
        };
      } else {
        options.where = {
          contact_type: req.params.type,
          [Op.or]: [
            {
              contact_id: {
                [Op.iLike]: `%${req.query.term}%`,
              }
            },
            {
             
              name: {
                [Op.iLike]: `%${req.query.term}%`,
              },
            },
          ],
        };
      }
    } else {
      if (req.params.type == "internal") {
        options.where = {
          contact_type: {
            [Op.in]: ["internal", "driver"],
          },
        };
      } else {
        options.where = {
          contact_type: req.params.type
        };
      }
    }
    try {

      console.log(options.where)
      if (req.params.company_id!=='ALL'){
        options.where.company_id= companyId
      }
      const { docs, pages, total } = await models["Contact"].paginate(options);
      let rsp = {
        total: total,
        current: pg,
        pages: pages,
        limit: limit,
        data: docs,
      };
      return ReS(res, rsp, 200);
    } catch (err) {
      return ReE(res, err, 403);
    }
}

module.exports={
    getContact
}