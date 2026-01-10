"use strict"
module.exports = function(sequelize, DataTypes) {
    const Invoice = sequelize.define("Invoice", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.STRING(10),
            allowNull: false

        },
        invoice_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        invoice_no: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        invoice_reff: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue:'-'
        },
        invoice_date: {
            type: DataTypes.DATE,
            allowNull: false,

        },
        invoice_term: {
            type: DataTypes.INTEGER,
            defaultValue:0

        },
        invoice_due_date: {
            type: DataTypes.DATE,
            allowNull: false,

        },
        invoice_type:{
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue:'SHIPMENT'
        },

        contact_id:{
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        contact_name:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact_bill_address:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact_bill_npwp:{
            type: DataTypes.STRING
        },

        description:{
            type: DataTypes.STRING
        },
        charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        insurance: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        others_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        pickup_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        tools_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        
        handling: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        packing_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        buruh_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        telly_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        trucking_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        lolo_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        thc_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        do_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        clining_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        ppftz1_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        ppftz2_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        ppftz3_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        
        claim_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        subtotal: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        total:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        discount_percent:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        discount_amount:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        total_discount:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        tax_percent:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        tax_amount:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        others:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        others_desc:{
            type: DataTypes.STRING
        },
        materai_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        amount:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        paid:{
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        balance:{
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        amount_text:{
            type: DataTypes.TEXT
        },
        is_print_invoice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        invoice_cash: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        print_by: {
            type: DataTypes.STRING
        },
        print_date: {
            type: DataTypes.DATE
        },
        is_receive_invoice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        receive_by: {
            type: DataTypes.STRING
        },
        received_date: {
            type: DataTypes.DATE
        },
        is_paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_void:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        tgl_void:{
            type: DataTypes.DATE
        },
        void_by:{
            type: DataTypes.STRING
        },
        paid_date: {
            type: DataTypes.DATE
        },
        payment_id:{
            type: DataTypes.STRING
        },
        payment_info:{
            type:DataTypes.TEXT
        },
        usrupd:{
            type: DataTypes.STRING
        },
        is_reset_number:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        }
    }, {
        tableName: 'Invoice',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Invoice);
    Invoice.associate = function (models) {
        models.Invoice.hasMany(models.Invoice_detail,{
            as :'invoice_detail',
            foreignKey:'invoice_id',
            targetKey:'invoice_id',
            sourceKey:'invoice_id'
        })

        models.Invoice.hasMany(models.Invoice_detail_wh,{
            as :'invoice_detail_wh',
            foreignKey:'invoice_id',
            targetKey:'invoice_id',
            sourceKey:'invoice_id'
        })

        models.Invoice.hasMany(models.Invoice_payment_detail,{
            as :'payment',
            foreignKey:'invoice_id',
            targetKey:'invoice_id',
            sourceKey:'invoice_id'
        })
    Invoice.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };




    }
    return Invoice;
}
