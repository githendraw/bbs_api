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
const checkAwbStt = async (awb, user, callback) => {
  let shipmentData = await models.Shipment.findOne({
    where: {
      shipment_awbm: {
        [Op.iLike]: `%${awb}%`,
      },
    },
    raw: true,
    attributes: {
      exclude: ['charge'],
    },
  });
  if (!shipmentData) {
    callback('No Resi tidak terdaftar');
  }
  let historyArrive = await models.History.findAll({
    where: {
      shipment_awb: shipmentData.shipment_awb,
      company_id: user.company_id,
    },
    raw: true,
  });
  if (historyArrive && historyArrive.length == 0) {
    return callback('No Resi tidak masuk ke cabang/agen ini');
  }
  if (shipmentData && shipmentData.is_delivery == false) {
    return callback('No Resi belum di delivery ');
  }
  if (shipmentData && shipmentData.is_received == false) {
    return callback('No Resi belum proses di terima ');
  }
  return callback(null, shipmentData);
};
const getSttReturnOs = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  if (req.query && req.query.term) {
    src = {
      company_id: user.company_id,
      is_confirm: false,
    };
  } else {
    src = {
      company_id: user.company_id,
      is_confirm: false,
    };
  }
  let options = {
    where: src,
    order: [['stt_date', 'ASC']],
    page: pg,
    paginate: limit,
    include: [
      {
        model: models.Company,
        as: 'company_origin',
        required: false,
      },
      {
        model: models.Stt_return_detail,
        as: 'stt_return_detail',
        include: [
          {
            model: models.Shipment,
            as: 'shipment_detail',
            attributes: [
              'shipment_awb',
              'shipment_awbm',
              'shipment_do',
              'shipment_date',
              'partner_name',
              'receiver_address1',
              'receiver_name',
              'origin',
              'originname',
              'destination',
              'destinationname',
              'service_id',
              'uom_id',
              'weight',
              'moda_id',
              'last_status',
              'last_status_remark',
              'itemdesc',
            ],
            required: false,
          },
        ],
        required: false,
      },
    ],
  };
  try {
    const { docs, pages, total } = await models['Stt_return'].paginate(options);
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
const sttAwbCheck = async (req, res) => {
  let user = req.user.toJSON();
  checkAwbStt(req.params.awb, user, (e, r) => {
    if (e) {
      return ReE(res, e, 404);
    } else {
      return ReS(res, { data: r }, 200);
    }
  });
};
const getSttReturn = async (req, res) => {
  let user = req.decoded;
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
    st = moment(new Date(start_date)).format('YYYY-MM-DD 00:00:00');
    if (end_date) {
      ed = moment(new Date(end_date)).add(1, 'day').format('YYYY-MM-DD 00:00:00');
    } else {
      ed = moment(new Date(start_date)).add(1, 'day').format('YYYY-MM-DD 00:00:00');
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
    order: [['stt_date', 'ASC']],
    page: pg,
    paginate: limit,
    include: [
      {
        model: models.Company,
        as: 'company_origin',
        required: false,
      },
      {
        model: models.Stt_return_detail,
        as: 'stt_return_detail',
        include: [
          {
            model: models.Shipment,
            as: 'shipment_detail',
            attributes: [
              'shipment_awb',
              'shipment_awbm',
              'shipment_do',
              'shipment_date',
              'partner_name',
              'receiver_address1',
              'receiver_name',
              'origin',
              'originname',
              'destination',
              'destinationname',
              'service_id',
              'uom_id',
              'weight',
              'moda_id',
              'last_status',
              'last_status_remark',
              'itemdesc',
            ],
            required: false,
          },
        ],
        required: false,
      },
    ],
  };
  try {
    const { docs, pages, total } = await models['Stt_return'].paginate(options);
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
const getSttReturnBranchOs = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  if (req.query && req.query.term) {
    src = {
      company_origin_id: user.company_id,
      is_confirm: false,
    };
  } else {
    src = {
      company_origin_id: user.company_id,
      is_confirm: false,
    };
  }
  console.log(src);
  let options = {
    where: src,
    order: [['stt_date', 'ASC']],
    page: pg,
    paginate: limit,
    include: [
      {
        model: models.Company,
        as: 'company_origin',
        required: false,
      },
      {
        model: models.Company,
        as: 'company_branch',
        required: false,
      },
      {
        model: models.Stt_return_detail,
        as: 'stt_return_detail',
        include: [
          {
            model: models.Shipment,
            as: 'shipment_detail',
            attributes: [
              'shipment_awb',
              'shipment_awbm',
              'shipment_do',
              'shipment_date',
              'partner_name',
              'receiver_address1',
              'receiver_name',
              'origin',
              'originname',
              'destination',
              'destinationname',
              'service_id',
              'uom_id',
              'weight',
              'moda_id',
              'last_status',
              'last_status_remark',
              'itemdesc',
            ],
            required: false,
          },
        ],
        required: false,
      },
    ],
  };
  try {
    const { docs, pages, total } = await models['Stt_return'].paginate(options);
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
    console.log(err);
    return ReE(res, err, 404);
  }
};
const getSttReturnBranch = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  if (req.query && req.query.term) {
    src = {
      company_origin_id: user.company_id,
    };
  } else {
    src = {
      company_origin_id: user.company_id,
    };
  }
  let start_date = req.query.start_date || null;
  let end_date = req.query.end_date || null;
  let st, ed;
  if (start_date) {
    st = moment(new Date(start_date)).format('YYYY-MM-DD 00:00:00');
    if (end_date) {
      ed = moment(new Date(end_date)).add(1, 'day').format('YYYY-MM-DD 00:00:00');
    } else {
      ed = moment(new Date(start_date)).add(1, 'day').format('YYYY-MM-DD 00:00:00');
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
    order: [['stt_date', 'ASC']],
    page: pg,
    paginate: limit,
    include: [
      {
        model: models.Company,
        as: 'company_origin',
        required: false,
      },
      {
        model: models.Company,
        as: 'company_branch',
        required: false,
      },
      {
        model: models.Stt_return_detail,
        as: 'stt_return_detail',
        include: [
          {
            model: models.Shipment,
            as: 'shipment_detail',
            attributes: [
              'shipment_awb',
              'shipment_awbm',
              'shipment_do',
              'shipment_date',
              'partner_name',
              'receiver_address1',
              'receiver_name',
              'origin',
              'originname',
              'destination',
              'destinationname',
              'service_id',
              'uom_id',
              'weight',
              'moda_id',
              'last_status',
              'last_status_remark',
              'itemdesc',
            ],
            required: false,
          },
        ],
        required: false,
      },
    ],
  };
  try {
    const { docs, pages, total } = await models['Stt_return'].paginate(options);
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
    console.log(err);
    return ReE(res, err, 404);
  }
};
const confirmSttBranch = async (req, res) => {
  try {
    let user = req.decoded;
    let stt_id = req.params.stt_id;
    let awb = req.params.awb;
    let findShipment = await models.Shipment.findOne({
      attributes: ['shipment_awb'],
      where: {
        shipment_awbm: {
          [Op.iLike]: `${awb}`,
        },
      },
      raw: true,
    });
    if (!findShipment) {
      return ReE(res, 'No Resi tidak ada', 404);
    }
    let dataAwb = await models.Stt_return_detail.findOne({
      where: {
        stt_return_id: {
          [Op.iLike]: `${stt_id}`,
        },
        shipment_awb: findShipment.shipment_awb,
      },
      raw: true,
    });
    if (dataAwb && dataAwb.is_confirm == true) {
      return ReE(res, 'Resi ini sudah di konfirmasi', 404);
    }
    await models.Stt_return_detail.update(
      {
        is_confirm: true,
        confirm_by: user.name,
        confirm_date: moment(),
      },
      {
        where: {
          stt_return_id: {
            [Op.iLike]: `${stt_id}`,
          },
          shipment_awb: findShipment.shipment_awb,
        },
      }
    );
    await models.Shipment.update(
      {
        is_return: true,
      },
      {
        where: {
          shipment_awb: findShipment.shipment_awb,
        },
      }
    );
    let totalConfirm = await models.Stt_return_detail.findAll({
      attributes: [
        [s.fn('sum', s.literal('CASE WHEN (is_confirm=false) THEN 1 ELSE 0 END')), 'totalUnConfirm'],
        [s.fn('sum', s.literal('CASE WHEN (is_confirm=true) THEN 1 ELSE 0 END')), 'totalConfirm'],
      ],
      where: {
        stt_return_id: {
          [Op.iLike]: `${stt_id}`,
        },
      },
      raw: true,
    });
    console.log('-->>>>', totalConfirm[0]);
    if (parseInt(totalConfirm[0].totalUnConfirm) == 0) {
      await models.Stt_return.update(
        {
          is_confirm: true,
          confirm_by: user.name,
          confirm_date: moment(),
        },
        {
          where: {
            stt_return_id: {
              [Op.iLike]: `${stt_id}`,
            },
          },
        }
      );
    }
    return ReS(
      res,
      {
        data: totalConfirm[0],
      },
      200
    );
  } catch (err) {
    return ReE(res, err, 404);
  }
};
const unConfirmSttBranch = async (req, res) => {
  try {
    let user = req.decoded;
    let stt_id = req.params.stt_id;
    let awb = req.params.awb;
    let findShipment = await models.Shipment.findOne({
      attributes: ['shipment_awb'],
      where: {
        shipment_awbm: {
          [Op.iLike]: `${awb}`,
        },
      },
      raw: true,
    });
    if (!findShipment) {
      return ReE(res, 'No Resi tidak ada', 404);
    }
    let dataAwb = await models.Stt_return_detail.findOne({
      where: {
        stt_return_id: {
          [Op.iLike]: `${stt_id}`,
        },
        shipment_awb: findShipment.shipment_awb,
      },
      raw: true,
    });
    if (dataAwb && dataAwb.is_confirm == false) {
      return ReE(res, 'Resi ini belum di konfirmasi', 404);
    }
    await models.Stt_return_detail.update(
      {
        is_confirm: false,
        confirm_by: user.name,
        confirm_date: moment(),
      },
      {
        where: {
          stt_return_id: {
            [Op.iLike]: `${stt_id}`,
          },
          shipment_awb: findShipment.shipment_awb,
        },
      }
    );
    await models.Shipment.update(
      {
        is_return: false,
      },
      {
        where: {
          shipment_awb: findShipment.shipment_awb,
        },
      }
    );
    let totalConfirm = await models.Stt_return_detail.findAll({
      attributes: [
        [s.fn('sum', s.literal('CASE WHEN (is_confirm=false) THEN 1 ELSE 0 END')), 'totalUnConfirm'],
        [s.fn('sum', s.literal('CASE WHEN (is_confirm=true) THEN 1 ELSE 0 END')), 'totalConfirm'],
      ],
      where: {
        stt_return_id: {
          [Op.iLike]: `${stt_id}`,
        },
      },
      raw: true,
    });
    console.log(totalConfirm[0]);
    if (parseInt(totalConfirm[0].totalUnConfirm) > 0) {
      await models.Stt_return.update(
        {
          is_confirm: false,
          confirm_by: user.name,
          confirm_date: moment(),
        },
        {
          where: {
            stt_return_id: {
              [Op.iLike]: `${stt_id}`,
            },
          },
        }
      );
    }
    return ReS(
      res,
      {
        data: totalConfirm[0],
      },
      200
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
        as: 'shipment_detail',
        attributes: [
          'shipment_awb',
          'shipment_awbm',
          'shipment_date',
          'shipment_do',
          'partner_name',
          'receiver_address1',
          'receiver_name',
          'origin',
          'originname',
          'destination',
          'destinationname',
          'service_id',
          'uom_id',
          'weight',
          'moda_id',
          'route_id',
          'qty',
          'last_status',
          'last_status_remark',
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
        as: 'shipment_detail',
        attributes: [
          'shipment_awb',
          'shipment_awbm',
          'shipment_date',
          'shipment_do',
          'partner_name',
          'receiver_address1',
          'receiver_name',
          'origin',
          'originname',
          'destination',
          'destinationname',
          'service_id',
          'uom_id',
          'weight',
          'moda_id',
          'route_id',
          'qty',
          'last_status',
          'last_status_remark',
        ],
        required: false,
      };
    }
    let sttData = await models.Stt_return.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: models.Company,
          as: 'company_origin',
          required: false,
        },
        {
          model: models.Company,
          as: 'company_branch',
          required: false,
        },
        {
          model: models.Stt_return_detail,
          as: 'stt_return_detail',
          include: [includeQuery],
          required: false,
        },
      ],
    });
    return ReS(
      res,
      {
        data: sttData,
      },
      200
    );
  } catch (err) {
    return ReE(res, err, 404);
  }
};



