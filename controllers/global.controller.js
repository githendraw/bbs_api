const models = require('../models');
const { to, ReE, ReS } = require("../utils/response");
const {body,validationResult} = require('express-validator');
const CONFIG = require('../config/config');
const {Op} = require('../models/index').Sequelize;
const async = require('async');
const getStatusMain = async(req, res) => {
    try {
        let dataX = await models.Status.findAll({
            order:[['status_urut','ASC']]
        });
        return ReS(res, {
            data:dataX
        }, 200);
    } catch (err) {
        return ReE(res, err, err.message)
    }
};
const getStatusList = async(req, res) => {
    try {
        let dataX = await models.Status_delivery.findAll({
            where :{
                status_id:{
                    [Op.iLike]: `RECEIVED%`
                }
            }
        });
        return ReS(res, {
            data:dataX
        }, 200);
    } catch (err) {
        return ReE(res, err, err.message)
    }
};
const getStatusFailed = async(req, res) => {
    try {
        let dataX = await models.Status_delivery.findAll({
            where :{
                status_id:{
                    [Op.iLike]: `FAILED%`
                }
            }
        });
        return ReS(res, {
            data:dataX
        }, 200);
    } catch (err) {
        return ReE(res, err, err.message)
    }
};
const defaultData = async(req, res) => {
    try {
        let dataUom = await models.Uom.findAll({
             raw:true
        });
        let dataService = await models.Services.findAll({
            raw:true
       });
       let dataModa=[{
        moda_id: 'A',
        moda_desc: 'AIR'
    }, {
        moda_id: 'L',
        moda_desc: 'LAND'
    }, {
        moda_id: 'S',
        moda_desc: 'SEA'
    }];
        return ReS(res, {
            data:{
                service:dataService,
                uom:dataUom,
                moda:dataModa
            }
        }, 200);
    } catch (err) {
        return ReE(res, err, err.message)
    }
};
const getMenu = async(req,res)=>{
    try {
        let dataX = await models.Status_delivery.findAll({
            where :{
                status_id:{
                    [Op.iLike]: `FAILED%`
                }
            }
        });
        return ReS(res, {data:dataX}, 200);
    } catch (err) {
        return ReE(res, err, err.message)
    }
}
module.exports={
    getStatusList,
    getStatusFailed,
    getStatusMain,
    defaultData
}
