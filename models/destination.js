"use strict"
module.exports = function(sequelize, DataTypes) {
    const Destination = sequelize.define("Destination", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        dest_id:{
            type:DataTypes.STRING(10),
            allowNull:false,
            unique:true  
        },
        hub_id:{
            type:DataTypes.STRING(50),
            allowNull:false ,
            references: {
                model: 'Hub',
                key: 'hub_id'
              }
            
        },
        city:{
            type: DataTypes.STRING,
            defaultValue:"-"
        },
        sub_disctrict:{
            type: DataTypes.STRING,
            defaultValue:"-"
        },
        dest_name:{
            type: DataTypes.STRING,
            allowNull:false
        },
        is_origin:{
            type: DataTypes.BOOLEAN ,
            defaultValue : false
        }
    }, {
        tableName: 'Destination',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Destination);
    Destination.associate=function(models){
        models.Destination.belongsTo(models.Hub,{
            as :'hub',
            foreignKey:'hub_id',
            targetKey:'hub_id'
        });

        models.Destination.hasMany(models.Publish_price,{
            as :'origin_detail',
            foreignKey:'origin',
            targetKey:'dest_id'
        });

        models.Destination.hasMany(models.Destination_detail,{
            as :'detail',
            foreignKey:'dest_id',
            targetKey:'dest_id',
            sourceKey:'dest_id'
        });


        models.Destination.hasMany(models.Publish_price,{
            as :'destination_detail',
            foreignKey:'destination',
            targetKey:'dest_id'
        });


        models.Destination.hasMany(models.Shipment,{
            as :'shipment',
            foreignKey:'destination',
            targetKey:'dest_id'
        });
        models.Destination.hasMany(models.Shipment_pickup,{
            as :'shipment_pickup',
            foreignKey:'destination',
            targetKey:'dest_id'
        });
       

        
         
    }
    return Destination;
}
