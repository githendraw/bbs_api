"use strict"
module.exports = function (sequelize, DataTypes) {
    const Stt_return_customer_detail = sequelize.define("Stt_return_customer_detail", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        stt_return_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
         
        shipment_awb: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        receive_date: {
            type: DataTypes.DATE
        },
        receive_time: {
            type: DataTypes.DATE
        },
        receive_by: {
            type: DataTypes.STRING
        },
        status_id: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
          
        
        is_confirm: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        confirm_date: {
            type: DataTypes.DATE
        },
        confirm_by: {
            type: DataTypes.STRING
        },
         
        usrupd: {
            type: DataTypes.STRING
        },
        lat: {
            type: DataTypes.STRING
        },
        lng: {
            type: DataTypes.STRING
        },
    }, {
        tableName: 'Stt_return_customer_detail',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Stt_return_customer_detail);
    Stt_return_customer_detail.associate = function (models) {
        models.Stt_return_customer_detail.belongsTo(models.Stt_return_customer, {
            as: 'stt_return_customer',
            foreignKey: 'stt_return_id',
            targetKey: 'stt_return_id'
        })
        models.Stt_return_customer_detail.belongsTo(models.Shipment, {
            as: 'shipment_detail',
            foreignKey: 'shipment_awb',
            targetKey: 'shipment_awb'
        })

        
         
    }
    return Stt_return_customer_detail;
}