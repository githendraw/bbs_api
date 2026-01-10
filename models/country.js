"use strict"
module.exports = function(sequelize, DataTypes) {
    const Country = sequelize.define("Country", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        country_id:{
            type:DataTypes.STRING(10),
            allowNull:false,
            unique:true  
        },
        country_name:{
            type: DataTypes.STRING,
            allowNull:false
        }
    }, {
        tableName: 'Country',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Country);
    Country.associate = function (models) {
        models.Country.hasMany(models.Province, {
            as: 'country',
            foreignKey:'country_id',
            targetKey:'country_id',
            sourceKey:'country_id'})
       
    }
   
    return Country;
}

