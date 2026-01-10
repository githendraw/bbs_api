const { to, ReE, ReS } = require("../utils/response");
const async = require("async");
const { body, validationResult } = require("express-validator");
const CONFIG = require("../config/config");
const message = require("../utils/message");
const logger = require("../utils/logger");
const models = require("../models");
const numbering = require("../middleware/numbering");
const custom = require("../middleware/custom");
const { Op } = require("../models/index").Sequelize;
const { v1: uuidv1 } = require("uuid");
const s = require("../models/index").sequelize;

const bellNotification=async(req,res)=>{

    let user = req.decoded;
    try {
        let result =[];


        const incoming=await models.Assignment_manifest_detail.findAll({
            limit:10,
            where:{
                company_branch_id:user.company_id,
                // is_confirm:true,
                is_incoming_wh:false
            },
            include: [

                {
                  model: models.Assignment_manifest,
                  as: "assignment_manifest",
                  required: false,
                  include:[
                    {
                      model: models.Contact,
                      as: "vendor",
                      required: false,
                    },
                  ]
                },

                {
                  model: models.Company,
                  as: "company_origin",
                  required: false,
                },


              ],

        })

        result = await Promise.all(incoming.map(async (item)=>{
            return {
                type:'INCOMING',
                id:item.assignment_id,
                date:item.assignment_manifest.assignment_date,
                  from:item.company_origin.company_name,
                  hub:item.company_origin.city_code,
                  by:item.assignment_manifest.vendor.name

            }
        }))


        return ReS(res, {data:result}, 200);
      } catch (err) {
        return ReE(res, err.message, 403);
      }

}


module.exports={
    bellNotification
}