const saveSttReturn = async (req, res) => {
  const errors = validationResult(req);

  const errReturn = function (message) {
    return ReE(res, message, 403);
  };

  if (!errors.isEmpty()) {
    errReturn(errors.array());
  }

  let bd = req.body;
  let dataShipment = [];
  let user = req.decoded;
  let tgl = moment(new Date(bd.stt_date)).format('YYYY-MM-DD HH:mm:ss');
  if (bd && bd.data_shipment && bd.data_shipment.length > 0) {
    dataShipment = bd.data_shipment;
    delete bd['data_shipment'];
  }
  let hubData = await models.Hub.findOne({
      where: {
      hub_id: bd.hub_id,},
    raw: true,
  });

  let companyData = await models.Company.findOne({
    where: {
      company_id: bd.company_origin_id,
    },
    raw: true,
  });
  if (!hubData) {
    return ReE(res, 'Hub tidak ada',403);
  }
  if (!companyData) {
    return ReE(res, 'Data Origin ' + bd.company_origin_id + ' tidak ada',403);
  }

  bd.hub_name = hubData.hub_name;


  try {

    let transaction;
    const numeric = await numbering.ASSIGNMENT_DELIVERY(req);
    const detailData = await Promise.all(
        dataShipment.map(async (x) => {
          return {
                company_id: user.company_id,
                stt_return_id: numeric.numeric,
                shipment_awb: x.shipment_awb,
                usrupd: user.email,
          };
        })
      );
    transaction = await s.transaction();
    let dtDelivery = {
        company_id: user.company_id,
        stt_return_id: numeric.numeric,
        hub_id: bd.hub_id,
        host_name: hubData.hub_name,
        stt_date: tgl,
        company_origin_id: bd.company_origin_id,
        description: bd.description,
        status_id: '01',
        usrupd: user.email,
    };

    await models.Stt_return.create(dtDelivery,transaction)
    await models.Stt_return_detail.bulkCreate(detailData, { transaction });
    await transaction.commit();
    const updateAll=await updateSTTToShipment(detailData,tgl,user)
    logger.info(JSON.stringify(params));
    return ReS(res,{
      ...params
  },200)

  } catch (err) {
    return ReE(res, err, 404);
  }
};


