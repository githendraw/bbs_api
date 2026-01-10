"use strict"
module.exports = function(sequelize, DataTypes) {
    const Invoice_wh = sequelize.define("Invoice_wh", {
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
        price_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        handling_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        admin_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        disc_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        sub_total:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        tax_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_tax_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
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

        paid_date: {
            type: DataTypes.DATE
        },
        payment_id:{
            type: DataTypes.STRING
        },
        payment_info:{
            type:DataTypes.TEXT
        },
        description: {
            type: DataTypes.STRING
        },
        detail: {
            type: DataTypes.TEXT
        },
        usrupd:{
            type: DataTypes.STRING
        }
    }, {
        tableName: 'Invoice_wh',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Invoice_wh);
    Invoice_wh.associate = function (models) {
        // models.Invoice.hasMany(models.Invoice_detail,{
        //     as :'invoice_detail',
        //     foreignKey:'invoice_id',
        //     targetKey:'invoice_id',
        //     sourceKey:'invoice_id'
        // })

        // models.Invoice.hasMany(models.Invoice_payment_detail,{
        //     as :'payment',
        //     foreignKey:'invoice_id',
        //     targetKey:'invoice_id',
        //     sourceKey:'invoice_id'
        // })
        Invoice_wh.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };




    }
    return Invoice_wh;
}
