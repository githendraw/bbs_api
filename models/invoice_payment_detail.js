"use strict"
module.exports = function(sequelize, DataTypes) {
    const Invoice_payment_detail = sequelize.define("Invoice_payment_detail", {
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
            allowNull: false
        },
        
        invoice_id: {
            type: DataTypes.STRING(50),
            allowNull: false
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
        
        description:{
            type: DataTypes.STRING
        },
        
        is_delete:{
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
    }, {
        tableName: 'Invoice_payment_detail',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Invoice_payment_detail);
    Invoice_payment_detail.associate = function (models) {
       
        models.Invoice_payment_detail.belongsTo(models.Invoice_payment, {
            as: 'invoice_payment',
            foreignKey: 'payment_id',
            targetKey: 'payment_id'
        })

        models.Invoice_payment_detail.belongsTo(models.Invoice, {
            as: 'invoice_detail',
            foreignKey: 'invoice_id',
            targetKey: 'invoice_id'
        })

        // models.Invoice_detail.belongsTo(models.Shipment,{
        //     as :'shipment_detail',
        //     foreignKey:'shipment_awb',
        //     targetKey:'shipment_awb',
        //     sourceKey:'shipment_awb'
        // })



      
    }
    return Invoice_payment_detail;
}
