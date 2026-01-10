"use strict"
module.exports = function(sequelize, DataTypes) {
    const Hub = sequelize.define("Hub", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        hub_id:{
            type:DataTypes.STRING(50),
            allowNull:false,
            unique:true
        },
        province_id: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        hub_name:{
            type: DataTypes.STRING,
            allowNull:false
        },
        geo_id:{
            type: DataTypes.STRING
        },
        geo_name:{
            type:DataTypes.STRING
        },
        place:{
          type:DataTypes.STRING
        },
        lat:{
          type:DataTypes.STRING
        },
        long:{
          type:DataTypes.STRING
        },
    }, {
        tableName: 'Hub',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Hub);
    Hub.associate = function (models) {
       
        models.Hub.belongsTo(models.Province,{
            as :'province',
            foreignKey:'province_id',
            targetKey:'province_id'
        });
        

        models.Hub.hasMany(models.Destination, {
            as: 'destination',
            foreignKey:'hub_id',
            targetKey:'hub_id',
            sourceKey:'hub_id'})
    }
    return Hub;
}
