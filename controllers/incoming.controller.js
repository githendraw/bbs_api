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
const { mOSManifest, mShipmentInclude } = require('./shipment.controller');
const s = require('../models/index').sequelize;
const osIncoming = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = null;
  if (req.query && req.query.term) {
    src = {
      company_branch_id: user.company_id,
      // is_confirm:true,
      is_incoming_wh: false,
    };
  } else {
    src = {
      company_branch_id: user.company_id,
      is_incoming_wh: false,
      // is_confirm:true
    };
  }
  let options = {
    // order: [["assignment_date", "DESC"]],
    where: src,
    page: pg,
    paginate: limit,
    include: [
      {
        model: models.Manifest_header,
        as: 'manifest_detail',
        required: false,
      },
      {
        model: models.Assignment_manifest,
        as: 'assignment_manifest',
        include: [
          {
            model: models.Company,
            as: 'company_origin',
            required: false,
          },
          {
            model: models.Contact,
            as: 'vendor',
            required: false,
          },
        ],
        required: false,
      },
    ],
    // include: [
    //   {
    //     model: models.Company,
    //     as: "company_origin",
    //     required: false,
    //   },
    //   {
    //     model: models.Contact,
    //     as: "vendor",
    //     required: false,
    //   },
    //   {
    //     model: models.Assignment_manifest_detail,
    //     as: "assignment_manifest_detail",
    //     where: src,
    //     include: [
    //       {
    //         model: models.Manifest_header,
    //         as: "manifest_detail",
    //         // where:{
    //         //   is_arrival:false
    //         // },
    //         required: false,
    //       },
    //     ],
    //     required: false,
    //   },
    // ],
  };
  try {
    const { docs, pages, total } = await models['Assignment_manifest_detail'].paginate(options);
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
const getOsIncomingByAssignment = async (req, res) => {
  let user = req.decoded;
  const assignmentId = req.params.assignment_id;
  const manifestId = req.params.manifest_id;
  try {
    const resultData = await models.Assignment_manifest_detail.findOne({
      where: {
        assignment_id: assignmentId,
        company_branch_id: user.company_id,
        manifest_id: manifestId,
        is_incoming_wh: false,
      },
    });
    if (!resultData) {
      return ReE(res, 'No Manifest di assignment ini tidak ada');
    }
    const assignmentData = await models.Assignment_manifest.findOne({
      where: {
        assignment_id: resultData.assignment_id,
      },
      include: [
        {
          model: models.Company,
          as: 'company_branch',
          required: false,
        },
        {
          model: models.Contact,
          as: 'vendor',
          required: false,
        },
      ],
    });
    const manifestData = await models.Manifest_header.findOne({
      where: {
        manifest_id: manifestId,
      },
      include: [
        {
          model: models.Manifest_detail,
          as: 'detail_manifest',
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
    });
    return ReS(
      res,
      {
        data: {
          assignment: assignmentData,
          manifest: manifestData,
        },
      },
      200
    );
  } catch (err) {
    return ReE(res, err.message, 403);
  }
};
const confirmIncomingByAssignmentByManifest = async (req, res) => {
  const errors = validationResult(req);
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  if (!errors.isEmpty()) {
    errReturn(errors.array());
  }
  let user = req.decoded;
  const assignmentId = req.params.assignment_id;
  const manifestId = req.params.manifest_id;
  const bd = req.body;
  let tgl = moment(new Date(bd.incoming_date)).format('YYYY-MM-DD HH:mm:ss');
  let checkBagging = await models.Assignment_manifest_detail.findAll({
    attributes: ['manifest_id'],
    where: {
      is_incoming_wh: false,
      manifest_id: manifestId,
      assignment_id: assignmentId,
    },
    raw: true,
  });
  let dataShipment = await models.Manifest_detail.findAll({
    where: {
      manifest_id: manifestId,
    },
    raw: true,
  });
  if (checkBagging.length == 0) {
    return errReturn('Ada Bagging yang sudah pernah di proses atau tidak ada');
  }
  const updateShipment = await updateShipmentArrival(dataShipment, assignmentId, manifestId, tgl, user);
  await models.Manifest_detail.update(
    {
      is_confirm: true,
      confirm_date: tgl,
      confirm_by: user.name,
      is_incoming_wh: true,
      incoming_wh: tgl,
      incoming_by: user.name,
      is_arrival: true,
      arrival_date: tgl,
      status_id: 'ARRIVE',
    },
    {
      where: { manifest_id: manifestId },
    }
  );
  await models.Assignment_manifest_detail.update(
    {
      is_confirm: true,
      confirm_date: tgl,
      confirm_by: user.name,
      is_incoming_wh: true,
      incoming_wh: tgl,
      incoming_by: user.name,
      is_arrival: true,
      arrival_date: tgl,
      status_id: 'ARRIVE',
    },
    {
      where: { assignment_id: assignmentId, manifest_id: manifestId },
    }
  );
  await models.Assignment_manifest.update(
    { total_bagging_success: s.literal('total_bagging_success + 1') },
    {
      where: {
        assignment_id: assignmentId,
      },
    }
  );
  logger.info(JSON.stringify({ assignment_id: assignmentId, manifest_id: manifestId }));
  return ReS(res, 'Berhasil di konfirmasi', 200);
};
const updateShipmentArrival = async (shipment, assignmentId, manifestId, tgl, user) => {
  return await Promise.all(
    shipment.map(async (s) => {
      const x = await history.ARRIVAL(
        {
          shipment_awb: s.shipment_awb,
          assignment_id: assignmentId,
          manifest_id: manifestId,
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
module.exports = {
  osIncoming,
  confirmIncomingByAssignmentByManifest,
  getOsIncomingByAssignment,
};
