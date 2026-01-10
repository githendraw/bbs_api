"use strict"
module.exports = function(sequelize, DataTypes) {
    const Shipment_detail = sequelize.define("Shipment_detail", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        shipment_awb: {
            type: DataTypes.STRING(50),
            
              allowNull:false
        },
        qty: {
            type: DataTypes.FLOAT,
            defaultValue:1
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        vol: {
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        c_weight: {
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        item_p: {
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        item_l: {
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        item_t: {
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        charge_packing: {
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        charge_handling: {
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        
        is_packing: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        description: {
            type: DataTypes.STRING
        },
        usr_upd: {
            type: DataTypes.STRING
        },
        usrupd: {
            type: DataTypes.STRING
        },
    }, {
        tableName: 'Shipment_detail',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    Shipment_detail.associate = function(models) {
        models.Shipment_detail.belongsTo(models.Shipment, {
            as: 'shipment',
            foreignKey: 'shipment_awb',
            targetKey: 'shipment_awb'
        })


        models.Shipment_detail.belongsTo(models.Shipment_pickup, {
            as: 'shipment_pickup',
            foreignKey: 'shipment_awb',
            targetKey: 'shipment_awb'
        })

     
    }
    return Shipment_detail;
}