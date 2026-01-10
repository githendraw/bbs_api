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


const saveCustomer = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ReE(res, errors.array(), 404);
    }
    try {
        let bd = req.body;
        let contact_type = req.params.type;
        let kodePrefix;
        const errReturn = function (message) {
          return ReE(res, message, 403);
        };
        const user = req.decoded;
        
       
        kodePrefix = "CG";
        let numeric = await numbering.CONTACTGROUP({
          decoded: user,
          kode: kodePrefix,
          type: contact_type,
        });
        bd.contact_id = numeric.numeric;
        if (!bd.contact_reff) {
          bd.contact_reff = numeric.numeric;
        }
        bd.usrUpd = user.email;
        let create = await models.Contact_group.create({ ...bd });
        return ReS(
          res,
          {
            data: create,
          },
          200
        );
      } catch (err) {
        console.log(err);
        return ReE(res, err, 403);
      }

}
const getCustomer = async(req,res)=>{

}
module.exports={
    saveCustomer,
    getCustomer
}
