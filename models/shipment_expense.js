"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Shipment_expense = sequelize.define("Shipment_expense", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }, 
        shipment_awb: {
            type: DataTypes.STRING(50),
            
              allowNull:false
        },
        b_id:{
            type: DataTypes.STRING(10)
        },
        b_name:{
            type: DataTypes.STRING()
        },
        contact_id:{
            type: DataTypes.STRING(10)
        },
        contact_name:{
            type: DataTypes.STRING()
        },
        billing_date:{
            type: DataTypes.DATE,
            allowNull: false
        },
        origin: {
            type: DataTypes.STRING(10)
        },
        originname: {
            type: DataTypes.STRING
        },
        destination: {
            type: DataTypes.STRING(10)
        },
        destinationname: {
            type: DataTypes.STRING
        },
        service_id: {
            type: DataTypes.STRING(20)
        },
        uom_id: {
            type: DataTypes.STRING(10)
        },
        moda_id: {
            type: DataTypes.STRING(10)
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        disc_percent: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        disc_amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        
        total_disc_amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        tax_percent: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        tax_amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        total_amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
 

        description:{
            type: DataTypes.STRING
        },

        
        usrupd: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'Shipment_expense',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Shipment_expense);
    Shipment_expense.associate = function (models) {
       
        // models.Shipment_expense.belongsTo(models.Shipment, {
        //     as: 'shipment',
        //     foreignKey: 'shipment_awb',
        //     targetKey: 'shipment_awb'
        // })
       
 

    }
    Shipment_expense.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Shipment_expense;
}