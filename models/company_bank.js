"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Company_bank = sequelize.define("Company_bank", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        bank_id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique:true
        },
        company_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        note:{
            type: DataTypes.STRING
        },
          
        no_rek1:{
            type: DataTypes.STRING
        },
        bank_1:{
            type: DataTypes.STRING
        },
        bank_br_1:{
            type: DataTypes.STRING
        },
        usrupd: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isPrint: {
            type: DataTypes.BOOLEAN,
            default: true
        }
    }, {
        tableName: 'Company_bank',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Company_bank);
    Company_bank.associate = function (models) {
       

       
 

    }
    Company_bank.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Company_bank;
}