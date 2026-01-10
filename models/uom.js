"use strict"
module.exports = function (sequelize, DataTypes) {
    const Uom = sequelize.define("Uom", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        uom_id: {
            type: DataTypes.STRING(10),
            allowNull: false,
            primaryKey: true
        },
        uom_desc: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        tableName: 'Uom',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true

    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Uom);
    Uom.associate = function (models) {    
        models.Uom.hasMany(models.Publish_price, {
            as: 'publish',
            foreignKey:'uom_id',
            targetKey:'uom_id',
            sourceKey:'uom_id'})
            models.Uom.hasMany(models.Shipment, {
                as: 'shipment',
                foreignKey:'uom_id',
                targetKey:'uom_id',
                sourceKey:'uom_id'})

    }

    return Uom;
}