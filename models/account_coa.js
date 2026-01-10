"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Coa = sequelize.define("Coa", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }, 
        company_id:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        group_code:{
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        code:{
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        account_code:{
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        account_name:{
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        notes:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        saldo_awal_d:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        saldo_awal_c:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        saldo_d:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        saldo_c:{
            type: DataTypes.DOUBLE,
            defaultValue:0
        },
        tipe:{
            type: DataTypes.INTEGER,
            defaultValue:0
        },
        is_recon:{
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        

        usrUpd: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'Coa',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Coa);
    Coa.associate = function (models) {
       models.Coa.belongsTo(models.Coa_group,{
           as:'coa_group',
           foreignKey: 'group_code',
           targetKey: 'group_code',
           sourceKey: 'group_code'

       })

       
 

    }
    Coa.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Coa;
}