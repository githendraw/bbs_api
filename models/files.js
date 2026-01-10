
"use strict"
module.exports = function(sequelize, DataTypes) {
    const File_uploads = sequelize.define("File_uploads", {
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
        
        reff_no: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        reff_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reff_date: {
            type: DataTypes.DATE,
            allowNull: false,
        
        },
        file_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        file_path: {
            type: DataTypes.STRING,
            allowNull: false
        }
        
    }, {
        tableName: 'File_uploads',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(File_uploads);
    File_uploads.associate = function (models) {
        // models.Invoice_payment.hasMany(models.Invoice_payment_detail,{
        //     as :'invoice_payment_detail',
        //     foreignKey:'payment_id',
        //     targetKey:'payment_id',
        //     sourceKey:'payment_id'
        // })
      

      
    }
    return File_uploads;
}
