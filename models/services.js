"use strict"
module.exports = function (sequelize, DataTypes) {
    const Services = sequelize.define("Services", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        service_id: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        service_desc: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        price_model: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue:'STANDARD'
        },
        moda_id:{
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue:"A"
        }
    }, {
        tableName: 'Services',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Services);
    Services.associate = function (models) {
        models.Services.hasMany(models.Publish_price, {
            as: 'publish',
            foreignKey:'service_id',
            targetKey:'service_id',
            sourceKey:'service_id'})
            models.Services.hasMany(models.Shipment, {
                as: 'shipment',
                foreignKey:'service_id',
                targetKey:'service_id',
                sourceKey:'service_id'})
    }
    return Services;
}