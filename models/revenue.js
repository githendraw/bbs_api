"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Revenue = sequelize.define("Revenue", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }, 
        b_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique:true
        },
        b_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        b_type: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        vat: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            default:0
        },
        
        account_code: {
            type: DataTypes.STRING(100)
        },
        account_name: {
            type: DataTypes.STRING(100)
        },
        
        usrUpd: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'revenue',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Revenue);
    Revenue.associate = function (models) {

    }
    Revenue.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Revenue;
}