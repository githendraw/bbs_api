require('express-router-group');
const models = require('../models');
const { to, ReE, ReS } = require('../utils/response');
const CONFIG = require('../config/config');
const numbering = require('../middleware/numbering');
const { body, validationResult } = require('express-validator');
const async = require('async');
const { mShipmentInclude } = require('../controllers/shipment.controller');
const custom = require('../middleware/custom');
const message = require('../utils/message');
const logger = require('../utils/logger');
const { Op } = require('../models/index').Sequelize;
const s = require('../models/index').sequelize;
const moment=require('moment')
const history = require('../middleware/history');
const updateInvoiceToShipment = async (invoice, tgl, user, nama) => {
  const errReturn = async (err) => {
    return await Promise.reject(err);
  };
  return await Promise.all(
    invoice.map(async (item) => {
      const dtShipmentUpdate = await history.INVOICE(
        {
          shipment_awb: item.shipment_awb,
          invoice_id: item.invoice_id,
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


const updateInvoiceToSMU = async (invoice, tgl, user, nama) => {
  const errReturn = async (err) => {
    return await Promise.reject(err);
  };
  return await Promise.all(
    invoice.map(async (item) => {
       await models.Smu.update({
        is_invoice:true,
        invoice_no:item.invoice_id
       },{
       where: {smu_id:item.smu_id}
       })
      return {
        ...invoice,
      };
    })
  );
};

const updatePaymentToInvoice = async (payment, tgl, user, nama) => {
  const errReturn = async (err) => {
    return await Promise.reject(err);
  };


  return await Promise.all(
    payment.map(async (item) => {
      console.log('item ', item )
     const invoiceUpd=  await models.Invoice.update(
      {
        paid:s.literal(`paid + ${parseFloat(item.paid)+parseFloat(item.paid_other)}`),
        balance:s.literal(`balance - ${item.paid+item.paid_other}`),
        is_paid:1
    },
      {where:{invoice_id:item.invoice_id}}

      
    );

  
    const checkInvoice =  await models.Invoice.findOne({where:{invoice_id:item.invoice_id}});
    console.log('--->>>>>>>',checkInvoice.balance);
    if (checkInvoice && checkInvoice.balance<=0 && checkInvoice.invoice_type==='SHIPMENT'){
      console.log('updat epaid')

        await updatePaidShipment(checkInvoice.invoice_id,true)
    } 

    if (checkInvoice && checkInvoice.balance<=0 && checkInvoice.invoice_type==='SMUWH-I' ){
      

        await updatePaidWH(checkInvoice.invoice_id,true)
    } 

    
    if (checkInvoice && checkInvoice.balance<=0 && checkInvoice.invoice_type==='SMUWH-O' ){
     

        await updatePaidWH(checkInvoice.invoice_id,true)
    } 
      return {
        ...invoiceUpd,
      };
    })
  );
};


const updatePaidShipment=async (invoiceId,isPaid )=>{
  const checkInvoice =  await models.Invoice_detail.findAll({where:{invoice_id:invoiceId}});
  let shipment=[]
  for (const f of checkInvoice) {
      shipment.push(f.shipment_awb)
  };

  await models.Shipment.update({is_paid:isPaid},{where:{ shipment_awb:{[Op.in]:shipment}}})
  

  return ;
}



const updatePaidWH=async (invoiceId )=>{
  const checkInvoice =  await models.Invoice_detail_wh.findAll({where:{invoice_id:invoiceId}});
  let shipment=[]
  for (const f of checkInvoice) {
      shipment.push(f.smu_id)
  };

  await models.Smu.update({is_paid:isPaid},{where:{ smu_id:{[Op.in]:shipment}}})
  

  return ;
}


const SHIPMENT_ZERO_AMOUNT = async (req, res) => {
  const user = req.decoded;
  const companyId = req.params.company_id;
  const shipmentInclude = mShipmentInclude();
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let order = [['shipment_date', 'ASC']];
  let src = {
    company_id: companyId,
    total: {
      [Op.lte]: 0,
    },
    is_invoice: false,
  };
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
  if (req.query.contact_id) {
    src.partner_id = req.query.contact_id;
  }
  let options = {
    where: src,
    order: order,
    page: pg,
    paginate: limit,
    include: [...shipmentInclude],
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

const SHIPMENT_BY_AWB_INVOICE=async(req,res)=>{
  const shipmentInclude=mShipmentInclude();
  let shipmentData = await models.Shipment.findOne({
    where: {
      shipment_awbm:req.params.id,
      is_cash:false
    },
    include: [...shipmentInclude],
  });
  if (!shipmentData) {
    return ReE(res, `Data tidak di temukan / shipment cash`, 403);
  }
  if (shipmentData && !shipmentData.isCash && shipmentData.is_invoice){
    return ReE(res,'Data tidak bisa di rubah karena sudah di invoice')
  }
  return ReS(res, { data: shipmentData }, 200);
}
const SHIPMENT_BY_AWB_CASH=async(req,res)=>{
  const shipmentInclude=mShipmentInclude();
  let shipmentData = await models.Shipment.findOne({
    where: {
      shipment_awbm:req.params.id,
      is_cash:true
    },
    include: [...shipmentInclude],
  });
  if (!shipmentData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  if (shipmentData && !shipmentData.is_cash && shipmentData.is_invoice){
    return ReE(res,'Data tidak bisa di rubah karena sudah di invoice')
  }
  return ReS(res, { data: shipmentData }, 200);
};
const SHIPMENT_VALIDASI_INVOICE_UPDATE=async(req,res)=>{
  const errors = validationResult(req);
  let bd = req.body;
  const shipmentAwb = req.params.id;
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
      where:{
        shipment_awb:shipmentAwb
      },
      attributes:['shipment_awb']
    })
    if (!shipmentData){
      return errReturn('Shipment tidak terdaftar');
    }
    /**hitung harga */
    var kirim = 0,
      pickup = 0,
      packing_charge = 0,
      
      buruh_charge = 0,
      tools_charge = 0,
      telly_charge = 0,
    trucking_charge = 0,
    lolo_charge = 0,
    thc_charge = 0,
    do_charge = 0,
    clining_charge = 0,
    ppftz1_charge = 0,
    ppftz2_charge = 0,
    ppftz3_charge = 0,
    materai_charge = 0,
    claim_charge = 0,
      sub_total = 0,
      tax_percent = 0,
      tax_amount = 0,
      sub_total_tax,
      harga_barang_asuransi = 0,
      harga_asuransi = 0,
      total = 0;
      kirim = params.charge || 0;
      pickup = params.pickup_charge || 0;
      packing_charge = params.packing_charge || 0;
      buruh_charge = params.buruh_charge || 0;
      tools_charge = params.tools_charge || 0;
      telly_charge = params.telly_charge || 0;
      trucking_charge = params.trucking_charge || 0;
      lolo_charge = params.lolo_charge || 0;
      thc_charge = params.thc_charge || 0;
      do_charge = params.do_charge || 0;
      clining_charge = params.clining_charge || 0;
      ppftz1_charge = params.ppftz1_charge || 0;
      ppftz2_charge = params.ppftz2_charge || 0;
      ppftz3_charge = params.ppftz3_charge || 0;
      materai_charge = params.materai_charge || 0;
      claim_charge = params.claim_charge || 0;

      sub_total = parseFloat(kirim) + parseFloat(pickup) + parseFloat(packing_charge) + parseFloat(buruh_charge) + parseFloat(tools_charge) + parseFloat(telly_charge) + parseFloat(trucking_charge) + parseFloat(lolo_charge) + parseFloat(thc_charge) + parseFloat(do_charge) + parseFloat(clining_charge) + parseFloat(ppftz1_charge) + parseFloat(ppftz2_charge) + parseFloat(ppftz3_charge);
      tax_percent = params.tax_percent || 0;
      tax_amount = (tax_percent / 100) * sub_total;
      sub_total_tax = sub_total + tax_amount;
      harga_asuransi = params.is_insurance?params.insurance_charge: 0;

      total = parseFloat(sub_total_tax) + parseFloat(harga_asuransi) + parseFloat(materai_charge) + parseFloat(claim_charge);
      let price = {
        sub_total: sub_total,
        tax_amount: tax_amount,
        sub_total_tax: sub_total_tax,
        total: total,
      };
    params.shipment_date = tgl;
    params.pickup_date = tgl;
    params.originname = origin.dest_name;
    params.destinationname = dest.dest_name;
    params.is_process = false;
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
    if (params.is_insurance){
      params.is_insurance=true;
      params.insurance=params.insurance_charge
      params.insurance_value=params.insurance_price
    }else{
      params.is_insurance=false;
      params.insurance=0
      params.insurance_value=0
    }
    transaction = await s.transaction();
    await models.Shipment.update(
      {
        ...params,
      },
      {
        where:{shipment_awb:shipmentAwb}
      },
      {transaction}
    );
    await transaction.commit();
    /** simpan contact */
    logger.info(JSON.stringify(params));
    return ReS(
      res,
      {
        cn: params.shipment_awbm,
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
const SHIPMENT_VALIDASI_CASH_UPDATE=async(req,res)=>{
  let user=req.decoded;
  const errors = validationResult(req);
  let bd = req.body;
  const shipmentAwb = req.params.id;
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
    let cariInvoice = await models.Invoice.findOne({
      where:{invoice_id:params.shipment_awbm}
     })
     if (cariInvoice && cariInvoice.is_paid){
      errReturn('Shipment ini sudah ada pembayaran tidak bisa di validasi atau edit');
     }
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
      where:{
        shipment_awb:shipmentAwb
      },
      attributes:['shipment_awb','company_id']
    })
    if (!shipmentData){
      return errReturn('Shipment tidak terdaftar');
    }
    /**hitung harga */
    var kirim = 0,
      pickup = 0,
      packing_charge = 0,
      sub_total = 0,
      tax_percent = 0,
      tax_amount = 0,
      sub_total_tax,
      harga_barang_asuransi = 0,
      harga_asuransi = 0,
      total = 0;
      kirim = params.charge || 0;
      pickup = params.pickup_charge || 0;
      packing_charge = params.packing_charge || 0;
      sub_total = parseFloat(kirim) + parseFloat(pickup) + parseFloat(packing_charge);
      tax_percent = params.tax_percent || 0;
      tax_amount = (tax_percent / 100) * sub_total;
      sub_total_tax = sub_total + tax_amount;
      harga_asuransi = params.insurance_charge || 0;
      total = parseFloat(sub_total_tax) + parseFloat(harga_asuransi);
      let price = {
        sub_total: sub_total,
        tax_amount: tax_amount,
        sub_total_tax: sub_total_tax,
        total: total,
      };
    params.shipment_date = tgl;
    params.pickup_date = tgl;
    params.originname = origin.dest_name;
    params.destinationname = dest.dest_name;
    params.is_process = false;
    
    if (params && params.shipment_type_id=='CASH') {
      params.shipment_type_id = 'CASH';
      params.is_cash = true;
      params.is_invoice = true;
      params.is_print_invoice = true;
    } else if (params && params.shipment_type_id=='COLLECT'){
      params.shipment_type_id = 'COLLECT';
      params.is_cash = true;
      params.is_collect = true;
      params.is_invoice = true;
      params.is_print_invoice = true;

    } else {
      params.shipment_type_id = 'CREDIT';
      params.is_cash = false;
      params.is_collect = false;
      params.is_invoice = false;
      params.is_print_invoice = false;
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
    if (params.insurance_charge>0){
      params.is_insurance=true;
      params.insurance=params.insurance_price
      params.insurance_value=params.insurance_charge
    }
    transaction = await s.transaction();
    await models.Shipment.update(
      {
        ...params,
      },
      {
        where:{shipment_awb:shipmentAwb}
      },
      {transaction}
    );



    const  paramsData = {
      company_id:shipmentData.company_id,
      invoice_id: params.shipment_awbm,
      invoice_no: params.shipment_awbm,
      invoice_term: 0,
      invoice_date: tgl,
      invoice_due_date: tgl,
      contact_id: params.partner_id,
      contact_name: params.partner_name,
      contact_bill_address: params.partner_address1,
      contact_bill_npwp: '-',
      invoice_type:'SHIPMENT',
      charge: params.charge,
      insurance: params.insurance_charge || 0,
      handling: 0,
      packing_charge: params.packing_charge || 0,
      pickup_charge: params.pickup_charge || 0,
      others_charge: params.others_charge || 0,
      subtotal: price.sub_total,
      total: price.sub_total,
      discount_percent: 0,
      discount_amount: 0,
      tax_percent: params.tax_percent,
      tax_amount: params.tax_amount,
      amount: price.total,
      balance: price.total,
      amount_text: custom.terbilang(price.total),
      is_print_invoice: true,
      print_by: user.name,
      print_date: moment(),
      usrupd: user.email,
      is_receive_invoice: true,
      receive_by: bd.partner_name,
      received_date: moment(),
      invoice_cash:true
    };
    if (params.isCash){
      if (cariInvoice){
        await models.Invoice.update(
          paramsData,
          {where:{invoice_id:params.shipment_awbm}},
          {transaction}
        );
      }else{
         await models.Invoice.create(
          paramsData,
          {transaction}
        );
      }
      await models.Invoice_detail.destroy({where: {invoice_id:params.shipment_awbm}}, {transaction});
      let invoiceDetailCreate = await models.Invoice_detail.bulkCreate(
        [
          {
            company_id:shipmentData.company_id,
            invoice_id: params.shipment_awbm,
            shipment_awb: params.shipment_awb,
          },
        ],
        { transaction }
      );
    }else{
      await models.Invoice.destroy({where: {invoice_id:params.shipment_awbm}}, {transaction});
      await models.Invoice_detail.destroy({where: {invoice_id:params.shipment_awbm}}, {transaction});
    }
   
    await transaction.commit();
    /** simpan contact */
    logger.info(JSON.stringify(params));
    return ReS(
      res,
      {
        cn: params.shipment_awbm,
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
const SHIPMENT_CASH=async(req,res)=>{
  let user = req.decoded;
  const companyId = req.params.company_id;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  const shipmentInclude = mShipmentInclude();
  let order = [['shipment_date', 'DESC']];
  let src = {
    company_id: companyId,
    is_cash:true
  };
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
  let options = {
    where: src,
    order: order,
    page: pg,
    paginate: limit,
    include: [...shipmentInclude],
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
const SHIPMENT_UNINVOICE = async(req,res)=>{
  const companyId=req.params.company_id;
  const user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = {
    company_id: companyId,
    is_invoice:false,
  };
  if (req.params && req.params.contact_id){
    src.partner_id=req.params.contact_id;
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
    st = moment(new Date(start_date)).format("YYYY-MM-DD 00:00:00");
    if (end_date) {
      ed = moment(new Date(end_date)).format("YYYY-MM-DD 00:00:00");
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
    src.shipment_date = {
      [Op.between]: [st, ed],
    };
  }
  const shipmentInclude = mShipmentInclude();
  let options = {
    where: src,
    order: [ ["shipment_date", req.query.sort ? req.query.sort : "ASC"], ["partner_name","ASC"]],
    page: pg,
    paginate: limit,
    include: [...shipmentInclude]
  };
  try {
    const { docs, pages, total } = await models["Shipment"].paginate(options);
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
};

const SHIPMENT_UNINVOICE_BYCUST= async(req,res)=>{
  const companyId=req.params.company_id;
  const user = req.decoded;
  let src = {
    company_id: companyId,
    is_invoice:false,
  };

  try {
  const getData = await models.Shipment.findAll({
    attributes:['partner_id','partner_name',

    [s.fn('count', s.col('shipment_awb')), 'shipment'],
    [s.fn('sum', s.col('total')), 'total'],
    // [
    //   s.fn(
    //     "sum",
    //     s.literal(
    //       "CASE WHEN (total<=0)  THEN total ELSE 0 END"
    //     )
    //   ),
    //   "zero_amount",
    // ],
    // [
    //   s.fn(
    //     "sum",
    //     s.literal(
    //       "CASE WHEN (total>0)  THEN total ELSE 0 END"
    //     )
    //   ),
    //   "uninvoice",
    // ],


  
  
  ],
    where:{
      ...src
    },
    order: [
      // Will escape title and validate DESC against a list of valid direction parameters
      ['partner_name', 'ASC']],
    group:['partner_id','partner_name']
  })


  return ReS(
    res,
    {
      data: getData,
    },
    200
  );

} catch (err) {
  return ReE(res, err.message, 404);
}
  
}
const SHIPMENT_PAID = async(req,res)=>{
  const companyId=req.params.company_id;
  const user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let src = {
    company_id: companyId,
    is_paid:true,
  };
  if (req.params && req.params.contact_id){
    src.partner_id=req.params.contact_id;
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
    st = moment(new Date(start_date)).format("YYYY-MM-DD 00:00:00");
    if (end_date) {
      ed = moment(new Date(end_date)).format("YYYY-MM-DD 00:00:00");
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
    src.shipment_date = {
      [Op.between]: [st, ed],
    };
  }
  const shipmentInclude = mShipmentInclude();
  let options = {
    where: src,
    order: [["shipment_date", "ASC"]],
    page: pg,
    paginate: limit,
    include: [...shipmentInclude]
  };
  try {
    const { docs, pages, total } = await models["Shipment"].paginate(options);
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
};


const SEWA_GUDANG_UNINVOICE = async(req,res)=>{
  const companyId=req.params.company_id;
  const user = req.decoded;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  console.log(req.query.type);
  console.log('------yunnviice')
  let src = {
    company_id: companyId,
    smu_type:req.query.type,
    is_invoice:false,
  };
  if (req.params && req.params.contact_id){
    src.partner_id=req.params.contact_id;
  }
  if (req.query && req.query.term) {
    src = {
      ...src,
      [Op.or]: [
        {
          smu_no: {
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
          host_origin: {
            [Op.iLike]: `%${req.query.term}%`,
          },
        },
        {
          host_originname: {
            [Op.iLike]: `%${req.query.term}%`,
          },
        },
        {
          host_destination: {
            [Op.iLike]: `%${req.query.term}%`,
          },
        },
        {
          host_destinationname: {
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
    st = moment(new Date(start_date)).format("YYYY-MM-DD 00:00:00");
    if (end_date) {
      ed = moment(new Date(end_date)).format("YYYY-MM-DD 00:00:00");
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
    src.smu_date = {
      [Op.between]: [st, ed],
    };
  }
  
  let options = {
    where: src,
    order: [['smu_date', 'DESC']],
    page: pg,
    paginate: limit,
  };
  console.log(src);
  try {
    const { docs, pages, total } = await models["Smu"].paginate(options);
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
};


const SEWA_GUDANG_BY_SMU_INVOICE=async(req,res)=>{
  
  let shipmentData = await models.Smu.findOne({
    where: {
      smu_no:req.params.id
    },
    
  });
  if (!shipmentData) {
    return ReE(res, `Data tidak di temukan /`, 403);
  }
  if (shipmentData  &&  shipmentData.is_invoice){
    return ReE(res,'Data tidak bisa di rubah karena sudah di invoice')
  }
  return ReS(res, { data: shipmentData }, 200);
}
const SAVE_INVOICE_WH= async(req,res)=>{
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  let transaction;
  try {
  const user = req.decoded;
  const companyId=req.params.company_id;
  let bd = req.body;

  if (bd && !bd.type){
    return ReE(res, 'Tipe sewa gudang tidak ada (I/O)', 403); 
  }
  let dataShipment = [];
  let charge = parseFloat(bd.charge) || 0;
  let others_charge = parseFloat(bd.pickup_charge) || 0;
  let handling = parseFloat(bd.handling) || 0;
  let packing_charge = parseFloat(bd.packing_charge) || 0;
  let insurance = parseFloat(bd.insurance) || 0;
  let subtotal = charge + insurance + others_charge + handling + packing_charge;
  let tax_percent = parseFloat(bd.tax_percent)||0;
  let tax_amount = (tax_percent / 100) * charge;
  let total = subtotal + tax_amount;
  let tgl = moment(new Date(bd.invoice_date)).format('YYYY-MM-DD HH:mm:ss');
  let tgl_due = moment(new Date(bd.invoice_due_date)).format("YYYY-MM-DD HH:mm:ss");
  
  if (bd && bd.detail && bd.detail.length > 0) {
    dataShipment = bd.detail;
    delete bd['detail'];
  }
  const  contact = await models.Contact.findOne({
    where: {
      contact_id: bd.contact_id,
    },
    raw: true,
  });
  let cariShipment=[];
  dataShipment.map(function (v) {
    cariShipment.push(v);
  });

  let checkShipment = await models.Smu.findAll({
    attributes: ['smu_id'],
    where: {
      is_invoice: true,
      smu_id: {
        [Op.in]: cariShipment,
      },
    },
    raw: true,
  });
  if (checkShipment.length > 0) {
    return ReE(res, 'Ada SMU Sewa gudang yang sudah pernah di proses  invoice' + JSON.stringify(checkShipment), 403);
  }
  if (!contact) {
    return ReE(res, 'Error', 'Data Contact ' + bd.contact_id + ' tidak ada');
  }
  transaction = await s.transaction();
  const numeric = await numbering.INVOICE(req);
  const invoiceId = numeric.numeric;
  const detailData = await Promise.all(
    dataShipment.map(async (x) => {
      return {
        company_id: companyId,
        invoice_id: invoiceId,
        smu_id: x,
        usrupd: user.email,
      };
    })
  );
  const dataInvoice = {
    company_id: companyId,
    invoice_id: invoiceId,
    invoice_no: invoiceId,
    invoice_term: bd.invoice_term,
    invoice_date: tgl,
    invoice_due_date: tgl_due,
    contact_id: bd.contact_id,
    contact_name: bd.contact_name,
    contact_bill_address: bd.contact_bill_address,
    contact_bill_npwp: bd.contact_bill_npwp?bd.contact_bill_npwp:bd.contact_id,
    charge: bd.charge,
    insurance: bd.insurance || 0,
    handling: bd.handling || 0,
    packing_charge: bd.packing_charge || 0,
    others_charge: bd.pickup_charge || 0,
    subtotal: subtotal,
    total: total,
    discount_percent: 0,
    discount_amount: 0,
    tax_percent: bd.tax_percent,
    tax_amount: tax_amount,
    amount: total,
    balance: total,
    amount_text: custom.terbilang(total),
    is_print_invoice: false,
    print_by: user.email,
    print_date: moment(),
    usrupd: user.email,
    payment_id:bd.payment_id,
    payment_info:bd.payment_info,
    invoice_type: `SMUWH-${bd.type.toUpperCase()}`
  };

  await models.Invoice.create(dataInvoice, transaction);
  await models.Invoice_detail_wh.bulkCreate(detailData, { transaction });
  await transaction.commit();
  const updateAll = await updateInvoiceToSMU(detailData, tgl, user, contact.name);
  logger.info(JSON.stringify(dataInvoice));
  return ReS(res,{...dataInvoice,},200);
  } catch (err) {
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};

const UPDATE_INVOICE_WH=async (req,res)=>{
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  // if (!errors.isEmpty()) {
  //   errReturn(errors.array());
  // }
  const user = req.decoded;
  const companyId=req.params.company_id;
  let bd = req.body;
  let dataShipment;
  let charge = parseFloat(bd.charge) || 0;
  let others_charge = parseFloat(bd.pickup_charge) || 0;
  let handling = parseFloat(bd.handling) || 0;
  let packing_charge = parseFloat(bd.packing_charge) || 0;
  let insurance = parseFloat(bd.insurance) || 0;
  let subtotal = charge + insurance + others_charge + handling + packing_charge;
  let tax_percent = parseFloat(bd.tax_percent) || 0;
  let tax_amount = (tax_percent / 100) * charge;
  let total = subtotal + tax_amount;
  let tgl = moment(new Date(bd.invoice_date)).format('YYYY-MM-DD HH:mm:ss');
  let tgl_due = moment(new Date(bd.invoice_due_date)).format("YYYY-MM-DD HH:mm:ss");
  

  if (bd && bd.detail && bd.detail.length > 0) {
    dataShipment = bd.detail;
    delete bd['detail'];
  }
  let dataInvoice = await models.Invoice.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: models.Invoice_detail_wh,
        as: 'invoice_detail_wh',
        required: false,
      },
    ],
  });
  const contact = await models.Contact.findOne({
    where: {
      contact_id: bd.contact_id,
    },
    raw: true,
  });
  if (!contact) {
    return ReE(res, 'Contact tidak terdaftar', 404);
  }
  if (!dataInvoice) {
    return ReE(res, 'data kosong', 404);
  }
  // if (bd.detail && bd.detail.length == 0) {
  //   return ReE(res, 'data detail kosong', 404);
  // }
  
  const invoiceId = dataInvoice.invoice_id;
  dataInvoice = dataInvoice.toJSON();
  if (dataInvoice && dataInvoice.paid>0){
    return ReE(res, 'tidak bisa di edit karena sudah terjadi pembayaran', 404);
  }
  let dataOld = dataInvoice.invoice_detail_wh;
  let dataCurrent = dataShipment||[];
  let removeData;

  if (dataCurrent.length>0){
    removeData = dataOld.filter(custom.comparer(dataCurrent));
  } else{
    removeData=dataOld;
  }
  let transaction;
  try{
    transaction = await s.transaction();
      /** Remove  data */
      await Promise.all(
        removeData.map(async (item) => {
          await models.Smu.update({ is_invoice: false }, { where: { smu_id: item.smu_id } });
          await models.Invoice_detail_wh.destroy({ where: { id: item.id } });
          await history.LOG({
            status: 'UPDATE',
            status_name: 'UPDATE INVOICE SMU WH',
            reff_1: invoiceId,
            reff_2: item.shipment_awb,
            company_id: companyId,
          });
          return item;
        })
      );
      /** END */
      const dataInvoice = {
        company_id: companyId,
        invoice_term: bd.invoice_term,
        invoice_date: tgl,
        invoice_due_date: tgl_due,
        contact_id: bd.contact_id,
        contact_name: bd.contact_name,
        contact_bill_address: bd.contact_bill_address,
        contact_bill_npwp: bd.contact_bill_npwp?bd.contact_bill_npwp:bd.contact_id,
        charge: bd.charge,
        insurance: bd.insurance || 0,
        handling: bd.handling || 0,
        packing_charge: bd.packing_charge || 0,
        others_charge: bd.pickup_charge || 0,
        subtotal: subtotal,
        total: total,
        discount_percent: 0,
        discount_amount: 0,
        tax_percent: bd.tax_percent,
        tax_amount: tax_amount,
        amount: total,
        balance: total,
        amount_text: custom.terbilang(total),
        is_print_invoice: false,
        print_by: user.email,
        print_date: moment(),
        usrupd: user.email,
        payment_id:bd.payment_id,
        payment_info:bd.payment_info,
      };
      let dtInvoiceDetail = [];
      let dataIDetail=[]
      if (dataShipment && dataShipment.length>0){
        dataIDetail = await Promise.all(
          dataShipment.map(async (item) => {
            const dataDetail = await models.Invoice_detail_wh.findOne({
              where: {
                invoice_id: invoiceId,
                smu_id: item,
              },
            });
            if (!dataDetail) {
              dtInvoiceDetail.push({
                company_id: companyId,
                invoice_id: invoiceId,
                smu_id: item,
                usrupd: user.email,
              });
            }
            return {
              company_id: companyId,
              invoice_id:invoiceId,
              smu_id: item,
              usrupd: user.email,
            };
          })
        );
      }
    await models.Invoice.update(dataInvoice, { where: { id: req.params.id } }, { transaction });
    await models.Invoice_detail_wh.bulkCreate(dtInvoiceDetail, { transaction });
    await transaction.commit();
    const updateAll = await updateInvoiceToSMU(dataIDetail, tgl, user, contact.name);
    logger.info(JSON.stringify(dataIDetail));
    return ReS(res,{...dataInvoice,},200);
  } catch (err) {
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
}

const SAVE_INVOICE= async(req,res)=>{
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  let transaction;
  try {
  const user = req.decoded;
  const companyId=req.params.company_id;
  let bd = req.body;
  let dataShipment = [];
  let charge = parseFloat(bd.charge) || 0;
  let others_charge = parseFloat(bd.pickup_charge) || 0;
  let handling = parseFloat(bd.handling) || 0;
  let packing_charge = parseFloat(bd.packing_charge) || 0;
  let insurance = parseFloat(bd.insurance) || 0;
  let subtotal = charge + insurance + others_charge + handling + packing_charge;
  let tax_percent = parseFloat(bd.tax_percent)||0;
  let tax_amount = (tax_percent / 100) * subtotal;
  let total = subtotal + tax_amount;
  let tgl = moment(new Date(bd.invoice_date)).format('YYYY-MM-DD HH:mm:ss');
  let tgl_due = moment(new Date(bd.invoice_due_date)).format("YYYY-MM-DD HH:mm:ss");
  if (bd && bd.detail && bd.detail.length > 0) {
    dataShipment = bd.detail;
    delete bd['detail'];
  }
  const  contact = await models.Contact.findOne({
    where: {
      contact_id: bd.contact_id,
    },
    raw: true,
  });
  let cariShipment=[];
  dataShipment.map(function (v) {
    cariShipment.push(v);
  });
  let checkShipment = await models.Shipment.findAll({
    attributes: ['shipment_awbm'],
    where: {
      is_invoice: true,
      shipment_awb: {
        [Op.in]: cariShipment,
      },
    },
    raw: true,
  });
  if (checkShipment.length > 0) {
    return ReE(res, 'Ada shipment yang sudah pernah di proses  invoice' + JSON.stringify(checkShipment), 403);
  }
  if (!contact) {
    return ReE(res, 'Error', 'Data Contact ' + bd.contact_id + ' tidak ada');
  }
  transaction = await s.transaction();

  
  const numeric = await numbering.INVOICE(req);
  console.log(numeric);
  const invoiceId = numeric.numeric;
  const detailData = await Promise.all(
    dataShipment.map(async (x) => {
      return {
        company_id: companyId,
        invoice_id: invoiceId,
        shipment_awb: x,
        usrupd: user.email,
      };
    })
  );
  const dataInvoice = {
    company_id: companyId,
    invoice_id: invoiceId,
    invoice_no: invoiceId,
    invoice_term: bd.invoice_term,
    description:bd.description,
    invoice_date: tgl,
    invoice_due_date: tgl_due,
    contact_id: bd.contact_id,
    contact_name: bd.contact_name,
    contact_bill_address: bd.contact_bill_address,
    contact_bill_npwp: bd.contact_bill_npwp?bd.contact_bill_npwp:bd.contact_id,
    charge: bd.charge,
    insurance: bd.insurance || 0,
    handling: bd.handling || 0,
    packing_charge: bd.packing_charge || 0,
    others_charge: bd.pickup_charge || 0,
    subtotal: subtotal,
    total: total,
    discount_percent: 0,
    discount_amount: 0,
    tax_percent: bd.tax_percent,
    tax_amount: tax_amount,
    amount: total,
    balance: total,
    amount_text: custom.terbilang(total),
    is_print_invoice: false,
    print_by: user.email,
    print_date: moment(),
    usrupd: user.email,
    payment_id:bd.payment_id,
    payment_info:bd.payment_info,
    invoice_type:'SHIPMENT'
  };
  await models.Invoice.create(dataInvoice, transaction);
  await models.Invoice_detail.bulkCreate(detailData, { transaction });
  await models.Contact.update({
    contact_bill_address:bd.contact_bill_address
  }, { where: { contact_id: bd.contact_id } }, { transaction });
  await transaction.commit();
  const updateAll = await updateInvoiceToShipment(detailData, tgl, user, contact.name);
  logger.info(JSON.stringify(dataInvoice));
  return ReS(res,{...dataInvoice,},200);
  } catch (err) {
    console.log(err);
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};
const UPDATE_INVOICE=async (req,res)=>{
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  // if (!errors.isEmpty()) {
  //   errReturn(errors.array());
  // }
  const user = req.decoded;
  const companyId=req.params.company_id;
  let bd = req.body;
  let dataShipment;
  let charge = parseFloat(bd.charge) || 0;
  let others_charge = parseFloat(bd.pickup_charge) || 0;
  let handling = parseFloat(bd.handling) || 0;
  let packing_charge = parseFloat(bd.packing_charge) || 0;
  let insurance = parseFloat(bd.insurance) || 0;
  let subtotal = charge + insurance + others_charge + handling + packing_charge;
  let tax_percent = parseFloat(bd.tax_percent) || 0;
  let tax_amount = (tax_percent / 100) * (subtotal);
  let total = subtotal + tax_amount;
  let tgl = moment(new Date(bd.invoice_date)).format('YYYY-MM-DD HH:mm:ss');
  let tgl_due = moment(new Date(bd.invoice_due_date)).format("YYYY-MM-DD HH:mm:ss");
  if (bd && bd.detail && bd.detail.length > 0) {
    dataShipment = bd.detail;
    delete bd['detail'];
  }
  let dataInvoice = await models.Invoice.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: models.Invoice_detail,
        as: 'invoice_detail',
        required: false,
      },
    ],
  });
  const contact = await models.Contact.findOne({
    where: {
      contact_id: bd.contact_id,
    },
    raw: true,
  });
  if (!contact) {
    return ReE(res, 'Contact tidak terdaftar', 404);
  }
  if (!dataInvoice) {
    return ReE(res, 'data kosong', 404);
  }
  // if (bd.detail && bd.detail.length == 0) {
  //   return ReE(res, 'data detail kosong', 404);
  // }
  const invoiceId = dataInvoice.invoice_id;
  dataInvoice = dataInvoice.toJSON();
  if (dataInvoice && dataInvoice.paid>0){
    return ReE(res, 'tidak bisa di edit karena sudah terjadi pembayaran', 404);
  }
  let dataOld = dataInvoice.invoice_detail;
  let dataCurrent = dataShipment||[];
  let removeData;
  if (dataCurrent.length>0){
    removeData = dataOld.filter(custom.comparer(dataCurrent));
  } else{
    removeData=dataOld;
  }
  let transaction;
  try{
    transaction = await s.transaction();
      /** Remove  data */
      await Promise.all(
        removeData.map(async (item) => {
          await models.Shipment.update({ is_invoice: false,is_print_invoice:false }, { where: { shipment_awb: item.shipment_awb } });
          await models.Invoice_detail.destroy({ where: { id: item.id } });
          await history.LOG({
            status: 'UPDATE',
            status_name: 'UPDATE INVOICE',
            reff_1: invoiceId,
            reff_2: item.shipment_awb,
            company_id: companyId,
          });
          return item;
        })
      );
      /** END */
      const dataInvoice = {
        company_id: companyId,
        invoice_term: bd.invoice_term,
        invoice_date: tgl,
        invoice_due_date: tgl_due,
        contact_id: bd.contact_id,
        contact_name: bd.contact_name,
        contact_bill_address: bd.contact_bill_address,
        contact_bill_npwp: bd.contact_bill_npwp?bd.contact_bill_npwp:bd.contact_id,
        charge: bd.charge,
        insurance: bd.insurance || 0,
        handling: bd.handling || 0,
        packing_charge: bd.packing_charge || 0,
        others_charge: bd.pickup_charge || 0,
        subtotal: subtotal,
        total: total,
        discount_percent: 0,
        discount_amount: 0,
        tax_percent: bd.tax_percent,
        tax_amount: tax_amount,
        amount: total,
        balance: total,
        amount_text: custom.terbilang(total),
        is_print_invoice: false,
        print_by: user.email,
        description:bd.description,
        print_date: moment(),
        usrupd: user.email,
        payment_id:bd.payment_id,
        payment_info:bd.payment_info,
      };
      let dtInvoiceDetail = [];
      let dataIDetail=[]
      if (dataShipment && dataShipment.length>0){
        dataIDetail = await Promise.all(
          dataShipment.map(async (item) => {
            const dataDetail = await models.Invoice_detail.findOne({
              where: {
                invoice_id: invoiceId,
                shipment_awb: item,
              },
            });
            if (!dataDetail) {
              dtInvoiceDetail.push({
                company_id: companyId,
                invoice_id: invoiceId,
                shipment_awb: item,
                usrupd: user.email,
              });
            }
            return {
              company_id: companyId,
              invoice_id:invoiceId,
              shipment_awb: item,
              usrupd: user.email,
            };
          })
        );
      }
    await models.Invoice.update(dataInvoice, { where: { id: req.params.id } }, { transaction });
    await models.Invoice_detail.bulkCreate(dtInvoiceDetail, { transaction });
    await models.Contact.update({
      contact_bill_address:bd.contact_bill_address
    }, { where: { contact_id: bd.contact_id } }, { transaction });
    await transaction.commit();
    const updateAll = await updateInvoiceToShipment(dataIDetail, tgl, user, contact.name);
    logger.info(JSON.stringify(dataIDetail));
    return ReS(res,{...dataInvoice,},200);
  } catch (err) {
    console.log(err); 
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};
const VOID_INVOICE=async(req,res)=>{
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  // if (!errors.isEmpty()) {
  //   errReturn(errors.array());
  // }
  const user = req.decoded;
  const companyId=req.params.company_id;
  let bd = req.body;
  let dataInvoice = await models.Invoice.findOne({
    where: { id: req.params.id, is_void:false },
    include: [
      {
        model: models.Invoice_detail,
        as: 'invoice_detail',
        required: false,
      },
    ],
  });
  if (!dataInvoice) {
    return ReE(res, 'data kosong', 404);
  }
  // if (bd.detail && bd.detail.length == 0) {
  //   return ReE(res, 'data detail kosong', 404);
  // }
  const invoiceId = dataInvoice.invoice_id;
  dataInvoice = dataInvoice.toJSON();
  if (dataInvoice && dataInvoice.paid>0){
    return ReE(res, 'tidak bisa di void karena sudah terjadi pembayaran', 404);
  }
  let dataOld = dataInvoice.invoice_detail;
  
  let transaction;
  try{
    transaction = await s.transaction();
      /** Remove  data */
      await Promise.all(
        dataOld.map(async (item) => {
          await models.Shipment.update({ is_invoice: false,is_print_invoice:false }, { where: { shipment_awb: item.shipment_awb } });
          await history.LOG({
            status: 'VOID',
            status_name: 'VOID INVOICE',
            reff_1: invoiceId,
            reff_2: item.shipment_awb,
            company_id: companyId,
          });
          return item;
        })
      );
      /** END */
    
     
    await models.Invoice.update({
      is_void:true, tgl_void:new Date(),void_by:req.decoded.name
    }, { where: { id: req.params.id } }, { transaction });
    await transaction.commit();
    return ReS(res,{...dataInvoice,},200);
  } catch (err) {
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
}
const GET_INVOICE_ID=async(req,res)=>{
  const user = req.decoded;
  try {
  let src={};
  if (req.query.type=="NO"){
    src={
      invoice_no:req.params.id
    }
  }else{
    src={
      id:req.params.id,
    }
  }
  const invoiceData = await models.Invoice.findOne({
    where:{
      ...src
    },
    include: [
      {
        model: models.Invoice_detail,
        as: 'invoice_detail',
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
  })
  if (!invoiceData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  if (invoiceData && invoiceData.is_void){
    return ReE(res, `Invoice ini sudah di batalkan`, 403);
  }
  return ReS(res, { data: invoiceData }, 200);
  } catch (err) {
    return ReE(res, err.message);
  }
}


const GET_INVOICE_LIST=async(req,res)=>{
const user = req.decoded;
const companyId = req.params.company_id;
let pg = req.query.pg || 1;
let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
let order = [['invoice_date', 'ASC']];
let src = null;
let viewOr = null;
let filter = null;
if (req.query && req.query.term) {
  filter = req.query.term;
  viewOr = [
    {
      invoice_id: {
        [Op.iLike]: "%" + filter + "%",
      },
    },
    {
      contact_name: {
        [Op.iLike]: "%" + filter + "%",
      },
    },
    {
      description: {
        [Op.iLike]: "%" + filter + "%",
      },
    },
  ];
}
src = {
  company_id: companyId
};
if (req.query.type==='cash'){
  src.invoice_cash=true
}else{
  src.invoice_cash=false;
}
let start_date = req.query.start_date|| null;
let end_date = req.query.end_date || null;
let st, ed;
if (start_date) {
  st = moment(new Date(start_date)).format("YYYY-MM-DD 00:00:00");
  if (end_date) {
    ed = moment(new Date(end_date)).format("YYYY-MM-DD 00:00:00");
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
  src.invoice_date = {
    [Op.between]: [st, ed],
  };
}
if (req.query.contact_id) {
  src.contact_id = req.query.contact_id;
}
if (viewOr) {
  src[Op.or] = viewOr;
}
src.invoice_type='SHIPMENT'
let options = {
  where: src,
  order: [["invoice_date", "DESC"]],
  page: pg,
  paginate: limit,
  attributes: [
    "id",
    "invoice_id",
    "invoice_no",
    "invoice_date",
    "invoice_cash",
    "invoice_term",
    "invoice_due_date",
    "contact_id",
    "contact_name",
    "contact_bill_address",
    "description",
    "charge",
    "subtotal",
    "total",
    "tax_percent",
    "tax_amount",
    "amount",
    "balance",
    "paid",
    "is_print_invoice",
    "print_by",
    "print_date",
    "is_receive_invoice",
    "receive_by",
    "received_date",
    "is_paid",
    "is_void",
    "tgl_void",
    "void_by",
    // [
    //   s.literal(
    //     `(SELECT
    //           DISTINCT
    //           ARRAY_AGG(to_char("Invoice_payment_detail"."created", 'YYYY-MM-DD')) AS tgl_payment
    //       FROM "Invoice"
    //       LEFT JOIN "Invoice_payment_detail" ON
    //           "Invoice_payment_detail"."invoice_id" = "Invoice"."invoice_id"
    //       GROUP BY
    //           "Invoice".id,
    //           "Invoice"."invoice_id")`
    //   ),
    //   'tgl_payment'
    // ],
    // [s.col("payment.created"), "tgl_payment"],
    // [s.fn("date_part",'day',s.fn("NOW"), s.col("invoice_date")), "aging"],
  ],
  include: [
    {
      model: models.Invoice_detail,
      as: "invoice_detail",
      required: false,
      include: [
        {
          model: models.Shipment,
          as: "shipment_detail",
          required: false,
        },
      ],
    },
    {
      model: models.Invoice_payment_detail,
      as: "payment",
      required: false,
      include: [
        {
          model: models.Invoice_payment,
          as: 'invoice_payment',
          required: false,
        },
      ],
    },
  ],
};

// Add a lateral join to calculate tgl_payment array
options.attributes.push([
  models.sequelize.literal(
    `(SELECT DISTINCT ARRAY_AGG(to_char("payment"."created", 'YYYY-MM-DD')) AS tgl_payment
      FROM "Invoice_payment_detail" AS "payment"
      WHERE "payment"."invoice_id" = "Invoice"."invoice_id")`
  ),
  'tgl_payment'
]);
// options.subQuery = false;

try {
  const { docs, pages, total } = await models["Invoice"].paginate(options);
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
}



const GET_INVOICE_WH_LIST=async(req,res)=>{
  const user = req.decoded;
  const companyId = req.params.company_id;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let order = [['invoice_date', 'ASC']];
  let src = null;
  let viewOr = null;
  let filter = null;
  if (req.query && req.query.term) {
    filter = req.query.term;
    viewOr = [
      {
        invoice_id: {
          [Op.iLike]: "%" + filter + "%",
        },
      },
      {
        contact_name: {
          [Op.iLike]: "%" + filter + "%",
        },
      },
      {
        description: {
          [Op.iLike]: "%" + filter + "%",
        },
      },
    ];
  }
  src = {
    company_id: companyId
  };
  
  let start_date = req.query.start_date|| null;
  let end_date = req.query.end_date || null;
  let st, ed;
  if (start_date) {
    st = moment(new Date(start_date)).format("YYYY-MM-DD 00:00:00");
    if (end_date) {
      ed = moment(new Date(end_date)).format("YYYY-MM-DD 00:00:00");
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
    src.invoice_date = {
      [Op.between]: [st, ed],
    };
  }
  if (req.query.contact_id) {
    src.contact_id = req.query.contact_id;
  }
  if (viewOr) {
    src[Op.or] = viewOr;
  }
  if (req.query.type==='inbound'){
    src.invoice_type='SMUWH-I'
  }
  if (req.query.type==='outbound'){
    src.invoice_type='SMUWH-O'
  }
  

  console.log('--->>>>>>>',src);

  let options = {
    where: src,
    order: [["invoice_date", "DESC"]],
    page: pg,
    paginate: limit,
    attributes: [
      "id",
      "invoice_id",
      "invoice_no",
      "invoice_date",
      "invoice_cash",
      "invoice_term",
      "invoice_due_date",
      "contact_id",
      "contact_name",
      "contact_bill_address",
      "description",
      "charge",
      "subtotal",
      "total",
      "tax_percent",
      "tax_amount",
      "amount",
      "balance",
      "paid",
      "is_print_invoice",
      "print_by",
      "print_date",
      "is_receive_invoice",
      "receive_by",
      "received_date",
      "invoice_type",
      "is_paid",
      // [s.fn("date_part",'day',s.fn("NOW"), s.col("invoice_date")), "aging"],
    ],
    include: [
      {
        model: models.Invoice_detail_wh,
        as: "invoice_detail_wh",
        required: false,
        include: [
          {
            model: models.Smu,
            as: "smu_detail",
            required: false,
          },
        ],
      },
    ],
  };
  try {
    const { docs, pages, total } = await models["Invoice"].paginate(options);
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
  }


  const GET_INVOICE_WH_ID=async(req,res)=>{
    const user = req.decoded;
    try {
    let src={};
    if (req.query.type=="NO"){
      src={
        invoice_no:req.params.id
      }
    }else{
      src={
        id:req.params.id,
      }
    }
    const invoiceData = await models.Invoice.findOne({
      where:{
        ...src
      },
      include: [
        {
          model: models.Invoice_detail_wh,
          as: 'invoice_detail_wh',
          required: false,
          include: [
            {
              model: models.Smu,
              as: 'smu_detail',
              required: false,
            },
          ],
        },
      ],
    })
    if (!invoiceData) {
      return ReE(res, `Data tidak di temukan`, 403);
    }
    return ReS(res, { data: invoiceData }, 200);
    } catch (err) {
      return ReE(res, err.message);
    }
  }
  



const GET_INVOICE_OS_PAYMENT=async(req,res)=>{
const user = req.decoded;
const companyId = req.params.company_id;
let pg = req.query.pg || 1;
let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
let order = [['invoice_date', 'ASC']];
let src = null;
let viewOr = null;
let filter = null;
if (req.query && req.query.term) {
  filter = req.query.term;
  viewOr = [
    {
      invoice_id: {
        [Op.iLike]: "%" + filter + "%",
      },
    },
    {
      contact_name: {
        [Op.iLike]: "%" + filter + "%",
      },
    },
    {
      description: {
        [Op.iLike]: "%" + filter + "%",
      },
    },
  ];
}
src = {
  company_id: companyId,
  balance:{
    [Op.gt]:0
  }
};

if(req.query.is_paid){
  Object.assign(src,{
    balance : 0
  });
}

if (req.query.contact_id) {
  src.contact_id = req.query.contact_id;
}
if (viewOr) {
  src[Op.or] = viewOr;
}
let options = {
  where: src,
  order: [["invoice_date", "DESC"]],
  page: pg,
  paginate: limit,
  attributes: [
    "id",
    "invoice_id",
    "invoice_no",
    "invoice_date",
    "invoice_cash",
    "invoice_term",
    "invoice_type",
    "invoice_due_date",
    "contact_id",
    "contact_name",
    "contact_bill_address",
    "description",
    "charge",
    "subtotal",
    "total",
    "tax_percent",
    "tax_amount",
    "amount",
    "balance",
    "paid",
    "is_print_invoice",
    "print_by",
    "print_date",
    "is_receive_invoice",
    "receive_by",
    "received_date",
    "is_paid",
    // [s.fn("date_part",'day',s.fn("NOW"), s.col("invoice_date")), "aging"],
  ],
};
try {
  const { docs, pages, total } = await models["Invoice"].paginate(options);
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
}
const GET_LIST_PAYMENT=async(req,res)=>{
  const user = req.decoded;
  const companyId = req.params.company_id;
  let pg = req.query.pg || 1;
  let limit = parseInt(req.query.limit) || CONFIG.PAGE_LIMIT;
  let order = [['payment_date', 'ASC']];
  let src = null;
  let viewOr = null;
  let filter = null;
  if (req.query && req.query.term) {
    filter = req.query.term;
    viewOr = [
      {
        payment_id: {
          [Op.iLike]: "%" + filter + "%",
        },
      },
      {
        contact_name: {
          [Op.iLike]: "%" + filter + "%",
        },
      },
      {
        description: {
          [Op.iLike]: "%" + filter + "%",
        },
      },
    ];
  }
  src = {
    company_id: companyId
  };
  let start_date = req.query.start_date|| null;
  let end_date = req.query.end_date || null;
  let st, ed;
  if (start_date) {
    st = moment(new Date(start_date)).format("YYYY-MM-DD 00:00:00");
    if (end_date) {
      ed = moment(new Date(end_date)).format("YYYY-MM-DD 00:00:00");
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
    src.payment_date = {
      [Op.between]: [st, ed],
    };
  }
  if (req.query.contact_id) {
    src.contact_id = req.query.contact_id;
  }
  if (viewOr) {
    src[Op.or] = viewOr;
  }
  let options = {
    where: src,
    order: [["payment_date", "ASC"]],
    page: pg,
    paginate: limit,
  
    include: [
      {
        model: models.Invoice_payment_detail,
        as: "invoice_payment_detail",
        required: false,
        include: [
          {
            model: models.Invoice,
            as: "invoice_detail",
            required: false,
          },
        ],
      },
    ],
 
  };
  try {
    const { docs, pages, total } = await models["Invoice_payment"].paginate(options);

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
}
const SAVE_PAYMENT= async(req,res)=>{
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  let transaction;
  try {
  const user = req.decoded;
  const companyId=req.params.company_id;
  let bd = req.body;
  let dataShipment = [];
  let tgl = moment(new Date(bd.payment_date)).format('YYYY-MM-DD HH:mm:ss');
  if (bd && bd.detail && bd.detail.length > 0) {
    dataShipment = bd.detail;
    delete bd['detail'];
  }
  const  contact = await models.Contact.findOne({
    where: {
      contact_id: bd.contact_id,
    },
    raw: true,
  });
  let cariShipment=[];
  dataShipment.map(function (v) {
    cariShipment.push(v.invoice_id);
  });
  let checkShipment = await models.Invoice.findAll({
    attributes: ['invoice_id'],
    where: {
      invoice_id: {
        [Op.in]: cariShipment,
      },
    },
    raw: true,
  });
  if (!contact) {
    return ReE(res, 'Error', 'Data Contact ' + bd.contact_id + ' tidak ada');
  }
  transaction = await s.transaction();
  const numeric = await numbering.PAYMENT(req);
  const paymentId = numeric.numeric;
  let total=0;
  const detailData = await Promise.all(
    dataShipment.map(async (x) => {
      total+=x.paid_total;
      return {
        company_id: companyId,
        payment_id:paymentId,
        invoice_id: x.invoice_id,
        amount:x.amount||0,
        balance:x.balance||0,
        paid:x.paid||0,
        paid_other:x.paid_other||0,
        balance_after:x.balance_after||0,
        paid_total:x.paid_total||0
      };
    })
  );
  const dataInvoice = {
    company_id: companyId,
    payment_id: paymentId,
    payment_no: paymentId,
    payment_date: tgl,
    account_code:bd.account_code,
    account_name:bd.account_code,
    contact_id: bd.contact_id,
    contact_name: bd.contact_name,
    description:bd.description,
    amount: total||0,
    usrupd: user.email,
  };
  await models.Invoice_payment.create(dataInvoice, transaction);
  await models.Invoice_payment_detail.bulkCreate(detailData, { transaction });
  await transaction.commit();
  const updateAll = await updatePaymentToInvoice(detailData, tgl, user, contact.name);
  
  const Data =  await models.Invoice_payment_detail.findAll({
    attributes:[
      [
        s.fn(
          "sum",
          s.col(
             'amount'
          )
        ),
        "amt",
      ],
      [
        s.fn(
          "sum",
          s.col(
             'balance'
          )
        ),
        "bl",
      ],
      [
        s.fn(
          "sum",
          s.col(
             'paid'
          )
        ),
        "pd",
      ],
    ],
    where:{
      payment_id:paymentId
    },
    raw:true
  },)
 
  await models.Invoice_payment.update({
    amount:Data[0].amt,
    paid:Data[0].pd,
    balance:Data[0].bl
  }, { where: { payment_id:  paymentId } });

  logger.info(JSON.stringify(dataInvoice));
  return ReS(res,{...dataInvoice,},200);
  } catch (err) {
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};
const UPDATE_PAYMENT= async(req,res)=>{
  const errReturn = function (message) {
    return ReE(res, message, 403);
  };
  let transaction;
  try {
  const user = req.decoded;
  const companyId=req.params.company_id;
  let bd = req.body;
  let dataShipment = [];
  let tgl = moment(new Date(bd.payment_date)).format('YYYY-MM-DD HH:mm:ss');
  if (bd && bd.detail && bd.detail.length > 0) {
    dataShipment = bd.detail;
    delete bd['detail'];
  }
  const paymentData = await models.Invoice_payment.findOne({
    where:{
      id:req.params.id
    }
  })
  if (!paymentData){
    return ReE(res, 'Error', 'Data  tidak ada');
  }
  const  contact = await models.Contact.findOne({
    where: {
      contact_id: bd.contact_id,
    },
    raw: true,
  });
  let cariShipment=[];
  dataShipment.map(function (v) {
      cariShipment.push(v.invoice_id);
  });
  let checkShipment = await models.Invoice.findAll({
    attributes: ['invoice_id'],
    where: {
      invoice_id: {
        [Op.in]: cariShipment,
      },
    },
    raw: true,
  });
  if (!contact) {
    return ReE(res, 'Error', 'Data Contact ' + bd.contact_id + ' tidak ada');
  }
  transaction = await s.transaction();
  paymentId=paymentData.payment_id
  let total=0;
  const detailData = await Promise.all(
    dataShipment.map(async (x) => {
      total+=x.paid_total;
        return {
          company_id: companyId,
          payment_id:paymentId,
          invoice_id: x.invoice_id,
          amount:x.amount||0,
          balance:x.balance||0,
          paid:x.paid||0,
          paid_other:x.paid_other||0,
          balance_after:x.balance_after||0,
          paid_total:x.paid_total||0
        };
    })
  );
  const dataInvoice = {
    payment_date: tgl,
    account_code:bd.account_code,
    account_name:bd.account_code,
    contact_id: bd.contact_id,
    contact_name: bd.contact_name,
    description:bd.description,
    amount: total||0,
    usrupd: user.email,
  };
  await models.Invoice_payment.update(dataInvoice, { where: { id: req.params.id } }, { transaction });
  await models.Invoice_payment_detail.bulkCreate(detailData, { transaction });
  await transaction.commit();
  console.log('----<<<<<< update',detailData)
  const updateAll = await updatePaymentToInvoice(detailData, tgl, user, contact.name);
  logger.info(JSON.stringify(dataInvoice));

  const Data =  await models.Invoice_payment_detail.findAll({
    attributes:[
      [
        s.fn(
          "sum",
          s.col(
             'amount'
          )
        ),
        "amt",
      ],
      [
        s.fn(
          "sum",
          s.col(
             'balance'
          )
        ),
        "bl",
      ],
      [
        s.fn(
          "sum",
          s.col(
             'paid'
          )
        ),
        "pd",
      ],
    ],
    where:{
      payment_id:paymentId
    },
    raw:true
  },)
 
  await models.Invoice_payment.update({
    amount:Data[0].amt,
    paid:Data[0].pd,
    balance:Data[0].bl
  }, { where: { id: req.params.id } });
  return ReS(res,{...dataInvoice,},200);
  } catch (err) {

    console.log(err);
    if (transaction) {
      transaction.rollback();
    }
    return errReturn(err.message);
  }
};
const GET_PAYMENT_ID=async(req,res)=>{
  const user = req.decoded;
  try {
  let src={};
  if (req.query.type=="NO"){
    src={
      invoice_no:req.params.id
    }
  }else{
    src={
      id:req.params.id,
    }
  }
  const invoiceData = await models.Invoice_payment.findOne({
    where:{
      ...src
    },
    include: [
      {
        model: models.Invoice_payment_detail,
        as: 'invoice_payment_detail',
        required: false,
        include: [
          {
            model: models.Invoice_payment,
            as: 'invoice_payment',
            required: false,
          },
        ],
      },
    ],
  })
  if (!invoiceData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  return ReS(res, { data: invoiceData }, 200);
  } catch (err) {
    return ReE(res, err.message);
  }
}
const DELETE_PAYMENT_INVOICE_ID=async(req,res)=>{
  const user = req.decoded;
  try {
  
  const invoiceData = await models.Invoice_payment_detail.findOne({
    where:{
      payment_id:req.params.payment_id,
      invoice_id:req.params.invoice_id
    },
  })
  if (!invoiceData) {
    return ReE(res, `Data tidak di temukan`, 403);
  }
  await models.Invoice.update(
    { paid: s.literal(`paid - ${invoiceData.paid}`),
    balance: s.literal(`balance + ${invoiceData.paid}`) 
   },
    {
      where: {
        invoice_id: invoiceData.invoice_id,
      },
    }
  );
  await models.Invoice_payment_detail.destroy(
    {
      where:{
        payment_id:req.params.payment_id,
        invoice_id:req.params.invoice_id
      },
    }
  );

  const checkInvoice =  await models.Invoice.findOne({where:{invoice_id:invoiceData.invoice_id}});
  if (checkInvoice && checkInvoice.balance>0 && checkInvoice.invoice_type==='SHIPMENT'){
    console.log('updat epaid')

      await updatePaidShipment(checkInvoice.invoice_id,false)
  } 

  if (checkInvoice && checkInvoice.balance>0 && checkInvoice.invoice_type==='SMUWH-I' ){
    

      await updatePaidWH(checkInvoice.invoice_id,false)
  } 

  
  if (checkInvoice && checkInvoice.balance>0 && checkInvoice.invoice_type==='SMUWH-O' ){
   

      await updatePaidWH(checkInvoice.invoice_id,false)
  } 

  return ReS(res,{data:invoiceData},200);
  } catch (err) {
    return ReE(res, err.message);
  }
}
module.exports = {
  SHIPMENT_ZERO_AMOUNT,
  SHIPMENT_BY_AWB_INVOICE,
  SHIPMENT_BY_AWB_CASH,
  SHIPMENT_VALIDASI_INVOICE_UPDATE,
  SHIPMENT_CASH,
  SHIPMENT_VALIDASI_CASH_UPDATE,
  SHIPMENT_UNINVOICE,
  SHIPMENT_UNINVOICE_BYCUST,
  SHIPMENT_PAID,
  SAVE_INVOICE,
  UPDATE_INVOICE,
  GET_INVOICE_ID,
  GET_PAYMENT_ID,
  GET_INVOICE_LIST,
  GET_LIST_PAYMENT,
  GET_INVOICE_OS_PAYMENT,
  SAVE_PAYMENT,
  UPDATE_PAYMENT,
  DELETE_PAYMENT_INVOICE_ID,
  SEWA_GUDANG_UNINVOICE,
  SEWA_GUDANG_BY_SMU_INVOICE,
  SAVE_INVOICE_WH,
  UPDATE_INVOICE_WH,
  GET_INVOICE_WH_LIST,
  GET_INVOICE_WH_ID,
  VOID_INVOICE
};
