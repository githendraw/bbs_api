"use strict"
module.exports = function(sequelize, DataTypes) {
    const Invoice_payment = sequelize.define("Invoice_payment", {
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
        payment_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        payment_no: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        payment_reff: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue:'-'
        },
        payment_date: {
            type: DataTypes.DATE,
            allowNull: false,

        },
        account_code: {
            type: DataTypes.STRING(50),
        },
        account_name: {
            type: DataTypes.STRING,
        },
        
        
        contact_id:{
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        contact_name:{
            type: DataTypes.STRING,
            allowNull: false,
        },
      
        description:{
            type: DataTypes.STRING
        },
        amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        payment: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        balance: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        paid: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        paid_other: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        balance_after: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        
        paid_total:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        
        paid_total_text:{
            type: DataTypes.TEXT
        },
        
       
        is_confirm: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        usrupd:{
            type: DataTypes.STRING
        }
    }, {
        tableName: 'Invoice_payment',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Invoice_payment);
    Invoice_payment.associate = function (models) {
        models.Invoice_payment.hasMany(models.Invoice_payment_detail,{
            as :'invoice_payment_detail',
            foreignKey:'payment_id',
            targetKey:'payment_id',
            sourceKey:'payment_id'
        })
      

      
    }
    return Invoice_payment;
}
