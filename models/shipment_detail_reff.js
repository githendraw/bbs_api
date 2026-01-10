"use strict"
module.exports = function(sequelize, DataTypes) {
    const Shipment_detail_reff = sequelize.define("Shipment_detail_reff", {
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
       
        reff_no: {
            type: DataTypes.STRING
         
        },

        description: {
            type: DataTypes.STRING
        },
        qty_1:{
            type: DataTypes.INTEGER,
            defaultValue:0
        },
        qty_2:{
            type: DataTypes.INTEGER,
            defaultValue:0
        },
        usr_upd: {
            type: DataTypes.STRING
        },
        usrupd: {
            type: DataTypes.STRING
        },
        last_status: {
            type: DataTypes.STRING
        },
        sync_date: {
            type: DataTypes.DATE
        },
    }, {
        tableName: 'Shipment_detail_reff',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Shipment_detail_reff);
    
    Shipment_detail_reff.associate = function(models) {
        models.Shipment_detail_reff.belongsTo(models.Shipment, {
            as: 'shipment',
            foreignKey: 'shipment_awb',
            targetKey: 'shipment_awb'
        })
        models.Shipment_detail_reff.belongsTo(models.Shipment_pickup, {
            as: 'shipment_pickup',
            foreignKey: 'shipment_awb',
            targetKey: 'shipment_awb'
        })

        // models.Shipment_detail.belongsTo(models.Shipment_pickup, {
        //     as: 'shipment_pickup',
        //     foreignKey: 'shipment_awb',
        //     targetKey: 'shipment_awb'
        // })

     
    }
    return Shipment_detail_reff;
}
