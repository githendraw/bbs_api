"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Company_price = sequelize.define("Company_price", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
         price_id: {
            type: DataTypes.STRING(255)
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
        tableName: 'Company_price',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Company_price);
    Company_price.associate = function (models) {
        models.Company_price.belongsTo(models.Company, {
            as: 'company',
            foreignKey: 'company_id',
            targetKey: 'company_id',
            sourceKey: 'company_id'
        })

    }
    Company_price.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Company_price;
}