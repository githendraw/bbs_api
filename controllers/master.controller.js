const { to, ReE, ReS } = require("../utils/response");
const async = require("async");
const { body, validationResult } = require("express-validator");
const CONFIG = require("../config/config");
const message = require("../utils/message");
const logger = require("../utils/logger");
const models = require("../models");
const numbering = require("../middleware/numbering");
const custom = require("../middleware/custom");
const { Op } = require("../models/index").Sequelize;
const { v1: uuidv1 } = require("uuid");
const s = require("../models/index").sequelize;
const MODA = {
  get: async (req, res) => {
    let moda = [
      { moda_id: "A", moda_name: "AIR" },
      { moda_id: "L", moda_name: "LAND" },
      { moda_id: "S", moda_name: "SEA" },
    ];
    try {
      return ReS(res, { data: moda }, 200);
    } catch (err) {
      return ReE(res, err.message, 403);
    }
  },
};
const SERVICE = {
  get: async (req, res) => {
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let options = {};
    options.page = pg;
    options.paginate = 50;
    options.order = [["service_desc", "ASC"]];
    try {
      const { docs, pages, total } = await models["Services"].paginate(options);
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
  save:async(req,res)=>{
    let hasil = {};
    const bd = req.body;
    async.waterfall([
        cariNumber = (cb) => {
            models['Services']
                .findOne({
                    where: {
                        service_id: bd.service_id
                    }
                })
                .then(function (r) {
                    // //;
                    if (r) {
                        cb('Kode Service sudah terdaftar');
                    } else {
                        cb(null, hasil);
                    }
                }, function (e) {
                    cb(e);
                });
        },
        simpanData = (hasil, cb) => {
            models
                .Services
                .build(bd)
                .save()
                .then(response => {
                    hasil = response.toJSON();
                    cb(null, hasil)
                })
                .catch(err => {
                    cb(err.message)
                });
        }
    ], (e, s) => {
        if (e) {
            return ReE(res, e, 404)
        } else {
            return ReS(res, {
                data: s
            }, 200);
        }
    })
  },
  update:async(req,res)=>{
    let bd = req.body;
    let hasil = {};
    let id = req.params.id;
    async.waterfall([
        cariData = (cb) => {
            models['Services']
                .findOne({
                    where: {
                        id: id
                    }
                })
                .then(function (r) {
                    if (r) {
                        cb(null, hasil)
                    } else {
                        cb('Data tidak terdaftar');
                    }
                }, function (e) {
                    cb(e);
                });
        },
        updateData = (hasil, cb) => {
            let params = bd;
            if (params && params.service_id) {
                delete params['service_id'];
            }
            models
                .Services
                .update(params, {
                    where: {
                        id: id
                    }
                })
                .then(responses => {
                    cb(null, params);
                })
                .catch(err => {
                    cb('Error Update ' + err.message)
                });
        }
    ], function (e, s) {
        if (e) {
            return ReE(res, e, 404)
        } else {
            return ReS(res, {data: s}, 200);
        }
    })
  },
  delete:async(req,res)=>{
    try {
        models
        .Services
        .destroy({
            where: {
                id:req.params.id
            }
        })
        .then(responses => {
          return ReS(res, {data: responses}, 200);
        })
        .catch(err => {
          return ReE(res, err.message, 401)
        });
      } catch (err) {
        return ReE(res, err.message,401);
      }
  }
};
const UOM = {
  get: async (req, res) => {
    let pg = req.query.pg || 1;
    let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
    let options = {};
    options.page = pg;
    options.paginate = 50;
    options.order = [["uom_desc", "ASC"]];
    try {
      const { docs, pages, total } = await models["Uom"].paginate(options);
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
  save:async(req,res)=>{
    let hasil = {};
    const bd = req.body;
    async.waterfall([
        cariNumber = (cb) => {
            models['Uom']
                .findOne({
                    where: {
                        uom_id: bd.uom_id
                    }
                })
                .then(function (r) {
                    // //;
                    if (r) {
                        cb('Kode Uom sudah terdaftar');
                    } else {
                        cb(null, hasil);
                    }
                }, function (e) {
                    cb(e);
                });
        },
        simpanData = (hasil, cb) => {
            models
                .Uom
                .build(bd)
                .save()
                .then(response => {
                    hasil = response.toJSON();
                    cb(null, hasil)
                })
                .catch(err => {
                    cb(err.message)
                });
        }
    ], (e, s) => {
        if (e) {
            return ReE(res, e, 404)
        } else {
            return ReS(res, {
                data: s
            }, 200);
        }
    })
  },
  update:async(req,res)=>{
    let bd = req.body;
    let hasil = {};
    let id = req.params.id;
    async.waterfall([
        cariData = (cb) => {
            models['Uom']
                .findOne({
                    where: {
                        id: id
                    },
                    raw:true
                })
                .then(function (r) {
                    if (r) {
                        cb(null, hasil)
                    } else {
                        cb('Data tidak terdaftar');
                    }
                }, function (e) {
                    cb(e);
                });
        },
        updateData = (hasil, cb) => {
            var params = {
                uom_desc: bd.uom_desc
            };
            models
                .Uom
                .update(params, {
                    where: {
                        id: id
                    }
                })
                .then(responses => {
                    cb(null, params);
                })
                .catch(err => {
                    cb('Error Update ' + err.message)
                });
        }
    ], function (e, s) {
        if (e) {
            return ReE(res, e, 404)
        } else {
            return ReS(res, {
                data: s
            }, 200);
        }
    })
  },
  delete:async(req,res)=>{
    try {
        models
        .Uom
        .destroy({
            where: {
                id:req.params.id
            }
        })
        .then(responses => {
          return ReS(res, {
            data: responses
        }, 200);
        })
        .catch(err => {
          return ReE(res, err.message, 401)
        });
      } catch (err) {
        return ReE(res, err.message,401);
      }
  }
};

const BANK = {
    update:async(req,res)=>{
      let bd = req.body;
      let hasil = {};
      let id = req.params.id;
      async.waterfall([
          cariData = (cb) => {
              models['Company_bank']
                  .findOne({
                      where: {
                          id: id
                      },
                      raw:true
                  })
                  .then(function (r) {
                      if (r) {
                          cb(null, hasil)
                      } else {
                          cb('Data tidak terdaftar');
                      }
                  }, function (e) {
                      cb(e);
                  });
          },
          updateData = (hasil, cb) => {
              var params = {
                isPrint: bd.isPrint
              };
              console.log('params BANK', params);
              models
                  .Company_bank
                  .update(params, {
                      where: {
                          id: id
                      }
                  })
                  .then(responses => {
                        console.log('responses BANK', responses);
                      cb(null, params);
                  })
                  .catch(err => {
                      cb('Error Update ' + err.message)
                  });
          }
      ], function (e, s) {
          if (e) {
              return ReE(res, e, 404)
          } else {
              return ReS(res, {
                  data: s
              }, 200);
          }
      })
    }
  };
module.exports = {
  getModa: MODA.get,
  getService: SERVICE.get,
  saveService:SERVICE.save,
  updateService:SERVICE.update,
  deleteService:SERVICE.delete,
  getUom: UOM.get,
  saveUom:UOM.save,
  updateUom:UOM.update,
  deleteUom:UOM.delete,
  updateBank: BANK.update
};
