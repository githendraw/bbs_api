require('express-router-group');
const models = require('./models');
const {to, ReE, ReS} = require('./utils/response');
const CONFIG = require('./config/config');
const { Op } = require("./models/index").Sequelize;
const moment = require('moment');


const x=async()=>{

try {

    let st = moment(new Date(2022,6,1)).format('YYYY-MM-DD 00:00:00');

    console.log(st)

    let dataDelivery = await models.Assignment_delivery.findAll({
        where:{
            assignment_date:{
                [Op.lt]:st
            }
        }
    });
console.log(dataDelivery.length)
    dataDelivery.map(async(s)=>{
        console.log('----Delivery',s.id)
        await models.Assignment_delivery_detail.destroy({
            where :{delivery_id:s.delivery_id}
        })
        await models.Assignment_delivery_reject.destroy({
            where :{delivery_id:s.delivery_id}
        })
        await models.Assignment_delivery.destroy({
            where :{delivery_id:s.delivery_id}
        })


    })


    let dataManifest = await models.Assignment_manifest.findAll({
        where:{
            assignment_date:{
                [Op.lt]:st
            }
        }
    });
    console.log(dataManifest.length)
    dataManifest.map(async(s)=>{
        await models.Assignment_manifest_detail.destroy({
            where :{assignment_id:s.assignment_id}
        })

        await models.Assignment_manifest.destroy({
            where :{assignment_id:s.assignment_id}
        })


    })

    let dataManifestx = await models.Manifest_header.findAll({
        where:{
            manifest_date:{
                [Op.lt]:st
            }
        }
    });
    console.log(dataManifestx.length)
    dataManifestx.map(async(s)=>{
        await models.Manifest_bagging.destroy({
            where :{manifest_id:s.manifest_id}
        })

        await models.Manifest_detail.destroy({
            where :{manifest_id:s.manifest_id}
        })


        await models.Manifest_header.destroy({
            where :{manifest_id:s.manifest_id}
        })


    })

    let dataInvoice = await models.Invoice.findAll({
        where:{
            invoice_date:{
                [Op.lt]:st
            }
        }
    });
    console.log(dataInvoice.length)
    dataInvoice.map(async(s)=>{
        await models.Invoice_detail.destroy({
            where :{invoice_id:s.invoice_id}
        })

        await models.Invoice.destroy({
            where :{invoice_id:s.invoice_id}
        })




    })

    let dataX = await models.Shipment.findAll({
        where:{
            shipment_date:{
                [Op.lt]:st
            }
        }
    });
    console.log(dataX.length)
    dataX.map(async(s)=>{
        console.log(s.shipment_awb);
        await models.History.destroy({
            where :{shipment_awb:s.shipment_awb}
        })


        await models.Invoice_detail.destroy({
            where :{shipment_awb:s.shipment_awb}
        })

        await models.Manifest_detail.destroy({
            where :{shipment_awb:s.shipment_awb}
        })


        await models.Assignment_delivery_detail.destroy({
            where :{shipment_awb:s.shipment_awb}
        })

        await models.Shipment_detail.destroy({
            where :{shipment_awb:s.shipment_awb}
        })
        await models.Shipment_detail_reff.destroy({
            where :{shipment_awb:s.shipment_awb}
        })
        await models.Shipment.destroy({
            where :{shipment_awb:s.shipment_awb}
        })


    })

    console.log('-------')

 } catch (err) {
   console.log(err)
}
}



x();
