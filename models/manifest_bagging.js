"use strict"
module.exports = function(sequelize, DataTypes) {
    const Manifest_bagging = sequelize.define("Manifest_bagging", {
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
        bag_id:{
            type: DataTypes.STRING,
            allowNull:false,
            unique: true
        },
        bag_number:{
            type: DataTypes.FLOAT
        },
        manifest_id:{
            type: DataTypes.STRING,
            allowNull:false
        },
        description:{
            type: DataTypes.STRING
        },       
        qty: {
            type: DataTypes.FLOAT,
            default:0
        },
        weight: {
            type: DataTypes.FLOAT,
            default:0
        },
        uom: {
            type: DataTypes.STRING(10)
        },
        is_print:{
             type: DataTypes.BOOLEAN,
             defaultValue:false
        },

        is_confirm:{
               type: DataTypes.BOOLEAN,
               defaultValue:false
        },
        date_confirm:{
              type: DataTypes.DATE,
        },
        is_arrival:{
               type: DataTypes.BOOLEAN,
               defaultValue:false
        },
        is_manual:{
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        date_arrival:{
              type: DataTypes.DATE,
        },
        usrupd:{
            type: DataTypes.STRING
        }
    }, {
        tableName: 'Manifest_bagging',  
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Manifest_bagging);
    Manifest_bagging.associate = function (models) {
    //    models.Joborder.hasMany(models.Shipment,{
    //        as :'detail',
    //        foreignKey:'job_id',
    //        targetKey:'job_id',
    //        sourceKey:'job_id'
    //    })
    }
    
    return Manifest_bagging;
}
