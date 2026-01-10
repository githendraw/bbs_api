const { to, ReE, ReS } = require('../utils/response');
const async = require('async');
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const CONFIG = require('../config/config');
const message = require('../utils/message');
const logger = require('../utils/logger');
const models = require('../models');
const history = require('../middleware/history');
const numbering = require('../middleware/numbering');
const custom = require('../middleware/custom');
const { Op } = require('../models/index').Sequelize;
const { v1: uuidv1 } = require('uuid');
const s = require('../models/index').sequelize;


const checkAwbStt = async (awb, customer,user, callback) => {
    let shipmentData = await models.Shipment.findOne({
      where: {
        shipment_awbm: {
          [Op.iLike]: `${awb}`,
        },
        partner_id: {
          [Op.iLike]: `${customer}`,
        }
        ,
      },
      raw: true,
      attributes: {
        exclude: ["charge"],
      },
    });

    if (!shipmentData) {
      return callback("No Resi tidak terdaftar");
    };
    if (shipmentData.is_received==false){
      return callback("No Resi belum lengkap");
    };

    if (shipmentData.is_return_customer){
      return callback("No Resi sudah pernah di kembalikan");
    };
    return callback(null, shipmentData);



  };

  const checkAwbBelong = async (data, company) => {
    let shipment = [];
    data.map(async (x) => {});
  };





const sttAwbCheck = async (req, res) => {
    let user = req.user.toJSON();
    checkAwbStt(req.params.awb,req.params.partner_id, user, (e, r) => {
      if (e) {
        return ReE(res, e, 404);
      } else {
        return ReS(
          res,{data: r},200
        );
      }
    });
  };


