const async = require('async');
const models = require('../models');
const moment = require('moment');
const func = require('./custom');
const { Op } = require('../models/index').Sequelize;
const s = require('../models/index').sequelize;
const { v1: uuidv1 } = require('uuid');
const sprintf = require('sprintf-js').sprintf;
const getStringNumber = function (num, size) {
  num ? num : 0;
  var sign = Math.sign(num) === -1 ? '-' : '';
  return (
    sign +
    new Array(size)
      .concat([Math.abs(num)])
      .join('0')
      .slice(-size)
  );
};
const formatDateString = function (date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear().toString().substr(-2);
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('');
};
const formatDateString2 = function () {
  var d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear().toString().substr(-2);
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month].join('');
};
const penomoran = (data, cb) => {
  let hasil = {};
  let dtUser = data.decoded;
  if (dtUser && !dtUser.id_company) {
    dtUser.id_company = 'CM001';
  }
  async.waterfall(
    [
      function number1(cb) {
        hasil.number1 = uuidv1();
        cb(null, hasil);
      },
      function checkPenomoran(hasil, cb) {
        try {
          models.Prefix_code.findOne({
            where: {
              kode_id: data.kode,
              id_company: dtUser.id_company,
            },
            raw: true,
          }).then((dtNomor) => {
            if (dtNomor) {
              hasil.addNomor = false;
            } else {
              hasil.addNomor = true;
            }
            cb(null, hasil);
          });
        } catch (err) {
          cb(err);
        }
      },
      function insertPenomoran(hasil, cb) {
        // ;
        let dtSimpan = {
          kode_id: data.kode,
          id_company: dtUser.id_company,
          kode_prefix: data.prefixKode,
          keterangan: data.kode,
          numbering: 0,
        };
        if (hasil.addNomor) {
          models.Prefix_code.build(dtSimpan)
            .save()
            .then((response) => {
              cb(null, hasil);
            })
            .catch((err) => {
              cb(err);
            });
        } else {
          cb(null, hasil);
        }
      },
      function buatNomor(hasil, cb) {
        // ;
        let panjang = data.panjang ? data.panjang : 6;
        try {
          models.Prefix_code.findOne({
            where: {
              kode_id: data.kode,
              id_company: dtUser.id_company,
            },
            raw: true,
          }).then((cariNomor) => {
            hasil.lastNum = parseInt(cariNomor.numbering) + 1;
            if (data.is_company) {
              hasil.numeric = cariNomor.kode_prefix + dtUser.id_company + getStringNumber(hasil.lastNum, panjang); //nomor.Kode + nomor.KodeCabang + getStringNumber(parseFloat(nomor.Nomor) + 1, 8);
            } else {
              hasil.numeric = cariNomor.kode_prefix + getStringNumber(hasil.lastNum, panjang); //nomor.Kode + nomor.KodeCabang + getStringNumber(parseFloat(nomor.Nomor) + 1, 8);
            }
            cb(null, hasil);
          });
        } catch (err) {
          cb(err);
        }
      },
      function updateNomor(hasil, cb) {
        models.Prefix_code.update(
          {
            numbering: parseInt(hasil.lastNum),
          },
          {
            where: {
              kode_id: data.kode,
              id_company: dtUser.id_company,
            },
          }
        )
          .then((responses) => {
            cb(null, hasil);
          })
          .catch((err) => {
            cb(err);
          });
      },
    ],
    function (err, status) {
      if (err) {
        cb(err);
      } else {
        cb(null, status);
      }
    }
  );
};
const numbering = {
  CONTACT: async (data) => {
    let kodePrefix = `${data.decoded.company_id}${data.kode}`;
    let result;

    let contactData = await models.Contact.findAll({
      where: { contact_type: data.type, company_id: data.decoded.company_id },
      limit: 1,
      raw: true,
      attributes: ['contact_id'],
      order: [['created', 'DESC']],
    });

    console.log(contactData);

    if (contactData.length == 0) {
      result = {
        number1: uuidv1(),
        numeric: `${kodePrefix}${sprintf('%03d', 1)}`,
      };
    } else {
      let n = contactData[0].contact_id;

      console.log(n.substr(kodePrefix.length));
      n = parseInt(n.substr(kodePrefix.length)) + 1;
      result = {
        number1: uuidv1(),
        numeric: `${kodePrefix}${sprintf('%03d', n)}`,
      };
    }

    return await Promise.resolve({
      ...result,
    });
  },
  CONTACTGROUP: async (data) => {
    let kodePrefix = `${data.kode}`;
    let result;

    let contactData = await models.Contact_group.findAll({
      limit: 1,
      raw: true,
      attributes: ['contact_id'],
      order: [['created', 'DESC']],
    });

    console.log(contactData);

    if (contactData.length == 0) {
      result = {
        number1: uuidv1(),
        numeric: `${kodePrefix}${sprintf('%03d', 1)}`,
      };
    } else {
      let n = contactData[0].contact_id;

      console.log(n.substr(kodePrefix.length));
      n = parseInt(n.substr(kodePrefix.length)) + 1;
      result = {
        number1: uuidv1(),
        numeric: `${kodePrefix}${sprintf('%03d', n)}`,
      };
    }

    return await Promise.resolve({
      ...result,
    });
  },
  BRANCH: async (data) => {
    let kodePrefix = 'CM';
    let result;
    let companyData = await models.Company.findAll({
      limit: 1,
      raw: true,
      order: [['company_id', 'DESC']],
    });

    if (companyData.length == 0) {
      result = {
        number1: uuidv1(),
        numeric: 'CM001',
      };
    } else {
      let n = companyData[0].company_id;
      n = parseInt(n.substr(2)) + 1;
      result = {
        number1: uuidv1(),
        numeric: `${kodePrefix}${sprintf('%03d', n)}`,
      };
    }
    return await Promise.resolve({
      ...result,
    });
  },
  CN: async (req) => {
    let number1 = uuidv1();
    let panjang = 6;
    let lastNum;
    let num;
    let depanString = formatDateString2();
    try {
      let companyData = await models.Company.findOne({
        where: { company_id: req.decoded.company_id },
        raw: true,
      });
      const date = new Date().getFullYear().toString().substring(2, 4);
      const companyNo = `${companyData.city_code}${date}`;
      let lastShipmentData = await models.Shipment.findAll({
        where: {
          company_id: req.decoded.company_id,
          shipment_awbm: {
            [Op.iLike]: `${companyNo}%`,
          },
          is_reset_number:false
        },
        limit: 1,
        raw: true,
        attributes: ['shipment_awbm'],
        order: [['shipment_awbm', 'DESC']],
      });
      if (!companyData) {
        throw new Error('Data Perusahaan tidak ada');
      }
      lastShipmentData.length > 0 ? (lastNum = lastShipmentData[0].shipment_awbm) : (lastNum = null);
      let panjangPrefix = `${companyData.city_code}${depanString}`;
      if (!lastNum) {
        num = 1;
      } else {
        num = parseFloat(lastNum.substr(panjangPrefix.length, lastNum.length - panjangPrefix.length)) + 1;
      }
      return await Promise.resolve({
        status: true,
        number1,
        numeric: `${panjangPrefix}${sprintf('%06d', num)}`,
      });
    } catch (error) {
      return await Promise.reject({
        status: false,
        error: error,
      });
    }
  },
  MANIFEST: async (req) => {
    let number1 = uuidv1();

    let panjang = 6;
    let lastNum;
    let num;
    let depanString = formatDateString2();
    try {
      let companyData = await models.Company.findOne({
        where: { company_id: req.decoded.company_id },
        raw: true,
      });
      let lastShipmentData = await models.Manifest_header.findAll({
        where: { company_id: req.decoded.company_id, is_manual: true },
        limit: 1,
        raw: true,
        attributes: ['manifest_id'],
        order: [['manifest_id', 'DESC']],
      });
      if (!companyData) {
        throw new Error('Data Perusahaan tidak ada');
      }
      lastShipmentData.length > 0 ? (lastNum = lastShipmentData[0].manifest_id) : (lastNum = null);
      let panjangPrefix = `${companyData.city_code}${depanString}`;
      if (!lastNum) {
        num = 1;
      } else {
        num = parseFloat(lastNum.substr(panjangPrefix.length, lastNum.length - panjangPrefix.length)) + 1;
      }
      return await Promise.resolve({
        status: true,
        number1,
        numeric: `${panjangPrefix}${sprintf('%06d', num)}`,
      });
    } catch (error) {
      return await Promise.reject({
        status: false,
        error: error,
      });
    }
  },
  ASSIGNMENT_MANIFEST: async (req) => {
    let number1 = uuidv1();
    let panjang = 6;
    let lastNum;
    let num;
    let kodePrefix = 'AM';
    let depanString = formatDateString2();
    try {
      let companyData = await models.Company.findOne({
        where: { company_id: req.decoded.company_id },
        raw: true,
      });
      let lastShipmentData = await models.Assignment_manifest.findAll({
        where: { company_id: req.decoded.company_id, hub_id: { [Op.eq]: null } },
        limit: 1,
        raw: true,
        attributes: ['assignment_id'],
        order: [['assignment_id', 'DESC']],
      });
      if (!companyData) {
        throw new Error('Data Perusahaan tidak ada');
      }
      lastShipmentData.length > 0 ? (lastNum = lastShipmentData[0].assignment_id) : (lastNum = null);
      let panjangPrefix = `${kodePrefix}${companyData.city_code}${depanString}`;
      if (!lastNum) {
        num = 1;
      } else {
        num = parseFloat(lastNum.substr(panjangPrefix.length, lastNum.length - panjangPrefix.length)) + 1;
        console.log('---num', num);
      }
      return await Promise.resolve({
        status: true,
        number1,
        numeric: `${panjangPrefix}${sprintf('%06d', num)}`,
      });
    } catch (error) {
      return await Promise.reject({
        status: false,
        error: error,
      });
    }
  },
  ASSIGNMENT_DELIVERY: async (req) => {
    let number1 = uuidv1();
    let panjang = 6;
    let lastNum;
    let num;
    let kodePrefix = 'DS';
    let depanString = formatDateString2();
    try {
      let companyData = await models.Company.findOne({
        where: { company_id: req.decoded.company_id },
        raw: true,
      });
      let lastShipmentData = await models.Assignment_delivery.findAll({
        where: {
          company_id: req.decoded.company_id,
          delivery_id: {
            [Op.iLike]: `%${companyData.city_code}%`,
          },
        },
        limit: 1,
        raw: true,
        attributes: ['delivery_id'],
        order: [['delivery_id', 'DESC']],
      });

      if (!companyData) {
        throw new Error('Data Perusahaan tidak ada');
      }
      lastShipmentData.length > 0 ? (lastNum = lastShipmentData[0].delivery_id) : (lastNum = null);
      let panjangPrefix = `${kodePrefix}${companyData.city_code}${depanString}`;
      if (!lastNum) {
        num = 1;
      } else {
        num = parseFloat(lastNum.substr(panjangPrefix.length, lastNum.length - panjangPrefix.length)) + 1;
      }
      return await Promise.resolve({
        status: true,
        number1,
        numeric: `${panjangPrefix}${sprintf('%06d', num)}`,
      });
    } catch (error) {
      return await Promise.reject({
        status: false,
        error: error,
      });
    }
  },
  STT: async (req) => {
    let number1 = uuidv1();
    let panjang = 6;
    let lastNum;
    let num;
    let kodePrefix = 'STT';
    let depanString = formatDateString2();
    try {
      let companyData = await models.Company.findOne({
        where: { company_id: req.decoded.company_id },
        raw: true,
      });
      let lastShipmentData = await models.Stt_return.findAll({
        where: { company_id: req.decoded.company_id },
        limit: 1,
        raw: true,
        attributes: ['stt_return_id'],
        order: [['stt_return_id', 'DESC']],
      });
      if (!companyData) {
        throw new Error('Data Perusahaan tidak ada');
      }

      lastShipmentData.length > 0 ? (lastNum = lastShipmentData[0].stt_return_id) : (lastNum = null);
      let panjangPrefix = `${kodePrefix}${companyData.city_code}${depanString}`;
      if (!lastNum) {
        num = 1;
      } else {
        num = parseFloat(lastNum.substr(panjangPrefix.length, lastNum.length - panjangPrefix.length)) + 1;
      }
      return await Promise.resolve({
        status: true,
        number1,
        numeric: `${panjangPrefix}${sprintf('%06d', num)}`,
      });
    } catch (error) {
      return await Promise.reject({
        status: false,
        error: error,
      });
    }
  },
  INVOICE: async (req) => {
    let number1 = uuidv1();
    let panjang = 6;
    let lastNum;
    let num;
    let kodePrefix = 'IN';
    let depanString = formatDateString2();
    try {
      console.log(req.params.company_id);

      let company_id;
      if (req.params.company_id) {
        company_id = req.params.company_id;
      } else {
        company_id = req.decoded.company_id;
      }
      let companyData = await models.Company.findOne({
        where: { company_id: company_id },
        raw: true,
      });
      if (!companyData) {
        throw new Error('Data Perusahaan tidak ada');
      }
      const date = new Date().getFullYear().toString().substring(2, 4);
      const companyNo = `${kodePrefix}${companyData.city_code}${date}`;
      console.log(company_id)
      let lastShipmentData = await models.Invoice.findAll({
        where: {
          company_id: company_id,
          invoice_id: {
            [Op.iLike]: `${companyNo}%`,
          },
          is_reset_number:false
        },
        limit: 1,
        raw: true,
        attributes: ['invoice_id'],
        order: [['created','DESC'], ['invoice_id', 'DESC']],
      });

      console.log(lastShipmentData)
      lastShipmentData.length > 0 ? (lastNum = lastShipmentData[0].invoice_id) : (lastNum = null);
      
      let panjangPrefix = `${kodePrefix}${companyData.city_code}${depanString}`;
      if (!lastNum) {
        num = 1;
      } else {
        console.log(parseFloat(lastNum.substr(panjangPrefix.length, lastNum.length - panjangPrefix.length)));
        num = parseFloat(lastNum.substr(panjangPrefix.length, lastNum.length - panjangPrefix.length)) + 1;
      }
      return await Promise.resolve({
        status: true,
        number1,
        numeric: `${panjangPrefix}${sprintf('%06d', num)}`,
      });
    } catch (error) {

      console.log(error)
      return await Promise.reject({
        status: false,
        error: error,
      });
    }
  },
  PAYMENT: async (req) => {
    let number1 = uuidv1();
    let panjang = 6;
    let lastNum;
    let num;
    let kodePrefix = 'PAY';
    let depanString = formatDateString2();
    try {
      console.log(req.params.company_id);

      let company_id;
      if (req.params.company_id) {
        company_id = req.params.company_id;
      } else {
        company_id = req.decoded.company_id;
      }
      let companyData = await models.Company.findOne({
        where: { company_id: company_id },
        raw: true,
      });
      if (!companyData) {
        throw new Error('Data Perusahaan tidak ada');
      }
      let lastShipmentData = await models.Invoice_payment.findAll({
        where: {
          company_id: company_id,
          payment_id: {
            [Op.iLike]: `%${companyData.city_code}%`,
          },
        },
        limit: 1,
        raw: true,
        attributes: ['payment_id'],
        order: [['payment_id', 'DESC']],
      });

      lastShipmentData.length > 0 ? (lastNum = lastShipmentData[0].payment_id) : (lastNum = null);
      let panjangPrefix = `${kodePrefix}${companyData.city_code}${depanString}`;
      if (!lastNum) {
        num = 1;
      } else {
        num = parseFloat(lastNum.substr(panjangPrefix.length, lastNum.length - panjangPrefix.length)) + 1;
      }
      return await Promise.resolve({
        status: true,
        number1,
        numeric: `${panjangPrefix}${sprintf('%06d', num)}`,
      });
    } catch (error) {
      return await Promise.reject({
        status: false,
        error: error,
      });
    }
  },
  // CN:(data,callback)=>{
  //     let hasil = {};
  //     let kode = 'CN',
  //         prefix = '99';
  //     async.waterfall([
  //         function number1(cb) {
  //             hasil.number1 = uuidv1();
  //             cb(null, hasil);
  //         },
  //         function checkCabang(hasil, cb) {
  //             try {
  //                 models.Company.findOne({
  //                     where: {
  //                         company_id: data.decoded.company_id
  //                     },
  //                     raw: true
  //                 }).then((dtNomor) => {
  //                     hasil.kodeCabang = dtNomor.city_code;
  //                     cb(null, hasil);
  //                 })
  //             } catch (err) {
  //                 cb(err)
  //             }
  //         },
  //         function buatNomor(hasil, cb) {
  //             // ;
  //             let panjang = 6;
  //             try {
  //                 models.Shipment.findAll({
  //                     where: {
  //                         company_id: data.decoded.company_id
  //                     },
  //                     limit: 1,
  //                     raw:true,
  //                     attributes:['shipment_awbm'],
  //                     order: [ [ 'shipment_awbm', 'DESC' ]]
  //                 }).then((cariNomor) => {
  //                     let panjangPrefix = `${hasil.kodeCabang}${depanString}`;
  //                     if (cariNomor.length>0){
  //                     }else{
  //                     }
  //                     // hasil.lastNum = parseFloat(cariNomor.numbering) + 1;
  //                     // var depanString = formatDateString2();
  //                     // hasil.numeric = hasil.kodeCabang + depanString+getStringNumber(hasil.lastNum, panjang); //nomor.Kode + nomor.KodeCabang + getStringNumber(parseFloat(nomor.Nomor) + 1, 8);
  //                     // cb(null, hasil);
  //                 })
  //             } catch (err) {
  //                 cb(err)
  //             };
  //         },
  //     ], function (err, status) {
  //         if (err) {
  //             callback(err);
  //         } else {
  //             callback(null, status);
  //         }
  //     })
  // }
};
module.exports = numbering;
