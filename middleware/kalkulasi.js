const async = require('async');
const models = require('../models');
const moment = require('moment');
const s = require('../models/index').sequelize;

const cariHargaPublish = (data, callback) => {};
const hitungPublishPrice = (data, user, callback) => {
    /** data terdiri
     * origin,
     * destination,
     * weight_actual,
     * weight_vol,
     * weight_invoice,
     * service,
     * uom
     */
    if (data && !data.weight_actual || data.weight_actual == 0) {
        data.weight_actual = 1;
    }
    if (data && !data.weight_vol) {
        data.weight_vol = 0;
    }
    let berat = data.weight_actual >= data.weight_vol ? Math.ceil(data.weight_actual) : Math.ceil(data.weight_vol);

    let lt = 1,
        leadTime = '',
        min = 1,
        hargaMin = 0,
        hargaSatuan = 0,
        ttl = 0,
        totalWeight = berat;
    let hasil = {};
    console.log('---e,',data);
    async.waterfall([
        cariAsal = (cb) => {
            models['Destination'].findOne({
                where: {
                    dest_id: data.origin
                }
            }).then((r) => {
                if (r) {
                    hasil.origin = r.toJSON();
                    cb(null, hasil);
                } else {
                    cb('Kota origin dengan kode ' + data.origin + ', tidak terdaftar');
                }
            }, (e) => {
                cb(e)
            })
        },
        cariTujuan = (hasil, cb) => {
            models['Destination'].findOne({
                where: {
                    dest_id: data.destination
                }
            }).then((r) => {
                if (r) {
                    hasil.destination = r.toJSON();
                    cb(null, hasil);
                } else {
                    cb('Kota tujuan dengan kode ' + data.origin + ', tidak terdaftar');
                }
            }, (e) => {
                cb(e)
            })
        },
        cariHarga = (hasil, cb) => {
            s.query(`SELECT * From Publish_price where 
                        company_group_id=? and service_id=? and uom_id=? and moda_id=? and origin =? and destination=? 
                    `, {
                replacements: [user.company_group_id, data.service_id, data.uom_id, data.moda_id, data.origin, data.destination],
                type: s.QueryTypes.SELECT
            }).then(function(result) {

                console.log('result',result);
                if (result && result.length == 0) {
                    cb('Harga tidak ada');
                } else {
                    hasil.dataHarga = result;
                    cb(null, hasil);
                }
            }).catch(function(err) {
                cb(err)
            });
        },
        kalkulasiHarga = (hasil, cb) => {
            console.log('--->>>>', hasil);
            let dataHarga={};
            if (hasil.dataHarga && hasil.dataHarga.length==0){
                cb('Harga tidak tersedia');
            }else{
            dataHarga = hasil.dataHarga[0];
            }

            try {
                // hasil.dataHarga.map(function(v) {
                //     let range = (v.price_to - v.price_from) + 1;
                //     hargaSatuan = v.price_1;
                //     if (totalWeight > 0) {
                //         leadTime = v.lead_time_from + ' - ' + v.lead_time_to;
                //         lt = v.lead_time_to;
                //         if (totalWeight > range || v.type_price.toUpperCase() == 'FIXED') {
                //             ttl += (range * v.price_1);
                //             min = range;
                //             hargaMin = ttl;
                //         } else {
                //             ttl += (totalWeight * v.price_1);
                //             hargaSatuan = v.price_1;
                //         }
                //         totalWeight -= range;
                //     }
                // });

                let minWe= dataHarga.weight;
                let harga1 = dataHarga.price_1;
                let harga2=0;
                if (dataHarga && !dataHarga.price_2 || dataHarga.price_2==0 ){
                     harga2 = dataHarga.price_1;
                }else{
                     harga2=dataHarga.price_2;
                }
                if (totalWeight<minWe){
                    ttl = harga1 * minWe;
                }else{
                    ttl = (harga1 * minWe) + (harga2 * (totalWeight-minWe)) 
                }


                let disc_percent = data.discount_percent || 0;
                let disc = parseFloat(disc_percent / 100) * parseFloat(ttl);
                let sub_total_disc = ttl - disc;
                let insurance_price = data.insurance_price || 0;
                let insurance_charge = data.insurance_price || 0;
                // if (data && data.is_insurance){


                // }
                let packing_charge = data.packing_charge || 0;
                let sub_total = sub_total_disc + parseFloat(packing_charge) + parseFloat(insurance_charge)
                let result = {
                    origin: hasil.origin,
                    destination: hasil.destination,
                    weight: berat,
                    leadtime: lt,
                    min: min,
                    min_price: hargaMin,
                    price: hargaSatuan,
                    totalCharge: ttl,
                    disc: disc,
                    subTotal: sub_total_disc,
                    packingCharge: packing_charge,
                    insuranceCharge: insurance_charge,
                    total: sub_total
                };
                cb(null, result)
            } catch (err) {
                cb(err);

            }

        }
    ], (e, s) => {
        console.log(e);
        if (e) {
            return callback(e);
        } else {

            return callback(null, s);
        }
    })
};
const hitungContactPrice = (data,user,callback)=>{

    let berat = data.weight_invoice && data.weight_invoice>0?data.weight_invoice:data.weight;

    console.log(data);
    let lt = 1,
        leadTime = '',
        min = 1,
        hargaMin = 0,
        hargaSatuan = 0,
        ttl = 0,
        totalWeight = berat;
    let hasil = {};
 
    async.waterfall([
        cariAsal = (cb) => {
            models['Destination'].findOne({
                where: {
                    dest_id: data.origin
                },
                raw:true
            }).then((r) => {
                if (r) {
                    hasil.origin = r;
                    cb(null, hasil);
                } else {
                    cb('Kota origin dengan kode ' + data.origin + ', tidak terdaftar');
                }
            }, (e) => {
                cb(e)
            })
        },
        cariTujuan = (hasil, cb) => {
            models['Destination'].findOne({
                where: {
                    dest_id: data.destination
                },
                raw:true
            }).then((r) => {
                if (r) {
                    hasil.destination = r
                    cb(null, hasil);
                } else {
                    cb('Kota tujuan dengan kode ' + data.origin + ', tidak terdaftar');
                }
            }, (e) => {
                cb(e)
            })
        },
        cariHarga = (hasil, cb) => {

            models['Contact_price'].findAll({
                where: {
                    partner_id: data.partner_id,
                    service_id:data.service_id,
                    uom_id:data.uom_id,
                    moda_id:data.moda_id,
                    origin:data.origin,
                    destination:data.destination,

                },
                raw:true
            }).then((result) => {
                if (result && result.length == 0) {
                    cb('Harga tidak ada');
                } else {
                    hasil.dataHarga = result;
                    cb(null, hasil);
                }
            }, (e) => {
                cb(e)
            })

            // s.query(`SELECT * From Contact_price where 
            //             partner_id=? and service_id=? and uom_id=? and moda_id=? and origin =? and destination=? 
            //         `, {
            //     replacements: [data.partner_id,data.service_id, data.uom_id, data.moda_id, data.origin, data.destination],
            //     type: s.QueryTypes.SELECT
            // }).then(function(result) {

            //     console.log('result',result);
            //     if (result && result.length == 0) {
            //         cb('Harga tidak ada');
            //     } else {
            //         hasil.dataHarga = result;
            //         cb(null, hasil);
            //     }
            // }).catch(function(err) {
            //     cb(err)
            // });
        },
        kalkulasiHarga = (hasil, cb) => {
            console.log('--->>>>', hasil);

            let dataHarga={};
            if (hasil.dataHarga && hasil.dataHarga.length==0){
                cb('Harga tidak tersedia');
            }else{
                 dataHarga = hasil.dataHarga[0];
            }

            try {
                console.log('--<<<<<<<<',totalWeight)
                hasil.dataHarga.map(function(v) {
                    let range = (v.price_to - v.price_from) + 1;
                    hargaSatuan = v.price_1;
                    if (totalWeight > 0) {
                        leadTime = v.lead_time_from + ' - ' + v.lead_time_to;
                        lt = v.lead_time_to;
                        if (totalWeight > range || v.type_price.toUpperCase() == 'FIXED') {
                            ttl += (range * v.price_1);
                            min = range;
                            hargaMin = ttl;
                        } else {
                            ttl += (totalWeight * v.price_1);
                            hargaSatuan = v.price_1;
                        }
                        totalWeight -= range;
                    }
                });

             
                console.log('--<<<<<<<<',ttl)

               
                // }
               let result = {
                    origin: hasil.origin,
                    destination: hasil.destination,
                    weight: berat,
                    leadtime: lt,
                    min: min,
                    min_price: hargaMin,
                    price: hargaSatuan,
                    totalCharge: ttl,
                  
                };
                cb(null, result)
            } catch (err) {
                cb(err);

            }

        }
    ], (e, s) => {
        console.log(e);
        if (e) {
            return callback(e);
        } else {

            return callback(null, s);
        }
    })
}
module.exports={
    hitungPublishPrice,
    hitungContactPrice
}
