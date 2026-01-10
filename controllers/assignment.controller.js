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
const updateDeleteShipmentBerangkat = async (shipment, assignment_id, tgl, user) => {
  return await Promise.all(
    shipment.map(async (s) => {

      const x = await models.History.destroy({
        where:{
          shipment_awb:s.shipment_awb,
          status_id:'DEPARTURE'
        }
      })
      await models.Shipment.update(
        {
          is_manifest: true,
            is_departure: false,
            departure_by: null,
            departure_date: null,
            last_status: null,
            last_status_remark: `Departure di hapus`
        },
        {
          where: {
            shipment_awb: s.shipment_awb,
          },
        }
      );
      return {
        ...x,
      };
    })
  );
};

const updateShipmentBerangkat = async (shipment, assignment_id, tgl, user) => {
  return await Promise.all(
    shipment.map(async (s) => {

      const x = await history.DEPARTURE(
        {
          shipment_awb: s.shipment_awb,
          assignment_id: assignment_id,
          tanggal: tgl,
        },
        user
      );
      return {
        ...x,
      };
    })
  );
};

const updateManifestBerangkat = async (manifest, tgl, user) => {
  const errReturn = async (err) => {
    return await Promise.reject(err);
  };
  return await Promise.all(
    manifest.map(async (dt) => {
      const dtShipment = await models.Manifest_detail.findAll({
        where: {
          company_id: user.company_id,
          manifest_id: dt.manifest_id,
        },
      });
      const dtShipmentUpdate = await updateShipmentBerangkat(dtShipment, dt.assignment_id, tgl, user);
      await models.Manifest_header.update(
        {
          is_confirm_outbound: true,
          is_confirm: true,
          confirm_outbound_date: tgl,
          ref_no: dt.assignment_id,
        },
        {
          where: {
            manifest_id: dt.manifest_id,
          },
        }
      );
      return {
        ...dtShipmentUpdate,
      };
    })
  );
};

const updateDeleteManifestBerangkat = async (manifest, tgl, user) => {
  const errReturn = async (err) => {
    return await Promise.reject(err);
  };
  return await Promise.all(
    manifest.map(async (dt) => {
      const dtShipment = await models.Manifest_detail.findAll({
        where: {
          company_id: user.company_id,
          manifest_id: dt.manifest_id,
        },
      });
      const dtShipmentUpdate = await updateDeleteShipmentBerangkat(dtShipment, dt.assignment_id, tgl, user);
      await models.Manifest_header.update(
        {
          is_confirm_outbound: false,
          is_confirm: false,
          confirm_outbound_date: null,
          ref_no: null,
        },
        {
          where: {
            manifest_id: dt.manifest_id,
          },
        }
      );
      return {
        ...dtShipmentUpdate,
      };
    })
  );
};



