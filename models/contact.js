"use strict"
module.exports = function (sequelize, DataTypes) {
    const Contact = sequelize.define("Contact", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        contact_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },

        
        contact_reff: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        company_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        city_code: {
            type: DataTypes.STRING(15)
        },
        city_name: {
            type: DataTypes.STRING(100)
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
        email: {
            type: DataTypes.STRING
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
        is_cash:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        },
        pic_profile:{
            type:DataTypes.STRING
        },
        contact_group_id: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },

    }, {
        tableName: 'Contact',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Contact);
    Contact.associate = function (models) {
    models.Contact.hasMany(models.Shipment,{
        as :'shipment',
        foreignKey:'partner_id',
        targetKey:'partner_id',
        sourceKey:'contact_id'
    })
    models.Contact.hasMany(models.Contact_price,{
        as :'contact_price',
        foreignKey:'partner_id',
        targetKey:'partner_id',
        sourceKey:'contact_id'
    })
    models.Contact.hasMany(models.Contact_vendor_price,{
        as :'contact_vendor_price',
        foreignKey:'partner_id',
        targetKey:'partner_id',
        sourceKey:'contact_id'
    })
    models.Contact.hasMany(models.Shipment_pickup,{
        as :'shipment_pickup',
        foreignKey:'partner_id',
        targetKey:'partner_id',
        sourceKey:'contact_id'
    })
    models.Contact.hasMany(models.Assignment_manifest,{
        as :'assignment_manifest',
        foreignKey:'contact_id',
        targetKey:'contact_id',
        sourceKey:'contact_id'
    })
    models.Contact.hasMany(models.Contact_sub,{
        as :'sub_contact',
        foreignKey:'contact_id',
        targetKey:'cantact_id',
        sourceKey:'contact_id'
    })
    models.Contact.hasMany(models.Assignment_delivery,{
        as :'contact',
        foreignKey:'contact_id',
        targetKey:'contact_id',
        sourceKey:'contact_id'
    })
    }
    Contact.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Contact;
}