const updateSttReturn = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ReE(res, errors.array(), 404);
    }
    let user = req.decoded();
    let hasil = {};
    let bd = req.body;
    if (bd && bd.data_shipment && bd.data_shipment.length > 0) {
      detail = bd.data_shipment;
      hasil.detail = detail;
      delete bd["data_shipment"];
    }
    let dataStt = await models.Stt_return.findOne({
      where: {
        id: req.params.id,
        is_confirm: false,
      },
      include: [
        {
          model: models.Stt_return_detail,
          as: "stt_return_detail",
          required: false,
        },
      ],
    });
    if (!dataStt) {
      return ReE(res, "Error", "Data tidak bisa diedit");
    }

    let hubData = await models.Hub.findOne({
      where: {
        hub_id: bd.hub_id,
      },
      raw: true,
    });
    let companyData = await models.Company.findOne({
      where: {
        company_id: bd.company_origin_id,
      },
      raw: true,
    });

    if (!hubData) {
      return ReE(res, "Error", "Hub tidak ada");
    }
    if (!companyData) {
      return ReE(
        res,
        "Error",
        "Data Origin " + bd.company_origin_id + " tidak ada"
      );
    }

    if (detail && detail.length == 0) {
      return ReE(res, "data detail kosong", 404);
    }

    bd.hub_name = hubData.hub_name;
    let tgl = moment(new Date(bd.stt_date)).format("YYYY-MM-DD HH:mm:ss");
    dataStt = dataStt.toJSON();
    hasil.stt_return_id = dataStt.stt_return_id;
    let dtOld=[];
    dataStt.stt_return_detail.map(function (v) {
      dtOld.push(v.shipment_awb);
    });
    try {
      async.waterfall(
        [
          (compareData = (cb) => {
            let dataOld = dtOld;
            let dataCurrent = hasil.detail;
            let removeData = dataOld.filter(custom.comparer(dataCurrent));
            async.eachSeries(
              removeData,
              function (item, cb1) {
                models.Stt_return_detail.destroy({
                  where: {
                    stt_return_id: hasil.stt_return_id,
                    shipment_awb:item.shipment_awb
                  },
                }).done(function (rst, err) {
                  models.Shipment.update(
                    {
                      is_return_pod: false,
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
                          status_name: "UPDATE STT RETURN",
                          reff_1: hasil.stt_return_id,
                          reff_2: item.shipment_awb,
                          company_id: user.company_id,
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
                    })
                    .catch((err) => {
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
            let dtDelivery = {
              company_id: user.company_id,
              stt_return_id: hasil.stt_return_id,
              hub_id: bd.hub_id,
              host_name: hubData.hub_name,
              stt_date: tgl,
              company_origin_id: bd.company_origin_id,
              description: bd.description,
              status_id: "01",
              usrupd: user.email,
            };

            models.Stt_return.update(dtDelivery, {
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
            var paramsData = [];
            async.eachSeries(
              hasil.detail,
              function (item, cb1) {
                models.Stt_return_detail.findOne({
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
                  models.Stt_return_detail.bulkCreate(paramsData)
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
                history.STT_RETURN(
                  {
                    shipment_awb: item.shipment_awb,
                    stt_return_id: hasil.stt_return_id,
                    company_origin_id: bd.company_origin_id,
                    tanggal: tgl,
                    hub_id: bd.hub_id,
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

const updateSTTToShipment=async (sttdetail,tgl,user)=>{
    const errReturn=async (err)=>{
        return await Promise.reject(err)
      };

      return await Promise.all(
        sttdetail.map(async(item)=>{
         const dtShipmentUpdate= await history.STTRETURN({
           shipment_awb: item.shipment_awb,
           stt_return_id: item.stt_return_id,
           tanggal: tgl,
         },user
         )
         return {
           ...dtShipmentUpdate
         }
       })
     )

}
module.exports = {
  sttAwbCheck,
  getSttReturnOs,
  getSttReturn,
  getSttReturnBranchOs,
  getSttReturnBranch,
  confirmSttBranch,
  unConfirmSttBranch,
  getSttReturn,
  findById,
  saveSttReturn,
  updateSttReturn
};
