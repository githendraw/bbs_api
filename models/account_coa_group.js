"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Coa_group = sequelize.define("Coa_group", {
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
        parent_id:{
            type: DataTypes.STRING
        },


       
       
        affect_gross:{
            type:DataTypes.INTEGER,
            defaultValue:0
        },
        usrUpd: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'Coa_group',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Coa_group);
    Coa_group.associate = function (models) {
       
        models.Coa_group.hasMany(models.Coa,{
            as:'coa',
            foreignKey: 'group_code',
            targetKey: 'group_code',
            sourceKey: 'group_code'
        })
       
 

    }
    Coa_group.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Coa_group;
}