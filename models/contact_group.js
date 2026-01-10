"use strict"
module.exports = function (sequelize, DataTypes) {
    const Contact_group = sequelize.define("Contact_group", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        contact_group_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        contact_reff: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        contact_type: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        address1: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        address2: {
            type: DataTypes.TEXT,
        },
       
        phone1: {
            type: DataTypes.STRING
        },
        phone2: {
            type: DataTypes.STRING
        },
        fax: {
            type: DataTypes.STRING
        },
        website: {
            type: DataTypes.STRING
        },
        tracing_service: {
            type: DataTypes.STRING
        },
        contact_pickup_name: {
            type: DataTypes.STRING(100)
        },
        contact_pickup_pic: {
            type: DataTypes.STRING(100)
        },
        contact_pickup_address: {
            type: DataTypes.TEXT
        },
        contact_pickup_phone: {
            type: DataTypes.STRING(100)
        },
        contact_bill_name: {
            type: DataTypes.STRING(100)
        },
        contact_bill_address: {
            type: DataTypes.TEXT
        },
        contact_bill_npwp: {
            type: DataTypes.STRING
        },
        contact_bill_pic: {
            type: DataTypes.STRING
        },
        contact_bill_ppn: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        reff_contact_id: {
            type: DataTypes.STRING(20)
        },
        reff_contact_name: {
            type: DataTypes.STRING(100)
        },
      
        pic_profile:{
            type:DataTypes.STRING
        }
    }, {
        tableName: 'Contact_group',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Contact_group);
   
    Contact_group.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Contact_group;
}