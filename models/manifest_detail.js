"use strict"
module.exports = function(sequelize, DataTypes) {
    const Manifest_detail = sequelize.define("Manifest_detail", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_id:{
            type: DataTypes.STRING,
            allowNull:false
           
        },
        manifest_id:{
            type: DataTypes.STRING,
            allowNull:false
        },
        bag_id:{
            type:DataTypes.STRING
        },
        shipment_awb:{
             type: DataTypes.STRING
        },
        usrupd:{
            type: DataTypes.STRING
        },
        qty: {
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        qty_bagging: {
            type: DataTypes.FLOAT,
            defaultValue:0
        },
    }, {
        tableName: 'Manifest_detail',  
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Manifest_detail);
    Manifest_detail.associate = function (models) {

        models.Manifest_detail.belongsTo(models.Manifest_header, {
            as: 'header_manifest',
            foreignKey: 'manifest_id',
            targetKey: 'manifest_id',
            sourceKey: 'manifest_id'
        })

       models.Manifest_detail.belongsTo(models.Shipment,{
           as :'shipment_detail',
           foreignKey:'shipment_awb',
           targetKey:'shipment_awb',
           sourceKey:'shipment_awb'
       })
    }
    
    return Manifest_detail;
}
