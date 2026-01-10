"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Contact_price = sequelize.define("Contact_price", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
         price_id: {
            type: DataTypes.STRING(255)
        },
        partner_id: {
            type: DataTypes.STRING(50)
        },
        company_id:{
            type:DataTypes.STRING(10),
            allowNull: true
        },

        service_id: {
            type: DataTypes.STRING(20)
        },
        uom_id: {
            type: DataTypes.STRING(20)
        },
        moda_id: {
            type: DataTypes.STRING(10)
        },

        price_from: {
            type: DataTypes.FLOAT
        },
        price_to: {
            type: DataTypes.FLOAT
        },
       
        type_price: {
            type: DataTypes.STRING(10)
        },

        origin: {
            type: DataTypes.STRING(10)
        },
        originname: {
            type: DataTypes.STRING(150)
        },

        destination: {
            type: DataTypes.STRING(10)
        },
        destinationname: {
            type: DataTypes.STRING(150)
        },
        price_1: {
            type: DataTypes.FLOAT
        },
        lead_time_from: {
            type: DataTypes.FLOAT
        },
        lead_time_to: {
            type: DataTypes.FLOAT
        } 
    }, {
        tableName: 'Contact_price',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Contact_price);
    Contact_price.associate = function (models) {
        models.Contact_price.belongsTo(models.Contact, {
            as: 'contact',
            foreignKey: 'partner_id',
            targetKey: 'contact_id',
            sourceKey: 'partner_id'
        })

    }
    Contact_price.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Contact_price;
}