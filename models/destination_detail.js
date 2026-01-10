"use strict"
module.exports = function(sequelize, DataTypes) {
    const Destination_detail = sequelize.define("Destination_detail", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        dest_detail_id:{
            type:DataTypes.STRING(50),
            allowNull:false,
            unique:true  
        },
        post_code:{
            type:DataTypes.STRING(10),
            allowNull:false  
        },
        dest_id:{
            type:DataTypes.STRING(50),
            allowNull:false
        },
        dest_detail_name:{
            type: DataTypes.STRING,
            allowNull:false
        },
        
        country_name:{
            type: DataTypes.STRING,
            allowNull:true
        },
        province_name:{
            type: DataTypes.STRING,
            allowNull:true
        },
        hub_name:{
            type: DataTypes.STRING,
            allowNull:true
        },
        dest_name:{
            type: DataTypes.STRING,
            allowNull:true
        },
        

    }, {
        tableName: 'Destination_detail',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Destination_detail);
    Destination_detail.associate=function(models){
        models.Destination_detail.belongsTo(models.Destination,{
            as :'destination',
            foreignKey:'dest_id',
            targetKey:'dest_id'
        });

       

         
    }
    return Destination_detail;
}
