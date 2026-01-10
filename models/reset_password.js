"use strict"
module.exports = function (sequelize, DataTypes) {
    const Reset_password = sequelize.define("Reset_password", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expire_date: {
            type: DataTypes.DATE
        },
        status:{
            type: DataTypes.BOOLEAN,
            defaultValue:false
        }
    }, {
        tableName: 'Reset_password',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true

    });
   

    return Reset_password;
}