const osAssignmentManifest = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  try {
    let dataX = await models.Manifest_header.findAll({
      where: {
        company_id: user.company_id,
        is_confirm_outbound: false,
      },
      order: [['manifest_date', 'ASC']],
      include: [
        {
          model: models.Manifest_detail,
          as: 'detail_manifest',
          required: false,
          order: [['company_branch_id', 'ASC']],
          include: [
            {
              model: models.Shipment,
              as: 'shipment_detail',
              required: false,
            },
          ],
        },
      ],
    });
    return ReS(
      res,
      {
        data: dataX,
      },
      200
    );
  } catch (err) {
    return errReturn(err.message);
  }
};
const saveAssignmentManifest = async (req, res) => {
  const errors = validationResult(req);
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  if (!errors.isEmpty()) {
    errReturn(errors.array());
  }
  let user = req.decoded;
  let bd = req.body;
  let dataBagging = [];
  let tgl = moment(new Date(bd.assignment_date)).format('YYYY-MM-DD HH:mm:ss');
  if (bd && bd.detail && bd.detail.length > 0) {
    dataBagging = bd.detail;
    delete bd['detail'];
  }
  let cariBagging = [];
  dataBagging.map(function (v) {
    cariBagging.push(v.manifest_id);
  });
  let checkShipment = await models.Manifest_header.findAll({
    attributes: ['manifest_id'],
    where: {
      is_confirm: true,
      manifest_id: {
        [Op.in]: cariBagging,
      },
    },
    raw: true,
  });
  let checkDataShipment = await models.Manifest_detail.findAll({
    attributes: ['shipment_awb'],
    raw: true,
    where: {
      manifest_id: {
        [Op.in]: cariBagging,
      },
    },
    group: ['shipment_awb'],
  });
  if (checkShipment.length > 0) {
    return ReE(res, 'Error', 'Ada Manifest yang sudah pernah di proses ' + JSON.stringify(checkShipment));
  }
  let transaction;
  let errBranch = [];
  await Promise.all(
    dataBagging.map(async (x) => {
      if (!x.company_branch_id) {
        errBranch.push(x);
      } else {
        const y = await models.Company.findOne({ where: { company_id: x.company_branch_id }, raw: true });
        if (!y) {
          errBranch.push(x);
        }
      }
    })
  );
  if (errBranch.length > 0) {
    return errReturn('Ada data yang belum ada cabang / penerima');
  }
  try {
    let contact = await models.Contact.findOne({
      where: { contact_id: bd.contact_id },
      raw: true,
    });
    if (!contact) {
      return errReturn('Vendor tidak terdaftar');
    }
    const numeric = await numbering.ASSIGNMENT_MANIFEST(req);
    const detailData = await Promise.all(
      dataBagging.map(async (x) => {
        return {
          manifest_id: x.manifest_id,
          company_id: user.company_id,
          assignment_id: numeric.numeric,
          company_branch_id: x.company_branch_id,
          company_branch_name: x.company_branch_name,
        };
      })
    );
    transaction = await s.transaction();
    let params = {
      company_id: user.company_id,
      assignment_id: numeric.numeric,
      contact_id: bd.contact_id,
      name: contact.name,
      pic: bd.pic || null,
      assignment_date: tgl,
      description: bd.description || null,
      ref_no: bd.ref_no || null,
      total_bagging: detailData.length,
      weight: bd.weight || 1,
      weight_volume: bd.weight_volume || 1,
      uom_id: bd.uom_id || 'KG',
      status_id: bd.status_id,
      usrupd: user.name,
      moda_id: bd.moda_id,
      is_confirm: true,
      confirm_date: tgl,
    };
    await models.Assignment_manifest.create(params, transaction);
    await models.Assignment_manifest_detail.bulkCreate(detailData, { transaction });
    await transaction.commit();
    const updateAll = await updateManifestBerangkat(detailData, tgl, user);
    logger.info(JSON.stringify(params));
    return ReS(
      res,
      {
        ...params,
      },
      200
    );
  } catch (err) {
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};
const updateAssignmentManifest=async(req,res)=>{
  const errors = validationResult(req);
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  if (!errors.isEmpty()) {
    errReturn(errors.array());
  }
  let user = req.decoded;
  let bd = req.body;
  let dataBagging = [];
  let hasil={};
  let tgl = moment(new Date(bd.assignment_date)).format('YYYY-MM-DD HH:mm:ss');
  if (bd && bd.detail && bd.detail.length > 0) {
    dataBagging = bd.detail;
    delete bd['detail'];
  }
  let cariBagging = [];
  let dataAssignment = await models.Assignment_manifest.findOne({
    where:{assignment_id:req.params.assignment_id},
    include: [
      {
        model: models.Assignment_manifest_detail,
        as: 'assignment_manifest_detail',
        required: false,
      },
    ],
  })
  if (dataAssignment && dataAssignment.total_bagging_success>0){
    return errReturn('Data tidak bisa di edit , karena sudah di proses');
  }
  dataBagging.map(function (v) {
    cariBagging.push(v.manifest_id);
  });
  let errBranch = [];
  await Promise.all(
    dataBagging.map(async (x) => {
      if (!x.company_branch_id) {
        errBranch.push(x);
      } else {
        const y = await models.Company.findOne({ where: { company_id: x.company_branch_id }, raw: true });
        if (!y) {
          errBranch.push(x);
        }
      }
    })
  );
  if (errBranch.length > 0) {
    return errReturn('Ada data yang belum ada cabang / penerima');
  }

  hasil.assignment_id = dataAssignment.delivery_id;
  dataAssignment=dataAssignment.toJSON();
  let dataOld = dataAssignment.assignment_manifest_detail;
  let dataCurrent=dataBagging;
  let removeData = dataOld.filter(custom.comparer(dataCurrent));
  let transaction;
  try{
    transaction = await s.transaction();
    let contact = await models.Contact.findOne({
      where: { contact_id: bd.contact_id },
      raw: true,
    });
    if (!contact) {
      return errReturn('Vendor tidak terdaftar');
    }
    const detailData = await Promise.all(
      dataBagging.map(async (x) => {
        return {
          manifest_id: x.manifest_id,
          company_id: user.company_id,
          assignment_id:dataAssignment.assignment_id,
          company_branch_id: x.company_branch_id,
          company_branch_name: x.company_branch_name,
        };
      })
    );

    let params = {
      company_id: user.company_id,
      contact_id: bd.contact_id,
      name: contact.name,
      pic: bd.pic || null,
      assignment_date: tgl,
      description: bd.description || null,
      ref_no: bd.ref_no || null,
      total_bagging: detailData.length,
      weight: bd.weight || 1,
      weight_volume: bd.weight_volume || 1,
      uom_id: bd.uom_id || 'KG',
      status_id: bd.status_id,
      usrupd: user.name,
      moda_id: bd.moda_id,
      is_confirm: true,
      confirm_date: tgl,
    };

    await models.Assignment_manifest.update(params, { where: { id: dataAssignment.id } }, { transaction });
    await models.Assignment_manifest_detail.destroy({ where: { assignment_id: dataAssignment.assignment_id } });
    await models.Assignment_manifest_detail.bulkCreate(detailData, { transaction });

    await transaction.commit();
    transaction=null;
    const updateAll = await updateManifestBerangkat(detailData, tgl, user);
    if (removeData && removeData.length>0){
      const updateAllDelete = await updateDeleteManifestBerangkat(removeData, tgl, user);
    }


    logger.info(JSON.stringify(params));
    return ReS(
      res,
      {
        ...params,
      },
      200
    );

  } catch (err) {
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }



}
const getAssignmentManifest = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
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
      ed = moment(new Date(end_date)).format('YYYY-MM-DD 00:00:00');
    } else {
      ed = moment(new Date(start_date)).add(1, 'day').format('YYYY-MM-DD 00:00:00');
    }
  } else {
    st: null;
    ed: null;
  }
  if (st) {
    src.assignment_date = {
      [Op.between]: [st, ed],
    };
  }
  let options = {
    where: src,
    order: [['assignment_date', 'DESC']],
    page: pg,
    paginate: limit,
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
        include: [
          {
            model: models.Manifest_header,
            as: 'manifest_detail',
            required: false,
          },
        ],
      },
    ],
  };
  try {
    const { docs, pages, total } = await models['Assignment_manifest'].paginate(options);
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

const getAssignmentManifestByAssigmentId = async (req, res) => {
  let user = req.decoded;

  try {
  const assignmentData = await models.Assignment_manifest.findOne({
    where:{
      assignment_id:req.params.assignment_id,
      company_id:user.company_id
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


  if (!assignmentData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  return ReS(res, { data: assignmentData }, 200);
  } catch (err) {
    return ReE(res, err, err.message);
  }
};

const countOutstandingDeliveryAssignment = async (req, res) => {
  try {
    let user = req.decoded;
    let start_date = req.query.start_date || null;
    let end_date = req.query.end_date || null;
    let st, ed;
    if (start_date) {
      st = moment(new Date(start_date)).format('YYYY-MM-DD 00:00:00');
      if (end_date) {
        ed = moment(new Date(end_date)).format('YYYY-MM-DD 00:00:00');
      } else {
        ed = moment(new Date(start_date)).add(1, 'day').format('YYYY-MM-DD 00:00:00');
      }
    } else {
      st: null;
      ed: null;
    }
    let dataOsWaitingCourier = await models.Assignment_delivery.findAll({
      attributes: [
        [s.fn('sum', s.literal('CASE WHEN (is_confirm=false) THEN 1 ELSE 0 END')), 'osWaitingCourier'],
        [s.fn('sum', s.literal('CASE WHEN (is_confirm=true and is_finish=false) THEN 1 ELSE 0 END')), 'osOndelivery'],
      ],
      where: {
        company_id: user.company_id,
      },
    });
    let rsp = {
      data: dataOsWaitingCourier,
    };
    return ReS(res, rsp, 200);
  } catch (err) {
    return ReE(res, err, err.message);
  }
};
const outstandingDeliveryAssignmentCourier = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
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
  src.is_confirm = false;
  let options = {
    where: src,
    order: [['assignment_date', 'ASC']],
    page: pg,
    paginate: limit,
    include: [
      {
        model: models.Contact,
        as: 'contact_detail',
        required: false,
      },
      {
        model: models.Assignment_delivery_detail,
        as: 'assignment_delivery_detail',
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
            ],
            required: false,
          },
        ],
        required: false,
      },
    ],
  };
  try {
    const { docs, pages, total } = await models['Assignment_delivery'].paginate(options);
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
const outstandingOnDeliveryAssignmentCourier = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  if (req.query && req.query.term) {
    src = {
      company_id: user.company_id,
      is_confirm: true,
      is_finish: false,
    };
  } else {
    src = {
      company_id: user.company_id,
      is_confirm: true,
      is_finish: false,
    };
  }
  src.is_confirm = true;
  let options = {
    where: src,
    order: [['assignment_date', 'ASC']],
    page: pg,
    paginate: limit,
    include: [
      {
        model: models.Contact,
        as: 'contact_detail',
        required: false,
      },
      {
        model: models.Assignment_delivery_detail,
        as: 'assignment_delivery_detail',
        where: {
          is_confirm: false,
        },
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
            ],
            required: false,
          },
        ],
        required: false,
      },
    ],
  };
  try {
    const { docs, pages, total } = await models['Assignment_delivery'].paginate(options);
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
const viewDelivery = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
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
      ed = moment(new Date(end_date)).format('YYYY-MM-DD 00:00:00');
    } else {
      ed = moment(new Date(start_date)).add(1, 'day').format('YYYY-MM-DD 00:00:00');
    }
  } else {
    st: null;
    ed: null;
  }
  if (st) {
    src.assignment_date = {
      [Op.between]: [st, ed],
    };
  }


  let options = {
    where: src,
    order: [['assignment_date', 'DESC']],
    page: pg,
    paginate: limit,
    include: [
      {
        model: models.Contact,
        as: 'contact_detail',
        required: false,
      },
      {
        model: models.Assignment_delivery_detail,
        as: 'assignment_delivery_detail',
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
              'route_id',
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
    const { docs, pages, total } = await models['Assignment_delivery'].paginate(options);
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
const updateDeliveryToShipment = async (delivery, tgl, user, nama) => {
  const errReturn = async (err) => {
    return await Promise.reject(err);
  };
  return await Promise.all(
    delivery.map(async (item) => {
      const dtShipmentUpdate = await history.DELIVERY(
        {
          shipment_awb: item.shipment_awb,
          delivery_id: item.delivery_id,
          name: nama,
          tanggal: tgl,
        },
        user
      );
      return {
        ...dtShipmentUpdate,
      };
    })
  );
};
const saveDelivery = async (req, res) => {
  const errors = validationResult(req);
  const errReturn = function (message) {

    return ReE(res, message, 403);
  };
  if (!errors.isEmpty()) {

    errReturn(errors.array());
  }
  let transaction;
  try {
  let user = req.decoded;
  let bd = req.body;
  let dataShipment = [];
  let tgl = moment(new Date(bd.assignment_date)).format('YYYY-MM-DD HH:mm:ss');
  if (bd && bd.detail && bd.detail.length > 0) {
    dataShipment = bd.detail;
    delete bd['detail'];
  }
  let contact = await models.Contact.findOne({
    where: {
      contact_id: bd.contact_id,
    },
    raw: true,
  });
  let cariShipment = [];
  dataShipment.map(function (v) {
    cariShipment.push(v);
  });
  let checkShipment = await models.Shipment.findAll({
    attributes: ['shipment_awbm'],
    where: {
      is_delivery: true,
      shipment_awb: {
        [Op.in]: cariShipment,
      },
    },
    raw: true,
  });


  if (checkShipment.length > 0) {
    return ReE(res, 'Ada shipment yang sudah pernah di proses ' + JSON.stringify(checkShipment), 403);
  }
  if (!contact) {
    return ReE(res, 'Error', 'Data Contact ' + bd.contact_id + ' tidak ada');
  }
  transaction = await s.transaction();

    const numeric = await numbering.ASSIGNMENT_DELIVERY(req);

    const detailData = await Promise.all(
      dataShipment.map(async (x) => {

        return {
          company_id: user.company_id,
          delivery_id: numeric.numeric,
          shipment_awb: x,
          usrupd: user.email,
        };
      })
    );

    let dtDelivery = {
      company_id: user.company_id,
      delivery_id: numeric.numeric,
      contact_id: bd.contact_id,
      name: contact.name,
      assignment_date: tgl,
      description: bd.description,
      total_shipment: dataShipment.length,
      status_id: '01',
      usrupd: user.email,
    };

    await models.Assignment_delivery.create(dtDelivery, transaction);
    await models.Assignment_delivery_detail.bulkCreate(detailData, { transaction });
    await transaction.commit();
    const updateAll = await updateDeliveryToShipment(detailData, tgl, user, contact.name);
    logger.info(JSON.stringify(dtDelivery));
    return ReS(
      res,
      {
        ...dtDelivery,
      },
      200
    );
  } catch (err) {
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};
const updateDelivery = async (req, res) => {
  const errors = validationResult(req);
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  if (!errors.isEmpty()) {
    errReturn(errors.array());
  }
  let user = req.decoded;
  let bd = req.body;
  let hasil = {};
  let tgl = moment(new Date(bd.assignment_date)).format('YYYY-MM-DD HH:mm:ss');
  if (bd && bd.detail && bd.detail.length > 0) {
    hasil.detail = bd.detail;
    delete bd['detail'];
  }
  let dataDelivery = await models.Assignment_delivery.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: models.Assignment_delivery_detail,
        as: 'assignment_delivery_detail',
        required: false,
      },
    ],
  });

  let contact = await models.Contact.findOne({
    where: {
      contact_id: bd.contact_id,
    },
    raw: true,
  });
  if (!contact) {
    return ReE(res, 'Contact tidak terdaftar', 404);
  }
  if (!dataDelivery) {
    return ReE(res, 'data kosong', 404);
  }
  if (bd.detail && bd.detail.length == 0) {
    return ReE(res, 'data detail kosong', 404);
  }
  hasil.delivery_id = dataDelivery.delivery_id;
  dataDelivery = dataDelivery.toJSON();
  let dataOld = dataDelivery.assignment_delivery_detail;
  let dataCurrent = hasil.detail;
  let removeData = dataOld.filter(custom.comparer(dataCurrent));
  let transaction;
  try {
    transaction = await s.transaction();
    /** Remove  data */
    await Promise.all(
      removeData.map(async (item) => {
        await models.Shipment.update({ is_delivery: false, is_manifest: false }, { where: { shipment_awb: item.shipment_awb } });
        await models.Assignment_delivery_detail.destroy({ where: { id: item.id } });
        await history.LOG({
          status: 'UPDATE',
          status_name: 'DELIVERY SHEET',
          reff_1: hasil.delivery_id,
          reff_2: item.shipment_awb,
          company_id: user.company_id,
        });
        return item;
      })
    );
    /** END  */
    let dtDelivery = {
      company_id: user.company_id,
      contact_id: bd.contact_id,
      name: contact.name,
      assignment_date: tgl,
      description: bd.description,
      total_shipment: hasil.detail.length,
      status_id: '01',
      usrupd: user.email,
    };
    let dtDeliveryDetail = [];
    const dataDetail = await Promise.all(
      hasil.detail.map(async (item) => {


        const dataDetail = await models.Assignment_delivery_detail.findOne({
          where: {
            delivery_id: dataDelivery.delivery_id,
            shipment_awb: item,
          },
        });
        if (!dataDetail) {
          dtDeliveryDetail.push({
            company_id: user.company_id,
            delivery_id: hasil.delivery_id,
            shipment_awb: item,
            usrupd: user.email,
          });
        }
        return {
          company_id: user.company_id,
          delivery_id: hasil.delivery_id,
          shipment_awb: item,
          usrupd: user.email,
        };
      })
    );

    await models.Assignment_delivery.update(dtDelivery, { where: { id: req.params.id } }, { transaction });
    await models.Assignment_delivery_detail.bulkCreate(dtDeliveryDetail, { transaction });
    await transaction.commit();
    const updateAll = await updateDeliveryToShipment(dataDetail, tgl, user, contact.name);
    logger.info(JSON.stringify(dataDetail));
    return ReS(
      res,
      {
        ...dtDelivery,
      },
      200
    );
  } catch (err) {
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};
const deliverySheetById = async (req, res) => {
  try {
    let deliveryData
    if (req.query && req.query.term) {
       deliveryData = await models.Assignment_delivery.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: models.Contact,
            as: 'contact_detail',
            required: false,
          },
          {
            model: models.Assignment_delivery_detail,
            as: 'assignment_delivery_detail',
            include: [
              {
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
              },
            ],
            required: false,
          },
        ],
      });
      return ReS(res, { data: deliveryData }, 200);
    } else {
       deliveryData = await models.Assignment_delivery.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: models.Contact,
            as: 'contact_detail',
            required: false,
          },
          {
            model: models.Assignment_delivery_detail,
            as: 'assignment_delivery_detail',
            include: [
              {
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
              },
            ],
            required: false,
          },
        ],
      });

      return ReS(
        res,
        {
          data: deliveryData,
        },
        200
      );
    }
  } catch (err) {
    return ReE(res, err.message, 402);
  }
};
const undeliverySheet = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = {
    is_incoming_wh: true,
    is_manifest: true,
    is_departure: true,
    is_arrive: true,
    is_delivery: false,
  };

  if (req.query && req.query.term) {
    src = {

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
  }
  let options = {
    where: src,
    page: pg,
    paginate: limit,
  };


  const shipmentInboundOs = await models.Shipment.findAll({
    where: {
      ...src
    },
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
      'route_id',
      'itemdesc',
    ],
    order: [['shipment_date', 'ASC']],
    include: [
      {
        model: models.Manifest_detail,
        as: 'detail_manifest',
        required: true,
        include: [
          {
            model: models.Manifest_header,
            as: 'header_manifest',
            required: true,
            attributes: ['hub_id'],
            include: [
              {
                model: models.Assignment_manifest_detail,
                as: 'assignment_detail_manifest',
                where: {
                  company_branch_id: user.company_id,
                },
                attributes: [],
                required: true,
              },
            ],
          },
        ],
      },
    ],
  });
  const shipmentOutboundOs = await models.Shipment.findAll({
    where: {
      ...src,
      company_id: user.company_id,
    },
    order: [['shipment_date', 'ASC']],
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
      'route_id',
      'itemdesc',
    ],
  });
  return ReS(
    res,
    {
      data: shipmentInboundOs.concat(shipmentOutboundOs),
    },
    200
  );
};


