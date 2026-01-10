"use strict"
module.exports = function(sequelize, DataTypes) {
    var Province = sequelize.define("Province", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        province_id:{
            type:DataTypes.STRING(10),
            allowNull:false,
            unique:true  
        },
        country_id:{
            type:DataTypes.STRING(10),
            allowNull:false,
          
        },
        province_name:{
            type: DataTypes.STRING,
            allowNull:false
        },
        longitude:{
            type:DataTypes.DOUBLE
        },
        latitude:{
            type:DataTypes.DOUBLE
        }
    }, {
        tableName: 'Province',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Province);
  
    Province.associate = function (models) {
        models.Province.belongsTo(models.Country, {
            as :'country',
            foreignKey:'country_id',
            targetKey:'country_id'})

        models.Province.hasMany(models.Hub, {
            as: 'hub',
            foreignKey:'province_id',
            targetKey:'province_id',
            sourceKey:'province_id'})
    }
    return Province;
}