const getSttReturnCustomer = async (req, res) => {
    let user = req.user.toJSON();
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT || 10;
    let src = null;
    if (req.query && req.query.term) {
      src = {
        company_id: user.company_id,
      };
    } else {
      src = {
        company_id: user.company_id,
      };
    }

    let start_date = req.query.start_date || null;
    let end_date = req.query.end_date || null;
    let st, ed;
    if (start_date) {
      st = moment(new Date(start_date)).format("YYYY-MM-DD 00:00:00");
      if (end_date) {
        ed = moment(new Date(end_date))
          .add(1, "day")
          .format("YYYY-MM-DD 00:00:00");
      } else {
        ed = moment(new Date(start_date))
          .add(1, "day")
          .format("YYYY-MM-DD 00:00:00");
      }
    } else {
      st: null;
      ed: null;
    }
    if (st) {
      src.stt_date = {
        [Op.between]: [st, ed],
      };
    }
    let options = {
      where: src,
      order: [["stt_date", "ASC"]],
      page: pg,
      paginate: limit,
      include: [
        {
          model: models.Contact,
          as: "contact",
          required: false,
        },
        {
          model: models.Stt_return_customer_detail,
          as: "stt_return_customer_detail",
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
                "receiver_address1",
                "receiver_name",
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
                "itemdesc",
              ],
              required: false,
            },
          ],
          required: false,
        },
      ],
    };
    try {
      const { docs, pages, total } = await models["Stt_return_customer"].paginate(
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
      return ReE(res, err, 404);
    }
  };

  const saveSttReturn = async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ReE(res, errors.array(), 404);
      }

      let hasil = {};
      let bd = req.body;
      let dataShipment = [];
      let user = req.user.toJSON();
      let tgl = moment(new Date(bd.stt_date)).format("YYYY-MM-DD HH:mm:ss");
      if (bd && bd.data_shipment && bd.data_shipment.length > 0) {
        dataShipment = bd.data_shipment;
        delete bd["data_shipment"];
      }
      let partnerData = await models.Contact.findOne({
        where: {
          contact_id: bd.partner_id,
        },
        raw: true,
      });

      if (!partnerData) {
        return ReE(res, "Error", "Customer tidak terdaftar");
      }

      bd.parter_name = partnerData.name;
      try {
        async.waterfall(
          [
            (checkNomor = (cb) => {
              numbering.globalp(
                {
                  kode: "STTC",
                  prefixKode: "STTC",
                  decoded: user,
                  panjang: 6,
                  is_company: true,
                },
                function (e, i) {
                  hasil.stt_return_id = i.numeric;
                  if (e) {
                    cb(e);
                  } else {
                    cb(null, hasil);
                  }
                }
              );
            }),
            (cariNomor = (hasil, cb) => {
              models["Stt_return_customer"]
                .findOne({
                  where: {
                    stt_return_id: hasil.stt_return_id,
                  },
                })
                .then(
                  function (r) {
                    if (r) {
                      cb("Kode  sudah terdaftar");
                    } else {
                      cb(null, hasil);
                    }
                  },
                  function (e) {
                    cb(e);
                  }
                );
            }),
            (paramsDetail = (hasil, cb) => {
              hasil.data_shipment = [];
              dataShipment.map(function (v) {
                hasil.data_shipment.push({
                  company_id: user.company_id,
                  stt_return_id: hasil.stt_return_id,
                  shipment_awb: v.shipment_awb,
                  usrupd: user.email,
                });
              });
              cb(null, hasil);
            }),
            (simpanDelivery = (hasil, cb) => {
              let dtDelivery = {
                company_id: user.company_id,
                stt_return_id: hasil.stt_return_id,
                partner_id: bd.partner_id,
                partner_name: partnerData.name,
                stt_date: tgl,
                description: bd.description,
                status_id: "01",
                usrupd: user.email,
              };
              models.Stt_return_customer.build(dtDelivery)
                .save()
                .then((response) => {
                  hasil.save = response;
                  cb(null, hasil);
                })
                .catch((err) => {
                  cb(err.message);
                });
            }),
            (simpanDetail = (hasil, cb) => {
              models.Stt_return_customer_detail.bulkCreate(hasil.data_shipment)
                .then((response) => {
                  cb(null, hasil);
                })
                .catch((err) => {
                  cb(err.message);
                });
            }),
            (simpanHistory = (hasil, cb) => {
              async.eachSeries(
                hasil.data_shipment,
                function (item, cb1) {
                  history.STT_RETURN_CUSTOMER(
                    {
                      shipment_awb: item.shipment_awb,
                      stt_return_id: hasil.stt_return_id,
                      partner_id: bd.partner_id,
                      tanggal: tgl,
                      partner_name: partnerData.name,
                    },
                    user,
                    (e, r) => {
                      if (e) {
                        cb1(e);
                      } else {
                        cb1();
                      }
                    }
                  );
                },
                function (err) {
                  if (err) {
                    cb(err);
                  } else {
                    cb(null, hasil);
                  }
                }
              );
            }),
          ],
          (e, r) => {
            if (e) {
              return ReE(res, e, 404);
            } else {
              return ReS(
                res,
                {
                  data: hasil,
                },
                200
              );
            }
          }
        );
      } catch (err) {
        return ReE(res, err, 404);
      }
    };

  const updateSttReturn = async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ReE(res, errors.array(), 404);
      }

      console.log('--->>>>>',req.body);
      let user = req.user.toJSON();
      let hasil = {};
      let bd = req.body;
      if (bd && bd.data_shipment && bd.data_shipment.length > 0) {
        detail = bd.data_shipment;
        hasil.detail = detail;
        delete bd["data_shipment"];
      }
      let dataStt = await models.Stt_return_customer.findOne({
        where: {
          id: req.params.id
        },
        include: [
          {
            model: models.Stt_return_customer_detail,
            as: "stt_return_customer_detail",
            required: false,
          },
        ],
      });
      if (!dataStt) {
        return ReE(res, "Error", "Data tidak bisa diedit");
      }

      let partnerData = await models.Contact.findOne({
        where: {
          contact_id: bd.partner_id,
        },
        raw: true,
      });


      if (!partnerData) {
        return ReE(res, "Error", "Kode Pelanggan tidak terdaftar");
      }

      if (detail && detail.length == 0) {
        return ReE(res, "data detail kosong", 404);
      }

      bd.partner_name = partnerData.name;
      let tgl = moment(new Date(bd.stt_date)).format("YYYY-MM-DD HH:mm:ss");
      dataStt = dataStt.toJSON();
      hasil.stt_return_id = dataStt.stt_return_id;
      let dtOld=[];

      dataStt.stt_return_customer_detail.map(function (v) {
        dtOld.push(v.shipment_awb);
      });

      try {
        async.waterfall(
          [
            (compareData = (cb) => {
              console.log('compmare')
              let dataOld = dtOld;
              let dataCurrent = hasil.detail;
              let removeData = dataOld.filter(custom.comparer(dataCurrent));
              console.log(dataOld);
              console.log(dataCurrent)
              async.eachSeries(
                removeData,
                function (item, cb1) {
                  console.log(item);
                  models.Stt_return_customer_detail.destroy({
                    where: {
                      stt_return_id: hasil.stt_return_id,
                      shipment_awb:item.shipment_awb
                    },
                  }).done(function (rst, err) {
                    console.log(rst);
                    models.Shipment.update(
                      {
                        is_return_customer: false,
                      },
                      {
                        where: {
                          shipment_awb: item.shipment_awb,
                        },
                      }
                    )
                      .then((response) => {
                        history.LOG(
                          {
                            status: "UPDATE",
                            status_name: "UPDATE STT RETURN CUSTOMER" ,
                            reff_1: hasil.stt_return_id,
                            reff_2: item.shipment_awb,
                            company_id: user.company_id,
                          },
                          user,
                          (e, r) => {
                            console.log('history',e);
                            if (e) {

                              cb1(e);
                            } else {
                              cb1();
                            }
                          }
                        );
                      })
                      .catch((err) => {
                        console.log('error sini ')
                        cb1(err.message);
                      });
                  });
                },
                function (err) {
                  if (err) {
                    cb(err);
                  } else {
                    cb(null, hasil);
                  }
                }
              );
            }),
            (simpanReturn = (hasil, cb) => {
              console.log('simpan return ')
              let dtDelivery = {
                company_id: user.company_id,
                stt_return_id: hasil.stt_return_id,
                partner_id: bd.partner_id,
                partner_name: partnerData.name,
                stt_date: tgl,
                description: bd.description,
                status_id: "01",
                usrupd: user.email,
              };

              models.Stt_return_customer.update(dtDelivery, {
                where: {
                  id: req.params.id,
                },
              })
                .then((response) => {
                  cb(null, hasil);
                })
                .catch((err) => {
                  cb(err.message);
                });
            }),
            (simpanDetailReturn = (hasil, cb) => {
              console.log('return detail disini ');
              var paramsData = [];
              async.eachSeries(
                hasil.detail,
                function (item, cb1) {
                  models.Stt_return_customer_detail.findOne({
                    where: {
                      stt_return_id: dataStt.stt_return_id,
                      shipment_awb: item.shipment_awb,
                    },
                  }).done(function (rst, err) {
                    if (!rst || rst.length == 0) {
                      paramsData.push({
                        company_id: user.company_id,
                        stt_return_id: hasil.stt_return_id,
                        shipment_awb: item.shipment_awb,
                        usrupd: user.email,
                      });
                      cb1();
                    } else {
                      cb1();
                    }
                  });
                },
                function (err) {
                  if (err) {
                    cb(err);
                  } else {
                    //   hasil.paramsData = paramsData;
                    models.Stt_return_customer_detail.bulkCreate(paramsData)
                      .catch(function (err) {
                        cb(err, null);
                      })
                      .then((status) => {
                        cb(null, hasil);
                      });
                  }
                }
              );
            }),
            (simpanHistory = (hasil, cb) => {
              async.eachSeries(
                hasil.data_shipment,
                function (item, cb1) {
                  history.STT_RETURN_CUSTOMER(
                    {
                      shipment_awb: item.shipment_awb,
                      stt_return_id: hasil.stt_return_id,
                      partner_id: bd.partner_id,
                      tanggal: tgl,
                      partner_name: partnerData.name,
                    },
                    user,
                    (e, r) => {
                      if (e) {
                        cb1(e);
                      } else {
                        cb1();
                      }
                    }
                  );
                },
                function (err) {
                  if (err) {
                    cb(err);
                  } else {
                    cb(null, hasil);
                  }
                }
              );
            }),
          ],
          (e, r) => {
            if (e) {
              return ReE(res, e, 404);
            } else {
              return ReS(
                res,
                {
                  data: hasil,
                },
                200
              );
            }
          }
        );
      } catch (err) {
        return ReE(res, err, 404);
      }
    };
    const findById = async (req, res) => {
      try {
        let includeQuery;
        if (req.query && req.query.term) {
          includeQuery = {
            model: models.Shipment,
            as: "shipment_detail",
            attributes: [
              "shipment_awb",
              "shipment_awbm",
              "shipment_date",
              "shipment_do",
              "partner_name",
              "receiver_address1",
              "receiver_name",
              "origin",
              "originname",
              "destination",
              "destinationname",
              "service_id",
              "uom_id",
              "weight",
              "moda_id",
              "route_id",
              "qty",
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
            required: false,
          };
        } else {
          includeQuery = {
            model: models.Shipment,
            as: "shipment_detail",
            attributes: [
              "shipment_awb",
              "shipment_awbm",
              "shipment_date",
              "shipment_do",
              "partner_name",
              "receiver_address1",
              "receiver_name",
              "origin",
              "originname",
              "destination",
              "destinationname",
              "service_id",
              "uom_id",
              "weight",
              "moda_id",
              "route_id",
              "qty",
              "last_status",
              "last_status_remark",
            ],
            required: false,
          };
        };

        let sttData = await models.Stt_return_customer.findOne({
          where: {
            id: req.params.id,
          },
          include: [
            {
              model: models.Contact,
              as: "contact",
              required: false,
            },

            {
              model: models.Stt_return_customer_detail,
              as: "stt_return_customer_detail",
              include: [includeQuery],
              required: false,
            },
          ],
        });
        return ReS(
          res,{data: sttData,},
          200
        );
      } catch (err) {
        console.log(err);
        return ReE(res, err, 404);
      }
    };
  module.exports = {
    getSttReturnCustomer,
    saveSttReturn,
    updateSttReturn,
    findById,
    sttAwbCheck,
  };