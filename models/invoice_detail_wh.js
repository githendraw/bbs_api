"use strict"
module.exports = function(sequelize, DataTypes) {
    const Invoice_detail_wh = sequelize.define("Invoice_detail_wh", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.STRING(10),
            allowNull: false

        },
        invoice_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        smu_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        is_delete:{
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
    }, {
        tableName: 'Invoice_detail_wh',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Invoice_detail_wh);
    Invoice_detail_wh.associate = function (models) {
       
        models.Invoice_detail_wh.belongsTo(models.Invoice, {
            as: 'invoice',
            foreignKey: 'invoice_id',
            targetKey: 'invoice_id'
        })

        models.Invoice_detail_wh.belongsTo(models.Smu,{
            as :'smu_detail',
            foreignKey:'smu_id',
            targetKey:'smu_id',
            sourceKey:'smu_id'
        })
       




      
    }
    return Invoice_detail_wh;
}
