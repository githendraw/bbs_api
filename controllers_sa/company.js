require('express-router-group');
const models = require('../models');
const { to, ReE, ReS } = require('../utils/response');
const CONFIG = require('../config/config');
const numbering = require('../middleware/numbering');
const { body, validationResult } = require('express-validator');
const async = require('async');
const { Op } = require('../models/index').Sequelize;

const SA_BRANCH_LIST = async (req, res) => {
  try {
    let dataX = await models.Company.findAll({
      where: {
        company_group_id: req.decoded.company_group_id,
      },
      order: [['company_id', 'ASC']],
    });
    let dataGroup = await models.Company_group.findOne({
      where: { company_group_id: req.decoded.company_group_id },
      raw: true,
    });

    let company = [];
    dataGroup.company_id = 'ALL';
    dataGroup.company_name = `Semua ${dataGroup.alias}`;
    company.push(dataGroup);
    dataX.forEach((x) => {
      // Send a promise for each fruit
      company.push(x);
    });

    // console.log(dataGroup)

    return ReS(
      res,
      {
        data: company,
      },
      200
    );
  } catch (err) {
    return ReE(res, err.message);
  }
};

const SA_BANK_LIST = async (req, res) => {
  try {
    const companyId = req.params.company_id;
    let dataX = await models.Company_bank.findAll({
      where: {
        company_id: companyId,
      },
    });

    return ReS(
      res,
      {
        data: dataX,
      },
      200
    );
  } catch (err) {
    return ReE(res, err.message);
  }
};
const SA_BANK_SAVE = async (req, res) => {
  let user = req.decoded;
  const companyId = req.params.company_id;
  if (req.body && !req.body.no_rek1) {
    return ReE(res, 'No Rek wajib diisi', 404);
  }
  if (req.body && !req.body.bank_1) {
    return ReE(res, 'Nama wajib diisi', 404);
  }
  try {
    let dataBank = await models.Company_bank.findOne({
      where: {
        company_id: companyId,
        no_rek1: {
          [Op.iLike]: `%${req.body.no_rek1}%`,
        },
      },
    });
    if (dataBank) {
      models.Company_bank.update(
        {
          note: req.body.note,
          no_rek1: req.body.no_rek1,
          bank_1: req.body.bank_1,
          bank_br_1: req.body.bank_br_1,
          usrupd: user.email,
        },
        {
          where: {
            company_id: companyId,
            no_rek1: {
              [Op.iLike]: `%${req.body.no_rek1}%`,
            },
          },
        }
      ).then((response) => {
        return ReS(
          res,
          {
            data: response,
          },
          200
        );
      });
    } else {
      models.Company_bank.build({
        note: req.body.note,
        no_rek1: req.body.no_rek1,
        bank_1: req.body.bank_1,
        bank_br_1: req.body.bank_br_1,
        company_id: companyId,
        usrupd: user.email,
      })
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
          return ReE(res, err, 404);
        });
    }
  } catch (err) {
    return ReE(res, err, 404);
  }
};

const SA_BILLING_REVENUE = async (req, res) => {
  //  function create / update record  to billing template with b_type=REVENUE
  //  t_id is auto generate id from billing template

  try {
    let dataX = await models.Billing_template.findOne({
      where: {
        b_id: req.body.b_id,
        b_type: 'REVENUE',
      },
    });
    if (dataX) {
      models.Billing_template.update(
        {
          b_name: req.body.b_name,
          b_isTax: req.body.b_isTax,
          b_description: req.body.b_description,
          b_isActive: req.body.b_isActive,
          usrUpd: req.decoded.email,
        },
        {
          where: {
            b_id: req.body.b_id,
            b_type: 'REVENUE',
          },
        }
      ).then((response) => {
        return ReS(
          res,
          {
            data: response,
          },
          200
        );
      });
    } else {
      models.Billing_template.build({
        b_id: req.body.b_id,
        b_name: req.body.b_name,
        b_type: 'REVENUE',
        b_description: req.body.b_description,
        b_isTax: req.body.b_isTax,
        b_isActive: req.body.b_isActive,
        usrUpd: req.decoded.email,
      })
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
          return ReE(res, err, 404);
        });
    }
  } catch (err) {
    return ReE(res, err, 404);
  }
};

const SA_BILLING_EXPENSE= async (req, res) => {
    
    try {
        let dataX = await models.Billing_template.findOne({
            where: {
            b_id: req.body.b_id,
            b_type: 'EXPENSE',
            },
        });
        if (dataX) {
            models.Billing_template.update(
            {
                b_name: req.body.b_name,
                b_description: req.body.b_description,
                b_isActive: req.body.b_isActive,
                b_isTax: req.body.b_isTax,
                usrUpd: req.decoded.email,

            },
            {
                where: {
                b_id: req.body.b_id,
                b_type: 'EXPENSE',
                },
            }
            ).then((response) => {
            return ReS(
                res,
                {
                data: response,
                },
                200
            );
            });
        } else {
            models.Billing_template.build({
            b_id: req.body.b_id,
            b_name: req.body.b_name,
            b_type: 'EXPENSE',
            b_description: req.body.b_description,
                b_isActive: req.body.b_isActive,
                b_isTax: req.body.b_isTax,
            usrUpd: req.decoded.email,
            })
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
                return ReE(res, err, 404);
            });
        }
        } catch (err) {
        return ReE(res, err, 404);
        }
}

const SA_BILLING =async(req,res)=>{
    //get from billing template with b_type equal to req.params.type
    try{
        let dataX = await models.Billing_template.findAll({
            where: {
            b_type: req.params.type || 'REVENUE',
            },
        });
        return ReS(
            res,
            {
            data: dataX,
            },
            200
        );
    }
        catch (err) {
            return ReE(res, err, 404);
        }
}
module.exports = {
  SA_BRANCH_LIST,
  SA_BANK_LIST,
  SA_BANK_SAVE,
  SA_BILLING_EXPENSE,
    SA_BILLING_REVENUE,
    SA_BILLING
};
