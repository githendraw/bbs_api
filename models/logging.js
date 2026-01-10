"use strict"
module.exports = function (sequelize, DataTypes) {
    const Logging = sequelize.define("Logging", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.STRING(50),
        },
        email:{
            type: DataTypes.STRING,
        },
        role:{
            type:DataTypes.STRING(20)
        },
        note : {
            type:DataTypes.STRING
        },
        module:{
            type:DataTypes.STRING
        },
        description:{
            type:DataTypes.TEXT
        }
    }, {
        tableName: 'Logging',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Logging);
    Logging.associate = function (models) {
    }
    Logging.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Logging;
}