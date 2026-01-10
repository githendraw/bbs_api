"use strict"
module.exports = function(sequelize, DataTypes) {
    const Joborder = sequelize.define("Joborder", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        job_id:{
            type: DataTypes.STRING(50),
            allowNull: false,
            unique:true
        },
        job_no:{
            type: DataTypes.STRING(50),
            allowNull: false
        },
        company_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        company_group_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
       
        job_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        job_date:{
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_cash: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        partner_id: {
            type: DataTypes.STRING(50)
        },
        partner_name: {
            type: DataTypes.STRING
        },
        partner_email: {
            type: DataTypes.STRING
        },
        partner_pic: {
            type: DataTypes.STRING
        },
        partner_address1: {
            type: DataTypes.STRING
        },
        partner_address2: {
            type: DataTypes.STRING
        },
        partner_state: {
            type: DataTypes.STRING
        },
        partner_city: {
            type: DataTypes.STRING
        },
        partner_country: {
            type: DataTypes.STRING
        },
        partner_phone1: {
            type: DataTypes.STRING
        },
        partner_phone2: {
            type: DataTypes.STRING
        },
        is_invoice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_confirm_invoice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_printinvoice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_tax: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        charge: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        insurance: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        insurance_percent: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        insurance_value: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        others_charge: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        handling: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        packing_charge: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        sub_total: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        discount: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        discount_amount: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_discount_amount: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_expense: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_estimate_expense: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        
        usr_upd: {
            type: DataTypes.STRING
        },
        usrupd: {
            type: DataTypes.STRING
        },
    }, {
        tableName: 'Joborder',  
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Joborder);
    Joborder.associate = function (models) {
    //    models.Joborder.hasMany(models.Shipment,{
    //        as :'detail',
    //        foreignKey:'job_id',
    //        targetKey:'job_id',
    //        sourceKey:'job_id'
    //    })
    }
    Joborder.afterCreate=(models,options)=>{
        console.log('after create',models);
    }
    return Joborder;
}
