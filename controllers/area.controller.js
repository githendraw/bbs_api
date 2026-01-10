const { to, ReE, ReS } = require('../utils/response');
const async = require('async');
const { body, validationResult } = require('express-validator');
const CONFIG = require('../config/config');
const logger = require('../utils/logger');
const models = require('../models');
const custom = require('../middleware/custom');
const { Op } = require('../models/index').Sequelize;
const s = require('../models/index').sequelize;
const getCountry = async (req, res) => {
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let options = {};
  options.page = pg;
  options.paginate = limit;
  try {
    const { docs, pages, total } = await models['Country'].paginate(options);
    let rsp = {
      total: total,
      current: pg,
      pages: pages,
      limit: limit,
      data: docs,
    };
    return ReS(res, rsp, 200);
  } catch (err) {
    return ReE(res, err.message, 403);
  }
};
const saveCountry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ReE(res, errors.array(), 404);
  }
  let bd = req.body;
  let user = req.decoded;
  try {
    let dataCountry = await models.Country.findOne({
      where: {
        country_id: {
          [Op.iLike]: `%${bd.country_id}%`,
        },
      },
      raw: true,
    });
    if (dataCountry) {
      return ReE(res, 'Error', 'Data country ' + bd.country_id + ' sudah ada');
    } else {
      models.Country.build(bd)
        .save()
        .then((response) => {
          return ReS(
            res,
            {
              data: response,
            },
            200
          );
        })
        .catch((err) => {
          return ReE(res, err.message, 403);
        });
    }
  } catch (err) {
    return ReE(res, err.message, 403);
  }
};
const PROVINCE = {
  get: async (req, res) => {
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let options = {};
    options.page = pg;
    options.paginate = limit;
    options.order = [['province_name', 'ASC']];
    options.include = [
      {
        model: models.Country,
        as: 'country',
        required: false,
      },
      {
        model: models.Hub,
        as: 'hub',
        required: false,
        include: [{ model: models.Destination, as: 'destination', required: false }],
      },
    ];
    if (req.query && req.query.term) {
      options.where = {
        [Op.or]: [
          {
            province_name: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            province_id: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            country_id: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
        ],
      };
    }
    try {
      const { docs, pages, total } = await models['Province'].paginate(options);
      let rsp = {
        total: total,
        current: pg,
        pages: pages,
        limit: limit,
        data: docs,
      };
      return ReS(res, rsp, 200);
    } catch (err) {
      return ReE(res, err.message, 403);
    }
  },
  save: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ReE(res, errors.array(), 404);
    }
    let bd = req.body;
    try {
      let dataCountry = await models.Country.findOne({
        where: {
          country_id: bd.country_id,
        },
        raw: true,
      });
      if (!dataCountry) {
        return ReE(res, 'Error', 'Data country ' + bd.country_id + ' tidak ada');
      }
      let dataProvince = await models.Province.findOne({
        where: {
          province_id: bd.province_id,
        },
        raw: true,
      });
      if (dataProvince) {
        return ReE(res, 'Error', 'Data Province ' + bd.province_id + ' sudah ada');
      } else {
        models.Province.build(bd)
          .save()
          .then((response) => {
            return ReS(
              res,
              {
                data: response,
              },
              200
            );
          })
          .catch((err) => {
            return ReE(res, err, err.message);
          });
      }
    } catch (err) {
      return ReE(res, err, err.message);
    }
  },
  update: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ReE(res, errors.array(), 404);
    }
    let bd = req.body;
    try {
      let dataCountry = await models.Country.findOne({
        where: {
          country_id: bd.country_id,
        },
        raw: true,
      });
      if (!dataCountry) {
        return ReE(res, 'Error', 'Data country ' + bd.country_id + ' tidak ada');
      }
      let dataProvince = await models.Province.findOne({
        where: {
          province_id: bd.province_id,
        },
        raw: true,
      });
      if (!dataProvince) {
        return ReE(res, 'Error', 'Data Province ' + bd.province_id + ' tidak ada');
      } else {
        models.Province.update(
          {
            province_name: bd.province_name,
            country_id: bd.country_id,
            longitude: bd.longitude,
            latitude: bd.latitude,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        )
          .then((response) => {
            return ReS(
              res,
              {
                data: response,
              },
              200
            );
          })
          .catch((err) => {
            return ReE(res, err.message, 401);
          });
      }
    } catch (err) {
      return ReE(res, err.message, 401);
    }
  },
};
const HUB = {
  get: async (req, res) => {
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let options = {};
    options.page = pg;
    options.paginate = limit;
    options.include = [];
    options.include.push({
      model: models.Province,
      as: 'province',
      required: false,
    });
    if (req.query && req.query.detail) {
      options.include.push({
        model: models.Destination,
        as: 'destination',
        required: false,
      });
    }
    if (req.query && req.query.term) {
      options.where = {
        [Op.or]: [
          {
            hub_id: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            hub_name: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
        ],
      };
    } else {
      options.where = {};
    }
    try {
      const { docs, pages, total } = await models['Hub'].paginate(options);
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
  },
  getId: async (req, res) => {
    try {
      let shipmentData = await models.Hub.findOne({
        where: {
          hub_id: {
            [Op.iLike]: `%${req.params.hub_id}%`,
          },
        },
        include: [
          {
            model: models.Province,
            as: 'province',
            required: false,
          },
        ],
      });
      if (!shipmentData) {
        return ReE(res, `hub`, 404);
      }
      return ReS(
        res,
        {
          data: shipmentData,
        },
        200
      );
    } catch (err) {
      return ReE(res, err, 403);
    }
  },
  save: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ReE(res, errors.array(), 404);
    }
    let bd = req.body;
    let user = req.decoded;
    let dataHub = await models.Hub.findOne({
      where: {
        hub_id: {
          [Op.iLike]: `%${bd.hub_id}%`,
        },
      },
      raw: true,
    });
    if (dataHub) {
      return ReE(res, 'Error', 'Data Hub ' + bd.hub_id + ' sudah ada');
    }
    models.Hub.build(bd)
      .save()
      .then((response) => {
        return ReS(res, { data: response }, 200);
      })
      .catch((err) => {
        return ReE(res, err.message, 403);
      });
  },
  update: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ReE(res, errors.array(), 404);
    }
    try {
      let bd = req.body;
      let user = req.decoded;
      let hub_id = req.params.id;
      delete bd['hub_id'];
      let dataHub = await models.Hub.findOne({ where: { id: hub_id }, raw: true });
      if (!dataHub) {
        return ReE(res, 'Error', 'Data Hub tidak terdafatar');
      }
      await models.Hub.update({ ...bd }, { where: { id: hub_id } });
      return ReS(res, { data: bd }, 200);
    } catch (err) {
      console.log(err);
      return ReE(res, err, err.message);
    }
  },
  getIdDetail: async (req, res) => {
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let options = {};
    options.page = pg;
    options.paginate = limit;
    options.include = [];
    options.include.push({
      model: models.Province,
      as: 'province',
      required: false,
    });
    options.include.push({
      model: models.Destination,
      as: 'destination',
      required: false,
    });
    options.where = {};
    if (req.query && req.query.term) {
      options.where = {
        hub_id: req.params.hub_id,
        [Op.or]: [
          {
            hub_id: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            hub_name: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
        ],
      };
    } else {
      options.where = {
        hub_id: req.params.hub_id,
      };
    }
    try {
      const { docs, pages, total } = await models['Hub'].paginate(options);
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
      return ReE(res, err.message, 403);
    }
  },
};
const DESTINATION = {
  get: async (req, res) => {
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let options = {};
    options.page = pg;
    options.paginate = limit;
    options.include = [
      {
        model: models.Hub,
        as: 'hub',
        required: false,
        include: [
          {
            model: models.Province,
            as: 'province',
            required: false,
          },
        ],
      },
    ];
    if (req.query && req.query.term) {
      options.where = {
        // is_origin: 0,
        [Op.or]: [
          {
            dest_id: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            dest_name: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            city: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            sub_disctrict: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            hub_id: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
        ],
      };
    } else {
      options.where = {
        // is_origin: 0
      };
    }
    try {
      const { docs, pages, total } = await models['Destination'].paginate(options);
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
      console.log('errr', err);
      return ReE(res, err.message, 401);
    }
  },
  getById: async (req, res) => {
    try {
      let shipmentData = await models.Destination.findOne({
        where: {
          dest_id: req.params.dest_id,
        },
        include: [
          {
            model: models.Hub,
            as: 'hub',
            required: false,
          },
        ],
      });
      if (!shipmentData) {
        return ReE(res, `hub`, 404);
      }
      return ReS(
        res,
        {
          data: shipmentData,
        },
        200
      );
    } catch (err) {
      return ReE(res, err, 403);
    }
  },
  getByHub: async (req, res) => {
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let options = {};
    options.page = pg;
    options.paginate = limit;
    options.include = [
      {
        model: models.Hub,
        as: 'hub',
        required: false,
        include: [
          {
            model: models.Province,
            as: 'province',
            required: false,
          },
        ],
      },
    ];
    if (req.query && req.query.term) {
      options.where = {
        // is_origin: 0,
        hub_id: req.params.hub_id,
        [Op.or]: [
          {
            dest_id: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            dest_name: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            city: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            sub_disctrict: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            hub_id: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
        ],
      };
    } else {
      options.where = {
        // is_origin: 0
        hub_id: req.params.hub_id,
      };
    }
    try {
      const { docs, pages, total } = await models['Destination'].paginate(options);
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
      console.log('errr', err);
      return ReE(res, err.message, 401);
    }
  },
  save: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ReE(res, errors.array(), 404);
    }
    let bd = req.body;
    let dataDestination = await models.Destination.findOne({
      where: {
        dest_id: bd.dest_id,
      },
    });
    if (dataDestination) {
      return ReE(res, 'Kode  ' + bd.dest_id + ' sudah terdaftar', 401);
    }
    let dataHub = await models.Hub.findOne({
      where: {
        hub_id: {
          [Op.iLike]: `%${bd.hub_id}%`,
        },
      },
      raw: true,
    });
    if (!dataHub) {
      return ReE(res, 'Data Hub ' + bd.hub_id + ' tidak terdaftar', 401);
    }
    models.Destination.build(bd)
      .save()
      .then((response) => {
        return ReS(res, { data: response }, 200);
      })
      .catch((err) => {
        return ReE(res, err.message, 403);
      });
  },
  update: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ReE(res, errors.array(), 404);
    }
    let bd = req.body;
    let dest_id = req.params.id;
    delete bd['dest_id'];
    async.waterfall(
      [
        (cariDest = (cb) => {
          models['Destination']
            .findOne({
              where: {
                id: dest_id,
              },
            })
            .then(
              (r) => {
                if (r) {
                  cb(null, hasil);
                } else {
                  cb('Kota tujuan dengan kode ' + dest_id + ', tidak terdaftar');
                }
              },
              (e) => {
                cb(e);
              }
            );
        }),
        (updateData = (hasil, cb) => {
          models.Destination.update(bd, {
            where: {
              id: dest_id,
            },
          })
            .then((responses) => {
              hasil = req.body;
              cb(null, hasil);
            })
            .catch((err) => {
              // console.log(err);
              cb('Error  ' + err.message);
            });
        }),
      ],
      (e, r) => {
        if (e) {
          return ReE(res, e, 404);
        } else {
          return ReS(
            res,
            {
              data: r,
            },
            200
          );
        }
      }
    );
  },
};
module.exports = {
  getCountry,
  saveCountry,
  getHub: HUB.get,
  saveHub: HUB.save,
  getHubId: HUB.getId,
  updateHub: HUB.update,
  getHubIdDetail: HUB.getIdDetail,
  getProvince: PROVINCE.get,
  saveProvince: PROVINCE.save,
  updateProvince: PROVINCE.update,
  getDestination: DESTINATION.get,
  getDestinationId: DESTINATION.getById,
  getDestinationByHub: DESTINATION.getByHub,
  saveDestination: DESTINATION.save,
  updateDestination: DESTINATION.update,
};
