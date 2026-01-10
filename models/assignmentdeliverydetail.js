"use strict"
module.exports = function (sequelize, DataTypes) {
    const Assignment_delivery_detail = sequelize.define("Assignment_delivery_detail", {
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
        pic1: {
            type: DataTypes.TEXT
        },
        pic2: {
            type: DataTypes.TEXT
        },
        pic3: {
            type: DataTypes.TEXT
        },
        pic4: {
            type: DataTypes.TEXT
        },
        pic5: {
            type: DataTypes.TEXT
        },
        pic6: {
            type: DataTypes.TEXT
        },
        sign: {
            type: DataTypes.TEXT
        },
        is_success: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_undel: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
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
        is_incoming_wh: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        incoming_date: {
            type: DataTypes.DATE
        },
        incoming_by: {
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
        tableName: 'Assignment_delivery_detail',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Assignment_delivery_detail);
    Assignment_delivery_detail.associate = function (models) {
        models.Assignment_delivery_detail.belongsTo(models.Assignment_delivery, {
            as: 'assignment_delivery',
            foreignKey: 'delivery_id',
            targetKey: 'delivery_id'
        })

        models.Assignment_delivery_detail.belongsTo(models.Shipment, {
            as: 'shipment_detail',
            foreignKey: 'shipment_awb',
            targetKey: 'shipment_awb'
        })
        // models.Assignment_delivery_detail.belongsTo(models.Company, {
        //     as: 'company',
        //     foreignKey: 'agen_id',
        //     targetKey: 'company_id'
        // })
    }
    return Assignment_delivery_detail;
}