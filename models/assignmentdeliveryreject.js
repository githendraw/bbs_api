"use strict"
module.exports = function (sequelize, DataTypes) {
    const Assignment_delivery_reject = sequelize.define("Assignment_delivery_reject", {
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
        delivery_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
         
        shipment_awb: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        
        description: {
            type: DataTypes.STRING
        },
        reject_by: {
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
        
    }, {
        tableName: 'Assignment_delivery_reject',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Assignment_delivery_reject);
    Assignment_delivery_reject.associate = function (models) {
        
    }
    return Assignment_delivery_reject;
}