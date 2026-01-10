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
const { hitungContactPrice } = require('../middleware/kalkulasi');
const s = require('../models/index').sequelize;
const modelShipmentInclude = [
  {
    model: models.Contact,
    as: 'contact',
    required: false,
  },
  {
    model: models.History,
    as: 'history',
    required: false,
    include: [
      {
        model: models.Status,
        as: 'status',
        required: false,
      },
    ],
  },
  {
    model: models.Status,
    as: 'status',
    required: false,
  },
  {
    model: models.Services,
    as: 'service',
    required: false,
  },
  {
    model: models.Invoice_detail,
    as: 'invoice_detail',
    required: false,
  },
  {
    model: models.Company,
    as: 'agen',
    required: false,
  },
  {
    model: models.Destination,
    as: 'destination_detail',
    required: false,
  },
  {
    model: models.Shipment_detail_reff,
    as: 'detail_reff',
    required: false,
  },
];
const mShipmentInclude = () => {
  return modelShipmentInclude;
};
const mOSManifest = () => {
  return {
    is_incoming_wh: true,
    is_manifest: false,
  };
};
const filterShipment = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let order = [
    ['shipment_date', 'DESC'],
    ['history', 'history_date', 'ASC'],
  ];
  console.log('filter', req.query.term);
  let src = {
    company_id: user.company_id,
  };
  if (req.query.type == 'TOTALSHIPMENT' && req.query.type == 'ALL') {
    src = {
      company_id: user.company_id,
    };
  }
  if (req.query.type == 'OSINCOMINGWH') {
    src = {
      company_id: user.company_id,
      is_incoming_wh: false,
    };
    order = [['shipment_date', 'ASC']];
  }
  if (req.query.type == 'OSMANIFEST') {
    src = {
      company_id: user.company_id,
      ...mOSManifest(),
    };
    order = [['shipment_date', 'ASC']];
  }
  if (req.query.type == 'OSDEPARTURE') {
    src = {
      company_id: user.company_id,
      is_incoming_wh: true,
      is_manifest: true,
      is_departure: false,
    };
    order = [['shipment_date', 'ASC']];
  }
  if (req.query.type == 'OSARRIVAL') {
    src = {
      company_id: user.company_id,
      is_incoming_wh: true,
      is_manifest: true,
      is_departure: true,
      is_arrive: false,
    };
    order = [['shipment_date', 'ASC']];
  }
  if (req.query.type == 'OSDELIVERY') {
    src = {
      company_id: user.company_id,
      is_incoming_wh: true,
      is_manifest: true,
      is_departure: true,
      is_arrive: true,
      is_delivery: false,
    };
  }
  if (req.query.type == 'OSRECEIVE') {
    console.log('os received');
    src = {
      company_id: user.company_id,
      is_incoming_wh: true,
      is_manifest: true,
      is_departure: true,
      is_arrive: true,
      is_delivery: true,
      is_received: false,
    };
    order = [['shipment_date', 'ASC']];
  }
  if (req.query.type == 'OSRETURNPOD') {
    src = {
      company_id: user.company_id,
      is_incoming_wh: true,
      is_manifest: true,
      is_departure: true,
      is_arrive: true,
      is_delivery: true,
      is_received: true,
      is_return_pod: false,
    };
    order = [['shipment_date', 'ASC']];
  }
  if (req.query.type == 'OSINVOICE') {
    src = {
      is_invoice: false,
    };
  }
  if (req.query.type == 'INVOICED') {
    src = {
      is_invoice: true,
    };
  }
  if (req.query.type == 'ZEROAMOUNT') {
    src = {
      total: {
        [Op.lte]: 0,
      },
      is_invoice: false,
    };
  }
  if (req.query.type == 'PAID') {
    src = {
      is_paid: true,
    };
  }
  if (req.query && req.query.term) {
    src = {
      ...src,
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
    };
  } else {
    src = {
      ...src,
    };
  }
  let start_date = req.query.start_date || null;
  let end_date = req.query.end_date || null;
  let st, ed;
  if (start_date) {
    st = moment(new Date(start_date)).format('YYYY-MM-DD 00:00:00');
    if (end_date) {
      ed = moment(new Date(end_date)).format('YYYY-MM-DD 23:59:00');
    } else {
      ed = moment(new Date(start_date)).add(1, 'day').format('YYYY-MM-DD 23:00:00');
    }
  } else {
    st: null;
    ed: null;
  }
  if (st) {
    src.shipment_date = {
      [Op.between]: [st, ed],
    };
  }
  if (req.query.contact_id) {
    src.partner_id = req.query.contact_id;
  }
  console.log(src);
  let options = {
    where: src,
    order: order,
    page: pg,
    paginate: limit,
    include: [...modelShipmentInclude],
  };
  try {
    const { docs, pages, total } = await models['Shipment'].paginate(options);
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
const pickupView = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  if (req.query && req.query.term) {
    src = {
      company_id: user.company_id,
      is_from_pickup: true,
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
    };
  } else {
    src = {
      company_id: user.company_id,
      is_from_pickup: true,
    };
  }
  let start_date = req.query.start_date || null;
  let end_date = req.query.end_date || null;
  let st, ed;
  if (start_date) {
    st = moment(new Date(start_date)).format('YYYY-MM-DD 00:00:00');
    if (end_date) {
      ed = moment(new Date(end_date)).format('YYYY-MM-DD 23:59:00');
    } else {
      ed = moment(new Date(start_date)).add(1, 'day').format('YYYY-MM-DD 23:00:00');
    }
  } else {
    st: null;
    ed: null;
  }
  if (st) {
    src.shipment_date = {
      [Op.between]: [st, ed],
    };
  }
  let options = {
    where: src,
    order: [['shipment_date', 'DESC']],
    page: pg,
    paginate: limit,
    include: modelShipmentInclude,
  };
  try {
    const { docs, pages, total } = await models['Shipment'].paginate(options);
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
const pickupViewOs = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  if (req.query && req.query.term) {
    src = {
      company_id: user.company_id,
      // is_from_pickup:true,
      is_incoming_wh: false,
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
    };
  } else {
    src = {
      company_id: user.company_id,
      is_incoming_wh: false,
    };
  }
  let options = {
    where: src,
    order: [['shipment_date', 'DESC']],
    page: pg,
    paginate: limit,
    include: modelShipmentInclude,
  };
  try {
    const { docs, pages, total } = await models['Shipment'].paginate(options);
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
const outboundView = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  if (req.query && req.query.term) {
    src = {
      company_id: user.company_id,
      is_incoming_wh: true,
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
    };
  } else {
    src = {
      company_id: user.company_id,
      is_incoming_wh: true,
    };
  }
  let start_date = req.query.start_date || null;
  let end_date = req.query.end_date || null;
  let st, ed;
  if (start_date) {
    st = moment(new Date(start_date)).format('YYYY-MM-DD 00:00:00');
    if (end_date) {
      ed = moment(new Date(end_date)).format('YYYY-MM-DD 23:59:00');
    } else {
      ed = moment(new Date(start_date)).add(1, 'day').format('YYYY-MM-DD 23:00:00');
    }
  } else {
    st: null;
    ed: null;
  }
  if (st) {
    src.shipment_date = {
      [Op.between]: [st, ed],
    };
  }
  let options = {
    where: src,
    order: [['shipment_date', 'DESC']],
    page: pg,
    paginate: limit,
    include: [...modelShipmentInclude],
  };
  try {
    const { docs, pages, total } = await models['Shipment'].paginate(options);
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
const outboundById = async (req, res) => {
  let where;
  if (req && req.query.type == 'id') {
    where = {
      id: req.params.id,
    };
  } else if (req && req.query.type == 'shipment_id') {
    where = {
      shipment_awb: req.params.id,
    };
  } else {
    where = {
      shipment_awbm: req.params.id,
    };
  }
  let shipmentData = await models.Shipment.findOne({
    where: where,
    include: [...modelShipmentInclude],
  });
  if (!shipmentData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  if (req.query && req.query.validate == 'OSINCOMINGWH') {
    if (shipmentData && shipmentData.is_incoming_wh) {
      return ReE(res, `Nomor ini sudah di incoming`, 403);
    }
  }
  return ReS(res, { data: shipmentData }, 200);
};
const hitungHargaCustomer = async (req, res) => {
  let user = req.decoded;
  let where;
  if (req && req.query.type == 'id') {
    where = {
      id: req.params.id,
    };
  } else if (req && req.query.type == 'shipment_id') {
    where = {
      shipment_awb: req.params.id,
    };
  } else {
    where = {
      shipment_awbm: req.params.id,
    };
  }
  let shipmentData = await models.Shipment.findOne({
    where: where,
    raw: true,
  });
  if (!shipmentData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  hitungContactPrice(
    {
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      weight_actual: shipmentData.weight_actual,
      weight_vol: shipmentData.weight_vol,
      weight_invoice: shipmentData.weight_invoice || 0,
      service_id: shipmentData.service_id,
      uom_id: shipmentData.uom_id,
      moda_id: shipmentData.moda_id,
      discount_percent: shipmentData.discount || 0,
      partner_id: shipmentData.partner_id,
    },
    user,
    (e, r) => {
      if (e) {
        return ReE(res, 'Harga tidak ditemukan', 402);
      } else {
        return ReS(res, { data: r }, 200);
      }
    }
  );
};
const shipmentSave = async (req, res) => {
  const errors = validationResult(req);
  let hasil = {};
  let bd = req.body;
  let detailItem = [];
  let detailReff = [];
  let user = req.decoded;
  let isAutoNumber = req.body.is_auto;
  if (bd && bd.detailItem) {
    detailItem = JSON.parse(bd.detailItem);
    delete bd['detailItem'];
  }
  if (bd && bd.detailReff) {
    detailReff = JSON.parse(bd.detailReff);
    delete bd['detailReff'];
  }
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  if (!errors.isEmpty()) {
    errReturn(errors.array());
  }
  let tgl = moment(new Date(bd.shipment_date)).format('YYYY-MM-DD HH:mm:ss');
  let transaction;
  let params = { ...bd };
  console.log(params);
  try {
    let dest = await models.Destination.findOne({
      where: { dest_id: bd.destination },
      raw: true,
    });
    let origin = await models.Destination.findOne({
      where: { dest_id: bd.origin },
      raw: true,
    });
    let contact = await models.Contact.findOne({
      where: { contact_id: bd.partner_id },
      raw: true,
    });
    if (!origin) {
      errReturn('Kode Asal tidak terdaftar');
    }
    if (!dest) {
      errReturn('Kode tujuan tidak terdaftar');
    }
    if (!contact) {
      errReturn('Kode Customer tidak terdaftar');
    }
    if (isAutoNumber) {
      let numeric = await numbering.CN(req);
      params.shipment_awbm = numeric.numeric;
      params.shipment_awb = numeric.number1;
      if (!numeric.status) {
        return errReturn(numeric.error);
      }
    } else {
      console.log('---cari');
      console.log(bd.shipment_awbm);
      if (!bd.shipment_awbm) {
        return errReturn('Nomor Resi belum di input');
      }
      params.shipment_awbm = bd.shipment_awbm;
      params.shipment_awb = uuidv1();
    }
    console.log(params);
    let cariNomor = await models.Shipment.findOne({
      where: { shipment_awbm: params.shipment_awbm },
    });
    if (cariNomor) {
      return errReturn('Nomor dengan resi tersebut sudah terdaftar');
    }
    params.company_id = user.company_id;
    params.company_group_id = user.company_group_id;
    params.shipment_date = tgl;
    params.pickup_date = tgl;
    params.shipment_type_id = 'CREDIT';
    params.is_cash = false;
    params.is_collect = false;
    params.is_invoice = false;
    params.is_print_invoice = false;
    params.originname = origin.dest_name;
    params.destinationname = dest.dest_name;
    params.is_process = false;
    if (!params.pickup_by) {
      params.pickup_by = user.name;
      params.pickup_id = user.contact_id;
    }
    if (params.is_from_pickup) {
      params.is_pickup = true;
      params.is_pickup_confirm = false;
      params.is_incoming_wh = false;
    } else {
      params.is_pickup = true;
      params.is_pickup_confirm = false;
      params.is_incoming_wh = true;
      params.is_incoming_wh_date = tgl;
    }
    if (params && !params.weight_actual) {
      params.weight_actual = params.weight;
    }
    if (params && !params.weight_invoice) {
      params.weight_invoice = params.weight;
    }
    if (params && !params.weight_vol) {
      params.weight_invoice = params.weight;
    }
    if (params && !params.vol) {
      params.vol = params.weight;
    }
    if (params && !params.p) {
      params.p = 0;
    }
    if (params && !params.l) {
      params.l = 0;
    }
    if (params && !params.t) {
      params.t = 0;
    }
    let xDetailItem = [];
    let xDetailReff = [];
    detailItem.map(function (v) {
      v.shipment_awb = params.shipment_awb;
      xDetailItem.push(v);
    });
    detailReff.map(function (v) {
      v.shipment_awb = params.shipment_awb;
      xDetailReff.push(v);
    });
    transaction = await s.transaction();
    await models.Shipment.create(
      {
        ...params,
      },
      { transaction }
    );
    if (xDetailItem.length > 0) {
      await models.Shipment_detail.bulkCreate(xDetailItem, { transaction });
    }
    if (xDetailReff.length > 0) {
      await models.Shipment_detail_reff.bulkCreate(xDetailReff, {
        transaction,
      });
    }
    
    await transaction.commit();
    if (params && params.is_from_pickup) {
      await history.PICKUP(
        {
          shipment_awb: params.shipment_awb,
          pickup_by: params.pickup_by,
          tanggal: tgl,
        },
        user
      );
    } else {
      await history.INCOMINGWH(
        {
          shipment_awb: params.shipment_awb,
          pickup_by: bd.pickup_by,
          tanggal: tgl,
        },
        user
      );
    }
    /** simpan contact */
    if (bd.receiver_id) {
      const contactSubData = await models['Contact_sub'].findOne({
        where: {
          contact_sub_id: bd.receiver_id,
        },
        raw: true,
      });
      if (!contactSubData) {
        await models.Contact_sub.create({
          contact_id: bd.partner_id,
          contact_sub_id: bd.receiver_id,
          contact_reff: uuidv1(),
          company_id: user.company_id,
          city_code: bd.destination,
          city_name: bd.destinationname,
          contact_type: 'Customer',
          name: bd.receiver_name,
          address1: bd.receiver_address1,
        });
      }
    }
    logger.info(JSON.stringify(params));
    return ReS(
      res,
      {
        cn: params.shipment_awbm,
      },
      200
    );
  } catch (err) {
    console.log(err);
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};
const shipmentUpdate = async (req, res) => {
  const errors = validationResult(req);
  let hasil = {};
  let bd = req.body;
  let detailItem = [];
  let detailReff = [];
  let user = req.decoded;
  const shipmentAwb = req.params.shipment_awb;
  if (bd && bd.detailItem) {
    detailItem = JSON.parse(bd.detailItem);
    delete bd['detailItem'];
  }
  if (bd && bd.detailReff) {
    detailReff = JSON.parse(bd.detailReff);
    delete bd['detailReff'];
  }
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  if (!errors.isEmpty()) {
    errReturn(errors.array());
  }
  let tgl = moment(new Date(bd.shipment_date)).format('YYYY-MM-DD HH:mm:ss');
  let transaction;
  let params = { ...bd };
  try {
    let dest = await models.Destination.findOne({
      where: { dest_id: bd.destination },
      raw: true,
    });
    let origin = await models.Destination.findOne({
      where: { dest_id: bd.origin },
      raw: true,
    });
    let contact = await models.Contact.findOne({
      where: { contact_id: bd.partner_id },
      raw: true,
    });
    if (!origin) {
      errReturn('Kode Asal tidak terdaftar');
    }
    if (!dest) {
      errReturn('Kode tujuan tidak terdaftar');
    }
    if (!contact) {
      errReturn('Kode Customer tidak terdaftar');
    }
    const shipmentData = await models.Shipment.findOne({
      where: {
        shipment_awb: shipmentAwb,
      },
      attributes: ['shipment_awb'],
    });
    if (!shipmentData) {
      return errReturn('Shipment tidak terdaftar');
    }
    
    params.shipment_date = tgl;
    params.pickup_date = tgl;
   
      params.shipment_type_id = 'CREDIT';
      params.is_cash = false;
      params.is_collect = false;
      params.is_invoice = false;
      params.is_print_invoice = false;
 
    params.originname = origin.dest_name;
    params.destinationname = dest.dest_name;
    params.is_process = false;
    if (!params.pickup_by) {
      params.pickup_by = user.name;
      params.pickup_id = user.contact_id;
    }
    if (params.is_from_pickup) {
      params.is_pickup = true;
      params.is_pickup_confirm = false;
      params.is_incoming_wh = false;
    } else {
      params.is_pickup = true;
      params.is_pickup_confirm = false;
      params.is_incoming_wh = true;
      params.is_incoming_wh_date = tgl;
    }
    if (params && !params.weight_actual) {
      params.weight_actual = params.weight;
    }
    if (params && !params.weight_invoice) {
      params.weight_invoice = params.weight;
    }
    if (params && !params.weight_vol) {
      params.weight_invoice = params.weight;
    }
    if (params && !params.vol) {
      params.vol = params.weight;
    }
    if (params && !params.p) {
      params.p = 0;
    }
    if (params && !params.l) {
      params.l = 0;
    }
    if (params && !params.t) {
      params.t = 0;
    }
    if (price) {
      params.sub_total = price.sub_total;
      params.total = price.total;
    }
    let xDetailItem = [];
    let xDetailReff = [];
    detailItem.map(function (v) {
      v.shipment_awb = params.shipment_awb;
      xDetailItem.push(v);
    });
    detailReff.map(function (v) {
      v.shipment_awb = params.shipment_awb;
      xDetailReff.push(v);
    });
    if (params.is_insurance) {
      params.is_insurance = true;
      params.insurance = params.insurance_charge;
      params.insurance_value = params.insurance_price;
    } else {
      params.is_insurance = false;
      params.insurance = 0;
      params.insurance_value = 0;
    }
    transaction = await s.transaction();
    await models.Shipment.update(
      {
        ...params,
      },
      {
        where: { shipment_awb: shipmentAwb },
      },
      { transaction }
    );
    if (xDetailItem.length > 0) {
      await models.Shipment_detail.destroy({
        where: { shipment_awb: shipmentAwb },
      });
      await models.Shipment_detail.bulkCreate(xDetailItem, { transaction });
    }
    if (xDetailReff.length > 0) {
      await models.Shipment_detail_reff.destroy({
        where: { shipment_awb: shipmentAwb },
      });
      await models.Shipment_detail_reff.bulkCreate(xDetailReff, {
        transaction,
      });
    }
    
    await transaction.commit();
    /** simpan contact */
    if (bd.receiver_id) {
      const contactSubData = await models['Contact_sub'].findOne({
        where: {
          contact_sub_id: bd.receiver_id,
        },
        raw: true,
      });
      if (!contactSubData) {
        await models.Contact_sub.create({
          contact_id: bd.partner_id,
          contact_sub_id: bd.receiver_id,
          contact_reff: uuidv1(),
          company_id: user.company_id,
          city_code: bd.destination,
          city_name: bd.destinationname,
          contact_type: 'Customer',
          name: bd.receiver_name,
          address1: bd.receiver_address1,
        });
      }
    }
    logger.info(JSON.stringify(params));
    return ReS(
      res,
      {
        cn: params.shipment_awbm,
      },
      200
    );
  } catch (err) {
    console.log(err);
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};
const shipmentUpdateIncoming = async (req, res) => {
  const errors = validationResult(req);
  let user = req.decoded;
  let bd = req.body;
  let detailItem = [];
  let detailReff = [];
  if (bd && bd.detailItem) {
    detailItem = JSON.parse(bd.detailItem);
    delete bd['detailItem'];
  }
  if (bd && bd.detailReff) {
    detailReff = JSON.parse(bd.detailReff);
    delete bd['detailReff'];
  }
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  if (!errors.isEmpty()) {
    errReturn(errors.array());
  }
  let tgl = moment(new Date(bd.shipment_date)).format('YYYY-MM-DD HH:mm:ss');
  let transaction;
  let params = { ...bd };
  try {
    let where;
    if (req && req.query.type == 'id') {
      where = {
        id: bd.id,
        company_id: user.company_id,
      };
    } else if (req && req.query.type == 'shipment_id') {
      where = {
        shipment_awb: bd.shipment_awb,
        company_id: user.company_id,
      };
    } else {
      where = {
        shipment_awbm: bd.shipment_awbm,
        company_id: user.company_id,
      };
    }
    let shipmentData = await models.Shipment.findOne({ where: where });
    if (!shipmentData) {
      return errReturn('Data tidak ditemukan');
    }
    let dest = await models.Destination.findOne({
      where: { dest_id: bd.destination },
      raw: true,
    });
    let origin = await models.Destination.findOne({
      where: { dest_id: bd.origin },
      raw: true,
    });
    let contact = await models.Contact.findOne({
      where: { contact_id: bd.partner_id },
      raw: true,
    });
    const companyData = await models.Company.findOne({
      where: {
        company_id: user.company_id,
      },
      raw: true,
    });
    if (!origin) {
      errReturn('Kode Asal tidak terdaftar');
    }
    if (!dest) {
      errReturn('Kode tujuan tidak terdaftar');
    }
    if (!contact) {
      errReturn('Kode Customer tidak terdaftar');
    }
    if (companyData.city_code !== origin.hub_id) {
      errReturn(`Shipment ini harus di incoming oleh cabang ${origin.hub_id}`);
    }
    params.company_id = user.company_id;
    params.company_group_id = user.company_group_id;
    params.shipment_date = tgl;
    params.pickup_date = tgl;
    if (contact && contact.is_cash) {
      params.shipment_type_id = 'CASH';
      params.is_cash = true;
      params.is_invoice = true;
      params.is_print_invoice = true;
    } else {
      params.shipment_type_id = 'CREDIT';
      params.is_cash = false;
    }
    params.originname = origin.dest_name;
    params.destinationname = dest.dest_name;
    params.is_process = false;
    if (!params.pickup_by) {
      params.pickup_by = user.name;
      params.pickup_id = user.contact_id;
    }
    if (params.is_from_pickup) {
      params.is_pickup = true;
      params.is_pickup_confirm = false;
      params.is_incoming_wh = false;
    } else {
      params.is_pickup = true;
      params.is_pickup_confirm = false;
      params.is_incoming_wh = true;
      params.is_incoming_wh_date = tgl;
    }
    if (params && !params.weight_actual) {
      params.weight_actual = params.weight;
    }
    if (params && !params.weight_invoice) {
      params.weight_invoice = params.weight;
    }
    if (params && !params.weight_vol) {
      params.weight_invoice = params.weight;
    }
    if (params && !params.vol) {
      params.vol = params.weight;
    }
    if (params && !params.p) {
      params.p = 0;
    }
    if (params && !params.l) {
      params.l = 0;
    }
    if (params && !params.t) {
      params.t = 0;
    }
    let xDetailItem = [];
    let xDetailReff = [];
    detailItem.map(function (v) {
      v.shipment_awb = params.shipment_awb;
      xDetailItem.push(v);
    });
    detailReff.map(function (v) {
      v.shipment_awb = params.shipment_awb;
      xDetailReff.push(v);
    });
    transaction = await s.transaction();
    await models.Shipment_detail.destroy({
      where: { shipment_awb: params.shipment_awb },
      transaction,
    });
    await models.Shipment_detail_reff.destroy({
      where: { shipment_awb: params.shipment_awb },
      transaction,
    });
    await models.Shipment.update(params, {
      where: {
        shipment_awb: params.shipment_awb,
      },
      transaction,
    });
    if (xDetailItem.length > 0) {
      await models.Shipment_detail.bulkCreate(xDetailItem, { transaction });
    }
    if (xDetailReff.length > 0) {
      await models.Shipment_detail_reff.bulkCreate(xDetailReff, {
        transaction,
      });
    }
    console.log('--->>>>>>>> update incoming');
    await transaction.commit();
    const x = await history.INCOMINGWH(
      {
        shipment_awb: params.shipment_awb,
        pickup_by: user.name,
        tanggal: new Date(),
      },
      user
    );
    logger.info(JSON.stringify(params));
    return ReS(res, { cn: params.shipment_awbm }, 200);
  } catch (err) {
    console.log(err);
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};
const shipmentUpdateStatus = async (req, res) => {
  try {
    let hasil = {};
    let bd = req.body;
    console.log(req.body);
    let user = req.decoded;
    let shipment_awb = req.params.shipment_awb;
    let tgl = moment(new Date(bd.status_date)).format('YYYY-MM-DD HH:mm:ss');
    bd.status_date = tgl;
    let statusData = await models.Status.findOne({
      where: {
        status_id: bd.status_id,
      },
      raw: true,
    });
    console.log(statusData);
    if (!statusData) {
      return ReE(res, 'Status tidak terdaftar', 403);
    }
    let result;
    switch (bd.status_id) {
      case 'INCOMING_WH':
        result = await history.INCOMINGWH(
          {
            shipment_awb: shipment_awb,
            tanggal: tgl,
          },
          user
        );
        break;
      case 'ARRIVE':
        result = await history.ARRIVAL(
          {
            shipment_awb: shipment_awb,
            tanggal: tgl,
          },
          user
        );
        break;
      case 'DELIVERY':
        result = await history.DELIVERY(
          {
            shipment_awb: shipment_awb,
            tanggal: tgl,
            delivery_id: bd.ref_id_no,
            name: bd.ref_no,
          },
          user
        );
        break;
      case 'DEPARTURE':
        result = await history.DEPARTURE(
          {
            shipment_awb: shipment_awb,
            tanggal: tgl,
            assignment_id: bd.ref_id_no,
            ref_no: bd.ref_no,
            ref_id_no: bd.ref_id_no,
          },
          user
        );
        break;
      case 'MANIFEST_ORIGIN':
      case 'TRANSIT_MANIFEST':
      case 'PORT_ORIGIN':
        result = await history.MANIFEST(
          {
            shipment_awb: shipment_awb,
            tanggal: tgl,
            manifest_id: bd.ref_id_no,
            ref_no: bd.ref_no,
            ref_id_no: bd.ref_id_no,
            description: bd.remark,
          },
          user
        );
        break;
      case 'RECEIVED_SUCCESS':
        result = await history.RECEIVED(
          {
            shipment_awb: shipment_awb,
            tanggal: tgl,
            name: bd.ref_no,
            delivery_id: bd.ref_id_no,
            ref_no: bd.ref_no,
            ref_id_no: bd.ref_id_no,
            description: bd.remark,
            pic1: bd.pic1 ? bd.pic1 : null,
            pic2: bd.pic2 ? bd.pic2 : null,
            pic3: bd.pic3 ? bd.pic3 : null,
            pic4: bd.pic4 ? bd.pic4 : null,
            pic5: bd.pic5 ? bd.pic5 : null,
            pic6: bd.pic6 ? bd.pic6 : null,
          },
          user
        );
        break;
      case 'RETURN_POD':
        result = await history.STTRETURN(
          {
            shipment_awb: shipment_awb,
            tanggal: tgl,
            name: bd.ref_no,
            stt_return_id: bd.ref_id_no,
            ref_no: bd.ref_no,
            ref_id_no: bd.ref_id_no,
            description: bd.remark,
            pic1: bd.pic1 ? bd.pic1 : null,
            pic2: bd.pic2 ? bd.pic2 : null,
            pic3: bd.pic3 ? bd.pic3 : null,
            pic4: bd.pic4 ? bd.pic4 : null,
            pic5: bd.pic5 ? bd.pic5 : null,
            pic6: bd.pic6 ? bd.pic6 : null,
          },
          user
        );
        break;
      case 'RETURN_CUSTOMER':
        result = await history.STT_RETURN_CUSTOMER(
          {
            shipment_awb: shipment_awb,
            tanggal: tgl,
            partner_name: bd.ref_no,
            stt_return_id: bd.ref_id_no,
            ref_no: bd.ref_no,
            ref_id_no: bd.ref_id_no,
            description: bd.remark,
            pic1: bd.pic1 ? bd.pic1 : null,
            pic2: bd.pic2 ? bd.pic2 : null,
            pic3: bd.pic3 ? bd.pic3 : null,
            pic4: bd.pic4 ? bd.pic4 : null,
            pic5: bd.pic5 ? bd.pic5 : null,
            pic6: bd.pic6 ? bd.pic6 : null,
          },
          user
        );
        break;
      default:
        // code block
        return ReE(res, 'Status tidak terdaftar', 403);
    }
    return ReS(res, result, 200);
  } catch (error) {
    return ReE(res, error.message, 403);
  }
};
const shipmentUpdateAWBM = async (req, res) => {
  try {
    let bd = req.body;
    let shipment_awb = req.params.shipment_awb;
    await models.Shipment.update(
      {
        shipment_awbm: bd.shipment_awbm,
      },
      {
        where: {
          shipment_awb,
        },
      }
    );
    return res.json({ success: true });
  } catch (error) {
    return ReE(res, error.message, 403);
  }
};
const deleteById = async (req, res) => {
  let user = req.decoded;
  let shipmentData = await models.Shipment.findOne({
    where: { id: req.params.id, company_id: user.company_id },
  });
  if (!shipmentData) {
    return ReE(res, `Shipment tidak ada `, 404);
  }
  const companyData = await models.Company.findOne({
    where: {
      company_id: shipmentData.company_id,
    },
    raw: true,
  });
  const hostData = await models.Destination.findOne({
    where: {
      dest_id: shipmentData.destination,
    },
    raw: true,
  });
  if (companyData.city_code == hostData.hub_id) {
    if (shipmentData.is_delivery) {
      return ReE(res, `Shipment tidak bisa dihapus`, 404);
    }
  } else {
    if (shipmentData.is_manifest) {
      return ReE(res, `Shipment tidak bisa dihapus`, 404);
    }
  }
  const invoice = await models.Invoice.findOne({
    where: { invoice_no: shipmentData.shipment_awbm },
  });
  try {
    if (invoice && invoice.paid !== 0) {
      return ReE(res, 'Tidak bisa di hapus karena sudah ada pembayaran', 404);
    }
    await models.Invoice.destroy({ where: { invoice_id: shipmentData.shipment_awbm } });
    await models.Invoice_detail.destroy({ where: { invoice_id: shipmentData.shipment_awbm } });
    await models.Shipment_billing.destroy({ where: { shipment_awb: shipmentData.shipment_awb } });
    await models.Shipment_detail.destroy({ where: { shipment_awb: shipmentData.shipment_awb } });
    await models.Shipment_detail_reff.destroy({ where: { shipment_awb: shipmentData.shipment_awb } });
    await models.Shipment_expense.destroy({ where: { shipment_awb: shipmentData.shipment_awb } });
    await models.Shipment_pickup.destroy({ where: { shipment_awb: shipmentData.shipment_awb } });
    await models.History.destroy({ where: { shipment_awb: shipmentData.shipment_awb } });
    await models.Shipment.destroy({ where: { shipment_awb: shipmentData.shipment_awb } });
    return ReS(
      res,
      {
        data: shipmentData,
      },
      200
    );
  } catch (err) {
    return ReE(res, err, 404);
  }
};
module.exports = {
  pickupView,
  pickupViewOs,
  outboundView,
  outboundById,
  shipmentSave,
  shipmentUpdate,
  filterShipment,
  mShipmentInclude,
  mOSManifest,
  shipmentUpdateIncoming,
  shipmentUpdateStatus,
  deleteById,
  hitungHargaCustomer,
  shipmentUpdateAWBM,
};
