"use strict"
module.exports = function (sequelize, DataTypes) {
    const Device_token = sequelize.define("Device_token", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
       
        device_token: {
            type: DataTypes.STRING
        },
        device_model:{
            type: DataTypes.STRING
        },
        device_uuid:{
            type: DataTypes.STRING
        },
        device_manufacture:{
            type: DataTypes.STRING
        },
        device_platform:{
            type: DataTypes.STRING
        },
        
    }, {
        tableName: 'Device_token',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true

    });
    
    Device_token.associate = function (models) {
        
       
    }

    return Device_token;
}