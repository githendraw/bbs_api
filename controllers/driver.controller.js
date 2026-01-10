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

const osDelivery= async(req,res)=>{
    const user  = req.decoded;
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let src = {
      contact_id: user.contact_id||null,
      is_confirm: false,
    };
    let options = {
      where: src,
      order: [["assignment_date", "ASC"]],
      page: pg,
      paginate: limit,
      include: [
        {
          model: models.Contact,
          as: "contact_detail",
          required: false,
        },
        {
          model: models.Assignment_delivery_detail,
  
          as: "assignment_delivery_detail",
          include: [
            {
              model: models.Shipment,
              as: "shipment_detail",
              attributes: [
                "shipment_awb",
                "shipment_awbm",
                "shipment_do",
                "shipment_date",
                "partner_name",
                "receiver_name",
                "receiver_address1",
                "receiver_phone1",
                "origin",
                "originname",
                "destination",
                "destinationname",
                "service_id",
                "uom_id",
                "weight",
                "moda_id",
                "route_id",
                "last_status",
                "last_status_remark",
              ],
              required: false,
            },
          ],
          required: false,
        },
      ],
    };
  
    try {
      const { docs, pages, total } = await models["Assignment_delivery"].paginate(
        options
      );
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
      return ReE(res, err, err.message);
    }
};
const activeDelivery = async (req, res) => {
    const user = req.decoded;
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let src = {
      contact_id: user.contact_id,
      is_confirm: true,
      is_finish: false,
    };
    let options = {};
  
    if (req.query && req.query.term) {
      options = {
        where: src,
        order: [["assignment_date", "ASC"]],
        page: pg,
        paginate: limit,
        include: [
          {
            model: models.Assignment_delivery_detail,
            where: {
              is_confirm: false,
            },
            as: "assignment_delivery_detail",
            include: [
              {
                model: models.Shipment,
                as: "shipment_detail",
                attributes: [
                  "shipment_awb",
                  "shipment_awbm",
                  "shipment_do",
                  "shipment_date",
                  "partner_name",
                  "receiver_name",
                  "receiver_address1",
                  "receiver_phone1",
                  "origin",
                  "originname",
                  "destination",
                  "destinationname",
                  "service_id",
                  "uom_id",
                  "weight",
                  "moda_id",
                  "last_status",
                  "last_status_remark",
                ],
                where: {
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
                      receiver_phone1: {
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
                },
                required: true,
              },
            ],
            required: false,
          },
        ],
      };
    } else {
      options = {
        where: src,
        order: [["assignment_date", "ASC"]],
        page: pg,
        paginate: limit,
        include: [
          {
            model: models.Assignment_delivery_detail,
            where: {
              is_confirm: false,
            },
            as: "assignment_delivery_detail",
            include: [
              {
                model: models.Shipment,
                as: "shipment_detail",
                attributes: [
                  "shipment_awb",
                  "shipment_awbm",
                  "shipment_date",
                  "shipment_do",
                  "partner_name",
                  "receiver_name",
                  "receiver_address1",
                  "receiver_phone1",
                  "origin",
                  "originname",
                  "destination",
                  "destinationname",
                  "service_id",
                  "uom_id",
                  "weight",
                  "moda_id",
                  "last_status",
                  "last_status_remark",
                ],
                required: false,
              },
            ],
            required: false,
          },
        ],
      };
    }
  
    try {
      const { docs, pages, total } = await models["Assignment_delivery"].paginate(
        options
      );
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
      return ReE(res, err, err.message);
    }
  };
module.exports={
    osDelivery,
    activeDelivery
}