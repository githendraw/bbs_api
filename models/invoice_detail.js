"use strict"
module.exports = function(sequelize, DataTypes) {
    const Invoice_detail = sequelize.define("Invoice_detail", {
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
            allowNull: false
        },
        shipment_awb: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        is_delete:{
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
    }, {
        tableName: 'Invoice_detail',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Invoice_detail);
    Invoice_detail.associate = function (models) {
       
        models.Invoice_detail.belongsTo(models.Invoice, {
            as: 'invoice',
            foreignKey: 'invoice_id',
            targetKey: 'invoice_id'
        })

        models.Invoice_detail.belongsTo(models.Shipment,{
            as :'shipment_detail',
            foreignKey:'shipment_awb',
            targetKey:'shipment_awb',
            sourceKey:'shipment_awb'
        })
       




      
    }
    return Invoice_detail;
}
