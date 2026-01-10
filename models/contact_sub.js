"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Contact_sub = sequelize.define("Contact_sub", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        contact_sub_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },

        contact_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
          
        },
        contact_reff: {
            type: DataTypes.STRING(50),
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
    }, {
        tableName: 'Contact_sub',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Contact_sub);
    Contact_sub.associate = function (models) {
        models.Contact_sub.belongsTo(models.Contact, {
            as: 'sub_contact',
            foreignKey: 'contact_id',
            targetKey: 'contact_id',
            sourceKey: 'contact_id'
        })
    };

    Contact_sub.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Contact_sub;
}