const undeliverySheetByShipmentAwb = async (req, res) => {
  let user = req.decoded;
  let src = {};

  try {


    const awb = await models.Shipment.findOne({where:{shipment_awbm:req.params.id}})

    if (!awb){
      return ReE(res,'Shipment tidak ada',402)
    }

  const shipment_awb=awb.shipment_awb;

  let options = {
    where: {
      shipment_awb
    },
  };

  const shipmentInboundOs = await models.Shipment.findOne({
    where: {
      is_incoming_wh: true,
      is_manifest: true,
      is_departure: true,
      is_arrive: true,
      is_delivery: false,
      shipment_awb
    },
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
      'route_id',
      'itemdesc',
    ],
    include: [
      {
        model: models.Manifest_detail,
        as: 'detail_manifest',
        required: true,
        include: [
          {
            model: models.Manifest_header,
            as: 'header_manifest',
            required: true,
            attributes: ['hub_id'],
            include: [
              {
                model: models.Assignment_manifest_detail,
                as: 'assignment_detail_manifest',
                where: {
                  company_branch_id: user.company_id,
                },
                attributes: [],
                required: true,
              },
            ],
          },
        ],
      },
    ],
  });
  const shipmentOutboundOs = await models.Shipment.findOne({
    where: {
      is_incoming_wh: true,
      is_manifest: true,
      is_departure: true,
      is_arrive: true,
      is_delivery: false,
      company_id: user.company_id,
      shipment_awb
    },
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
      'route_id',
      'itemdesc',
    ],
  });

  let rst=[];
  if (shipmentInboundOs){
    rst=shipmentInboundOs

  }
  if (shipmentOutboundOs){
    rst=shipmentOutboundOs
  }

  return ReS(
    res,
    {
      data: rst
    },
    200
  );
} catch(err){

  return ReE(res,err.message,402)
}


};


module.exports = {
  osAssignmentManifest,
  saveAssignmentManifest,
  updateAssignmentManifest,
  getAssignmentManifest,
  countOutstandingDeliveryAssignment,
  outstandingDeliveryAssignmentCourier,
  outstandingOnDeliveryAssignmentCourier,
  viewDelivery,
  saveDelivery,
  updateDelivery,
  undeliverySheet,
  undeliverySheetByShipmentAwb,
  deliverySheetById,
  getAssignmentManifestByAssigmentId
};
