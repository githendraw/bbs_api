"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Billing_template = sequelize.define("Billing_template", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }, 
        b_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        b_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        b_type: {
         
            type: DataTypes.STRING(20),
            allowNull: false
        
        },
       b_description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        
         b_isTax:{
            type: DataTypes.BOOLEAN,
            allowNull: false
         },
         b_isActive:{
            type: DataTypes.BOOLEAN,
            allowNull: false
         
         },
        usrUpd: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'Billing_template',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Billing_template);
    Billing_template.associate = function (models) {
       

       
 

    }
    Billing_template.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Billing_template;
}