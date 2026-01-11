const async = require('async');
const path = require('path');
const {to,ReE,ReS
} = require("../utils/response");
const pdf = require('html-pdf');
const models = require("../models");
const custom = require("../middleware/custom");
const {Op} = require("../models/index").Sequelize;
const ShortUniqueId = require('short-unique-id');
const ejs = require('ejs');
const moment = require('moment');
const fs = require('fs');
const imageToBase64 = require('image-to-base64');
const currencyFormatter = require('currency-formatter');
const { mShipmentInclude} = require('./shipment.controller');
const imgTo64 = async (path) => {
    return new Promise(function (resolve, reject) {
        imageToBase64(path) // Path to the image
            .then(
                (response) => {
                    resolve(response);
                }
            )
            .catch(
                (err) => {
                    reject(err);
                }
            )
    })
};
const form = {
    RESI:  async (req) => {
        let where;
        let img = await imgTo64(path.join(path.dirname(fs.realpathSync(__filename)), '../../files/logo/logo_black.png'));
        let shipmentData = await models.Shipment.findOne({
            where: {shipment_awb:req.params.id},
            include: [...mShipmentInclude(), {
                model: models.Company,
                as: "agen",
                required: false,
            }],
        });
        return new Promise(function (resolve, reject) {
            try {
                if (req && req.query.type == "id") {
                    where = {
                        id: req.params.id,
                    };
                } else {
                    where = {
                        shipment_awbm: req.params.id,
                    };
                }
                if (req.query.format && req.query.format == 'RESI_1') {
                    pg = ejs.compile(fs.readFileSync(__dirname + '/../views/resi/resi_1.ejs', 'utf8'));
                } else if (req.query.format && req.query.format == 'RESI_3') {
                    pg = ejs.compile(fs.readFileSync(__dirname + '/../views/resi/resi_3.ejs', 'utf8'));
                } else {
                    pg = ejs.compile(fs.readFileSync(__dirname + '/../views/resi/resi_2.ejs', 'utf8'));
                }
                let cnt = pg({
                    img: img,
                    shipment: shipmentData,
                    detail: shipmentData.detail_reff,
                    company: shipmentData.agen,
                    currencyFormatter: currencyFormatter,
                    moment: moment
                });
                var options = {
                    preferCSSPageSize: true,
                    image: {
                        type: 'jpeg',
                        quality: 1
                    },
                    format: 'A4',
                    margin: {
                        top: 0
                    },
                };
                const uid = new ShortUniqueId();
                const xUid = uid.stamp(32);
                let pth = `${__dirname}../../../files/rpt/${xUid}.pdf`;
                pdf.create(cnt, options).toFile(pth, function (err, r) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(`${xUid}.pdf`)
                    }
                });
            } catch (err) {
                reject(err)
            }
    })
    },
    MANIFEST:async(req)=>{
        let where;
        let img = await imgTo64(path.join(path.dirname(fs.realpathSync(__filename)), '../../files/logo/logo_black.png'));
        const companyData = await models.Company.findOne({company_id:req.decoded.company_id});
        const companyGroup = await models.Company_group.findOne({company_group_id:req.decoded.company_group_id});
        let shipmentData = await models.Manifest_header.findOne({
            where:{manifest_id:req.params.id},
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
        return new Promise(function (resolve, reject) {
            try {
                // if (req.query.format && req.query.format == 'RESI_1') {
                    pg = ejs.compile(fs.readFileSync(__dirname + '/../views/suratjalan/manifest.ejs', 'utf8'));
                // } else {
                    // pg = ejs.compile(fs.readFileSync(__dirname + '/../views/resi/resi_2.ejs', 'utf8'));
                // }
                let cnt = pg({
                    img: img,
                    data: shipmentData,
                    currencyFormatter: currencyFormatter,
                    company:companyData,
                    companyGroup:companyGroup,
                    moment: moment
                });
                var options = {
                    preferCSSPageSize: true,
                    image: {
                        type: 'jpeg',
                        quality: 1
                    },
                    format: 'A4',
                    margin: {
                        top: 0
                    },
                };
                const uid = new ShortUniqueId();
                const xUid = uid.stamp(32);
                let pth = `${__dirname}../../../files/rpt/${xUid}.pdf`;
                pdf.create(cnt, options).toFile(pth, function (err, r) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(`${xUid}.pdf`)
                    }
                });
            } catch (err) {
                reject(err)
            }
    })
    },
    SJ_MANIFEST:async(req)=>{
        let where;
        let img = await imgTo64(path.join(path.dirname(fs.realpathSync(__filename)), '../../files/logo/logo_black.png'));
        const companyData = await models.Company.findOne({where:{company_id:req.decoded.company_id}});
        const companyGroup = await models.Company_group.findOne({where:{company_group_id:req.decoded.company_group_id}});
        const shipmentData = await models.Assignment_manifest.findOne({
            where:{
              assignment_id:req.params.id
            },
            include: [
              {
                model: models.Company,
                as: 'company_branch',
                required: false,
              },
              {
                model: models.Assignment_manifest_detail,
                as: 'assignment_manifest_detail',
                required: false,
                order: [['company_branch_id', 'ASC']],
                include: [
                  {
                    model: models.Manifest_header,
                    as: 'manifest_detail',
                    required: false,
                  },
                ],
              },
            ],
          })
        return new Promise(function (resolve, reject) {
            try {
                pg = ejs.compile(fs.readFileSync(__dirname + '/../views/suratjalan/manifest_sj.ejs', 'utf8'));
                let cnt = pg({
                    img: img,
                    data: shipmentData,
                    currencyFormatter: currencyFormatter,
                    company:companyData,
                    companyGroup:companyGroup,
                    moment: moment
                });
                var options = {
                    // preferCSSPageSize: true,
                    image: {
                        type: 'jpeg',
                        quality: 1
                    },
                    displayHeaderFooter:true,
                    headerTemplate:'<div>Test</div>',
                    footerTemplate:'<div>Test</div>'
                    // format: 'A4',
                };
                const uid = new ShortUniqueId();
                const xUid = uid.stamp(32);
                let pth = `${__dirname}../../../files/rpt/${xUid}.pdf`;
                pdf.create(cnt, options).toFile(pth, function (err, r) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(`${xUid}.pdf`)
                    }
                });
            } catch (err) {
                reject(err)
            }
    })
    },
    SEWA_GUDANG:async(req)=>{
        let where;
        const img = await imgTo64(path.join(path.dirname(fs.realpathSync(__filename)), '../../files/logo/logo_profile.png'));
        const shipmentData = await models.Smu.findOne({
            where: {smu_no:req.params.id}

        });

        const company= await models.Company_group.findOne({
            where:{company_group_id:req.decoded.company_group_id}
        })
        const contact = await models.Contact.findOne({
            where:{contact_id:shipmentData.partner_id}
        })

        return new Promise(function (resolve, reject) {
            try {
                if (req && req.query.type == "id") {
                    where = {
                        id: req.params.id,
                    };
                } else {
                    where = {
                        shipment_awbm: req.params.id,
                    };
                }

                    pg = ejs.compile(fs.readFileSync(__dirname + '/../views/smu/sewa_gudang.ejs', 'utf8'));

                let cnt = pg({
                    img: img,
                    company:company,
                    shipmentData,contact,
                    currencyFormatter: currencyFormatter,
                    moment: moment,
                    user:req.decoded
                });
                var options = {
                    preferCSSPageSize: true,
                    image: {
                        type: 'jpeg',
                        quality: 1
                    },

                    margin: {
                        top: 0
                    },
                };
                const uid = new ShortUniqueId();
                const xUid = uid.stamp(32);
                let pth = `${__dirname}../../../files/rpt/${xUid}.pdf`;
                pdf.create(cnt, options).toFile(pth, function (err, r) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(`${xUid}.pdf`)
                    }
                });
            } catch (err) {
                reject(err)
            }
    })
    },
    INVOICE:async(req)=>{


        let where;
        let img = await imgTo64(path.join(path.dirname(fs.realpathSync(__filename)), '../../files/logo/logo_black.png'));
        const invoiceData = await models.Invoice.findOne({
            where:{
              id:req.params.id,

            },
            include: [
              {
                model: models.Invoice_detail,
                as: 'invoice_detail',
                required: false,
                include: [
                  {
                    model: models.Shipment,
                    as: 'shipment_detail',
                    required: false,
                  },
                ],
              },
            ],

          })


        const company= await models.Company.findOne({
            where:{company_id:invoiceData.company_id}
        })
        const invoiceBank = await models.Company_bank.findAll({
            where:{company_id:invoiceData.company_id , isPrint: true}
        })
        return new Promise(function (resolve, reject) {
            try {

                let type='invoice';
                if (req.query.format){
                    type+=req.query.format
                } else{
                    type+='A';
                }
                pg = ejs.compile(fs.readFileSync(__dirname + `/../views/invoice/${type}.ejs`, 'utf8'));
                let cnt = pg({
                    img: img,
                    invoice: invoiceData,
                    detail: invoiceData.invoice_detail,
                    company: company,
                    paymentInfo: invoiceBank,
                    moment: moment,
                    user:req.decoded
                });
                var options = {
                    preferCSSPageSize: true,
                    image: {
                        type: 'jpeg',
                        quality: 1
                    },
                    format: 'A4',
                    margin: {
                        top: 0
                    },
                };
                const uid = new ShortUniqueId();
                const xUid = uid.stamp(32);
                let pth = `${__dirname}../../../files/rpt/${xUid}.pdf`;
                pdf.create(cnt, options).toFile(pth, function (err, r) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(`${xUid}.pdf`)
                    }
                });
            } catch (err) {
                reject(err)
            }
    })
    },
    INVOICE_WH:async(req)=>{

        console.log('--->>>wh')
        let where;
        let img = await imgTo64(path.join(path.dirname(fs.realpathSync(__filename)), '../../files/logo/logo_black.png'));
        const invoiceData = await models.Invoice.findOne({
            where:{
              id:req.params.id,

            },
            include: [
                {
                    model: models.Invoice_detail_wh,
                    as: 'invoice_detail_wh',
                    required: false,
                    include: [
                      {
                        model: models.Smu,
                        as: 'smu_detail',
                        required: false,
                      },
                    ],
                  },
            ],

          })


        const company= await models.Company.findOne({
            where:{company_id:invoiceData.company_id}
        })
        const invoiceBank = await models.Company_bank.findOne({
            where:{id:invoiceData.payment_id}
        })

        // console.log(invoiceData)

        return new Promise(function (resolve, reject) {
            try {

                let type='invoice';
                if (req.query.format){
                    type+=req.query.format
                } else{
                    type+='A';
                }
                pg = ejs.compile(fs.readFileSync(__dirname + `/../views/invoice/${type}.ejs`, 'utf8'));


                let cnt = pg({
                    img: img,
                    invoice: invoiceData,
                    detail: invoiceData.invoice_detail_wh,
                    company: company,
                    paymentInfo: invoiceBank,
                    moment: moment,
                    user:req.decoded
                });
                var options = {
                    preferCSSPageSize: true,
                    image: {
                        type: 'jpeg',
                        quality: 1
                    },
                    format: 'A4',
                    margin: {
                        top: 0
                    },
                };
                const uid = new ShortUniqueId();
                const xUid = uid.stamp(32);
                let pth = `${__dirname}../../../files/rpt/${xUid}.pdf`;
                pdf.create(cnt, options).toFile(pth, function (err, r) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(`${xUid}.pdf`)
                    }
                });
            } catch (err) {
                reject(err)
            }
    })
    }
}
const printx = async (req, res, next) => {
    const errReturn = function (message) {
        return ReE(res, message, 403);
      };
    if (!req.query.report){
        return errReturn('Jenis report yang di inginkan tidak ada');
    };
    let result;
    let url=req.protocol + '://' + req.get('host') ;

    try {
    switch (req.query.report.toLowerCase()) {
        case 'resi':
            result = await form.RESI(req);
            return ReS(res, {data:{
                filename:result,
                link:`${url}/files/rpt/${result}`
            }}, 200);

        case 'manifest':
            result = await form.MANIFEST(req);
            return ReS(res, {data:{
                filename:result,
                link:`${url}/files/rpt/${result}`
            }}, 200);
        case 'sjmanifest':
            result = await form.SJ_MANIFEST(req);
            return ReS(res, {data:{
                filename:result,
                link:`${url}/files/rpt/${result}`
            }}, 200);
        case 'smusewagudang':
            result = await form.SEWA_GUDANG(req);
            return ReS(res, {data:{
                filename:result,
                link:`${url}/files/rpt/${result}`
            }}, 200);
        
        case 'invoice':
            result = await form.INVOICE(req);            
            console.log('====================================');
            console.log(result);
            console.log('====================================');
            return ReS(res, {data:{
                filename:result,
                link:`${url}/files/rpt/${result}`
            }}, 200);
            case 'invoicewh':
                result = await form.INVOICE_WH(req);
                return ReS(res, {data:{
                    filename:result,
                    link:`${url}/files/rpt/${result}`
                }}, 200);
        default:
            errReturn('')
     }
    } catch (err) {
       return errReturn(err)
    }
}
module.exports = {
    printx
}