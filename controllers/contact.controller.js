const { to, ReE, ReS } = require("../utils/response");
const async = require("async");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const CONFIG = require("../config/config");
const message = require("../utils/message");
const logger = require("../utils/logger");
const models = require("../models");
const history = require("../middleware/history");
const numbering = require("../middleware/numbering");
const custom = require("../middleware/custom");
const { Op } = require("../models/index").Sequelize;
const { v1: uuidv1 } = require("uuid");
const s = require("../models/index").sequelize;
const getContact = async (req, res) => {
  let user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;

  let options = {
    where: {
      contact_type: req.params.type,
      company_id: user.company_id,
    },
  };

  options.page = pg;
  options.paginate = limit;
  options.order = [["updated", "DESC"]];

  console.log('-->>>>>>>')
  if (req.query && req.query.term) {
    if (req.params.type == "internal" || req.params.type == "driver" ) {
      options.where = {
        contact_type: {
          [Op.in]: ["internal", "driver"],
        },
        // company_id: user.company_id,
        [Op.or]: [
          {
            contact_id: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
            
            name: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
        ],
      };
    } else {
      options.where = {
        contact_type: req.params.type,
        company_id: user.company_id,
        [Op.or]: [
          {
            contact_id: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
          {
           
            name: {
              [Op.iLike]: `%${req.query.term}%`,
            },
          },
        ],
      };
    }
  } else {
    if (req.params.type == "internal" || req.params.type == "driver" ) {
      options.where = {
        contact_type: {
          [Op.in]: ["internal", "driver"],
        },
        // company_id: user.company_id,
      };
    } else {
      options.where = {
        contact_type: req.params.type,
        company_id: user.company_id,
      };
    }
  }
  try {
    const { docs, pages, total } = await models["Contact"].paginate(options);
    let rsp = {
      total: total,
      current: pg,
      pages: pages,
      limit: limit,
      data: docs,
    };
    return ReS(res, rsp, 200);
  } catch (err) {
    return ReE(res, err, 403);
  }
};
const saveContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ReE(res, errors.array(), 404);
  }
  try {
    let bd = req.body;
    let contact_type = req.params.type;
    let hasil = {};
    let kodePrefix;
    let dest = await models.Destination.findOne({
      where: {
        dest_id: bd.city_code,
      },
    });
    const errReturn = function (message) {
      return ReE(res, message, 403);
    };
    const user = req.decoded;
    if (contact_type == "driver") {
      kodePrefix = "D";
    } else if (contact_type == "customer") {
      kodePrefix = "C";
    } else if (contact_type == "branch") {
      kodePrefix = "B";
    } else if (contact_type == "vendor") {
      kodePrefix = "V";
    } else if (contact_type == "other") {
      kodePrefix="O"
    } else {
      kodePrefix = "G";
    }
    if (!dest) {
      errReturn("kode kota tidak terdaftar");
    }
    let numeric = await numbering.CONTACT({
      decoded: user,
      kode: kodePrefix,
      type: contact_type,
    });
    bd.company_id = user.company_id;
    bd.contact_id = numeric.numeric;
    bd.contact_type = contact_type;
    bd.city_name = dest.dest_name;
    if (!bd.contact_reff) {
      bd.contact_reff = numeric.numeric;
    }
    if (bd && bd.is_cash == true) {
      bd.is_cash = true;
    } else {
      bd.is_cash = false;
    }
    bd.usrUpd = user.email;
    let create = await models.Contact.create({ ...bd });
    return ReS(
      res,
      {
        data: create,
      },
      200
    );
  } catch (err) {
    console.log(err);
    return ReE(res, err, 403);
  }
};
const updateContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ReE(res, errors.array(), 404);
  }
  try {
    let bd = req.body;
    let contact_type = req.params.type;
    let hasil = {};
    let kodePrefix;
    let dest = await models.Destination.findOne({
      where: {
        dest_id: bd.city_code,
      },
    });
    const user = req.decoded;
    let id = req.params.id;
    async.waterfall(
      [
        (cariData = (cb) => {
          models["Contact"]
            .findOne({
              where: {
                contact_id: id,
                company_id: user.company_id,
              },
            })
            .then(
              function (r) {
                if (r) {
                  cb(null, hasil);
                } else {
                  cb("Data tidak terdaftar");
                }
              },
              function (e) {
                cb(e);
              }
            );
        }),
        (cityCode = (hasil, cb) => {
          if (!dest) {
            cb("Kode kota tidak  terdaftar");
          } else {
            cb(null, hasil);
          }
        }),
        (updateData = (hasil, cb) => {
          let params = bd;
          if (params && params.id) {
            delete params["id"];
            delete params["contact_id"];
          }
          if (bd && bd.is_cash == true) {
            params.is_cash = true;
          } else {
            params.is_cash = false;
          }
          models.Contact.update(params, {
            where: {
              contact_id: id,
              company_id: user.company_id,
            },
          })
            .then((responses) => {
              cb(null, params);
            })
            .catch((err) => {
              cb("Error Update " + err.message);
            });
        }),
      ],
      (e, s) => {
        if (e) {
          return ReE(res, e, 403);
        }
        return ReS(
          res,
          {
            data: s,
          },
          200
        );
      }
    );
  } catch (err) {
    console.log(err);
    return ReE(res, err, err.message);
  }
};
const getContactById = async (req, res) => {
  let contactData = await models.Contact.findOne({
    where: {
      contact_id: req.params.id,
      // company_id: req.decoded.company_id,
    },
  });
  if (!contactData) {
    return ReE(res, `Contact tidak ditemukan`, 403);
  }
  return ReS(res, { data: contactData }, 200);
};
const getSubContact = async (req, res) => {
  let pg = req.query.pg || 1;
  let user = req.decoded;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let options = {
    where: {
      contact_id: req.params.id,
      company_id: user.company_id,
    },
  };
  options.page = pg;
  options.paginate = limit;
  if (req.query && req.query.term) {
    options.where = {
      company_id: user.company_id,
      [Op.or]: [
        {
          name: {
            [Op.iLike]: `%${req.query.term}%`,
          },
        },
      ],
    };
  } else {
    options.where = {
      contact_id: req.params.id,
      company_id: user.company_id,
    };
  }
  try {
    const { docs, pages, total } = await models["Contact_sub"].paginate(
      options
    );
    let rsp = {
      total: total,
      current: pg,
      pages: pages,
      limit: limit,
      data: docs,
    };
    return ReS(res, rsp, 200);
  } catch (err) {
    console.log(err);
    return ReE(res, err.message, 403);
  }
};
const getSubContactCount = async (req, res) => {
  let user = req.decoded;
  try {
    models.Contact_sub.findAll({
      attributes: [[s.fn("COUNT", s.col("contact_sub_id")), "n_sub"]],
      where: {
        company_id: user.company_id,
        contact_id: req.params.id,
      },
    })
      .then((responses) => {
        return ReS(
          res,
          {
            data: responses,
          },
          200
        );
      })
      .catch((err) => {
        return ReE(res, err.message, 404);
      });
  } catch (err) {
    return ReE(res, err, err.message);
  }
};
const getCustomerPricesByFiveKeys = async (req, res) => {
  let user = req.decoded;
  let qry = req.query;
  if (qry && !qry.origin) {
    return ReE(res, `Origin code`, 404);
  }
  if (qry && !qry.destination) {
    return ReE(res, `Destination code`, 404);
  }
  if (qry && !qry.moda_id) {
    return ReE(res, `Moda `, 404);
  }
  if (qry && !qry.service_id) {
    return ReE(res, `Service `, 404);
  }
  if (qry && !qry.uom_id) {
    return ReE(res, `UOm `, 404);
  }
  try {
    models.Contact_price.findAll({
      where: {
        // company_id: user.company_id,
        partner_id: req.params.id,
        origin: { [Op.like]: `%${req.query.origin}%` },
        destination: { [Op.like]: `%${req.query.destination}%` },
        uom_id: { [Op.like]: `%${req.query.uom_id}%` },
        service_id: { [Op.like]: `%${req.query.service_id}%` },
        moda_id: { [Op.like]: `%${req.query.moda_id}%` },
      },
    })
      .then((responses) => {
        console.log(responses);
        return ReS(
          res,
          {
            data: responses,
          },
          200
        );
      })
      .catch((err) => {
        return ReE(res, err.message, 403);
      });
  } catch (err) {
    return ReE(res, err.message, 403);
  }
};
const saveContactPrice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ReE(res, errors.array(), 404);
  }
  let bd = req.body;

  let user = req.decoded;
  let partnerId = req.params.id;
  let type_price = bd.type_price ? bd.type_price : "flat";
  if (bd && !bd.add_cost) {
    bd.add_cost = 0;
  }
  var kodeharga = `${partnerId}${bd.origin}${bd.destination}${bd.service_id}${bd.uom_id}${bd.moda_id}${bd.price_from}${bd.price_to}${type_price}`;
  try {
    let dataHarga = await models.Contact_price.findOne({
      where: {
        price_id: kodeharga,
        // company_id: user.company_id,
      },
      raw: true,
    });
    let dest = await models.Destination.findOne({
      where: {
        dest_id: bd.destination,
      },
    });
    let ori = await models.Destination.findOne({
      where: {
        dest_id: bd.origin,
      },
    });
    let partner = await models.Contact.findOne({
      where: {
        contact_id: partnerId,
        // company_id: user.company_id,
      },
    });
    let service = await models.Services.findOne({
      where: {
        service_id: bd.service_id,
      },
    });
    if (dataHarga) {
      return ReE(res, "Harga sudah ada", 403);
    }
    if (!ori) {
      return ReE(res, "Kode Asal tidak terdaftar", 403);
    }
    if (!dest) {
      return ReE(res, "Kode Tujuan tidak terdaftar", 403);
    }
    if (!partner) {
      return ReE(res, "Kode customer tidak terdaftar", 403);
    }
    if (!service) {
      return ReE(res, "Kode layanan tidak terdaftar", 403);
    }
    bd.company_id = partner.company_id;
    bd.partner_id = partnerId;
    bd.price_id = kodeharga;
    bd.type_price = type_price;
    bd.originname = ori.dest_name;
    bd.destinationname = dest.dest_name;
    models.Contact_price.build(bd)
      .save()
      .then((response) => {
        return ReS(
          res,
          {
            data: response.toJSON(),
          },
          200
        );
      })
      .catch((err) => {
        return ReE(res, err.message, 404);
      });
  } catch (err) {
    return ReE(res, err.message, 403);
  }
};
const updateContactPrice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ReE(res, errors.array(), 404);
  }
  let bd = req.body;

  let dataHarga = await models.Contact_price.findOne({
    where: {
      id: req.params.price_id,
    },
    raw: true,
  });

  let user = req.decoded;
  let partnerId = dataHarga.partner_id;
  let type_price = bd.type_price ? bd.type_price : "flat";
  if (bd && !bd.add_cost) {
    bd.add_cost = 0;
  }
  var kodeharga =
    partnerId +
    bd.origin +
    bd.destination +
    bd.service_id +
    bd.uom_id +
    bd.moda_id +
    bd.price_from +
    bd.price_to +
    type_price;
  try {
    let dest = await models.Destination.findOne({
      where: {
        dest_id: bd.destination,
      },
    });
    let ori = await models.Destination.findOne({
      where: {
        dest_id: bd.origin,
      },
    });
    let partner = await models.Contact.findOne({
      where: {
        contact_id: partnerId,
      },
    });
    let service = await models.Services.findOne({
      where: {
        service_id: bd.service_id,
      },
    });
    // let moda = await models.Moda.findOne({
    //   where: {
    //     moda_id: bd.moda_id,
    //   },
    // });
    // if (dataHarga) {
    //   return ReE(res,  "Harga sudah ada",403);
    // }
    if (!ori) {
      return ReE(res, "Kode Asal tidak terdaftar", 403);
    }
    if (!dest) {
      return ReE(res, "Kode Tujuan tidak terdaftar", 403);
    }
    if (!partner) {
      return ReE(res, "Kode customer tidak terdaftar", 403);
    }
    if (!service) {
      return ReE(res, "Kode layanan tidak terdaftar", 403);
    }
    // if (!moda) {
    //   return ReE(res, "Error", "moda tidak terdaftar");
    // }
    bd.company_id = partner.company_id;
    bd.partner_id = partnerId;
    // bd.price_id = kodeharga;
    bd.type_price = type_price;
    bd.originname = ori.dest_name;
    bd.destinationname = dest.dest_name;
    models.Contact_price.update(bd, {
      where: {
        id: req.params.price_id,
      },
    })
      .then((responses) => {
        return ReS(
          res,
          {
            data: responses,
          },
          200
        );
      })
      .catch((err) => {
        return ReE(res, err.message, 404);
      });
  } catch (err) {
    return ReE(res, err.message, 403);
  }
};
const deleteCustomerPrice = async (req, res) => {
  let bd = req.body;
  let dataHarga = await models.Contact_price.findOne({
    where: {
      id: req.params.price_id,
    },
    raw: true,
  });
  if (!dataHarga) {
    return ReE(res, "Harga tidak di temukan ", 404);
  }
  try {
    models.Contact_price.destroy({
      where: {
        partner_id: dataHarga.partner_id,
        origin: dataHarga.origin,
        destination: dataHarga.destination,
        service_id: dataHarga.service_id,
        uom_id: dataHarga.uom_id,
        moda_id: dataHarga.moda_id,
      },
    })
      .then((responses) => {
        return ReS(
          res,
          {
            data: responses,
          },
          200
        );
      })
      .catch((err) => {
        return ReE(res, err.message, 403);
      });
  } catch (err) {
    return ReE(res, err.message, 403);
  }
};
module.exports = {
  getContact,
  saveContact,
  updateContact,
  getContactById,
  getSubContact,
  getSubContactCount,
  getCustomerPricesByFiveKeys,
  saveContactPrice,
  updateContactPrice,
  deleteCustomerPrice,
};
