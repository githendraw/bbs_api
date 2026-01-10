const models = require('../models');
const {to, ReE, ReS} = require('../utils/response');
const CONFIG = require('../config/config');
const async = require('async');
const {Op} = require('../models/index').Sequelize;
const tracing = {
    tracingPublic: async(req, res, next) => {
        let hasil = {};
        let shipmentAwb=req.params.id;
        console.log(shipmentAwb)
        let shipment = await models
            .Shipment
            .findOne({


                where: {

                            shipment_awbm: shipmentAwb
                        },

                include:[
                    {
                        model: models.Shipment_detail_reff,
                        as: "detail_reff",
                        required: false
                    },
                    {
                        model: models.Contact,
                        as: 'contact',
                        required: false,
                      },

                ],

            });

        console.log(shipment)
        if (!shipment) {
            return ReE(res, 'tidak di temukan', 404)
        }

        let shipmentDetail = await models
        .History
        .findAll({
            where: {
                shipment_awb: shipment.shipment_awb
            },
            order: [
                ['history_date', 'ASC']
            ],
            include: [
                {
                    model: models.Status,
                    as: "status",
                    required: false
                }
            ]
        })

        console.log(shipmentDetail)
    if (!shipmentDetail) {
        shipment.history = [];
    } else {
        shipment.history = shipmentDetail;
    }
        return ReS(res, {
            data: {
                shipment,
                history:shipmentDetail
            }
        }, 201);

    },
    tracingAgen: async(req, res, next) => {
        let hasil = {};
        let shipment = await models
            .Shipment
            .findOne({
                where: {
                    [Op.or]: [
                        {
                            shipment_awb: req.params.id
                        }, {
                            shipment_awbm: req.params.id
                        }
                    ]
                },
                raw: true
            });
        if (!shipment) {
            return ReE(res, 'tidak di temukan', 404)
        }
        let shipmentDetail = await models
            .History
            .findAll({
                where: {
                    shipment_awb: shipment.shipment_awb
                },
                order: [
                    ['history_date', 'ASC']
                ],
                include: [
                    {
                        model: models.Status,
                        as: "status",
                        required: false
                    }
                ]
            })
        if (!shipmentDetail) {
            shipment.history = [];
        } else {
            shipment.history = shipmentDetail;
        }
        return ReS(res, {
            data: shipment.history
        }, 201);
    },
    tracingAgenDetail: async(req, res, next) => {
        let hasil = {};
        let shipment = await models
            .Shipment
            .findOne({
                where: {
                    [Op.or]: [
                        {
                            shipment_awb: req.params.id
                        }, {
                            shipment_awbm: req.params.id
                        }
                    ]
                },
                raw: true
            });
        if (!shipment) {
            return ReE(res, 'tidak di temukan', 404)
        }

        return ReS(res, {
            data: shipment
        }, 201);
    }
}
module.exports = tracing