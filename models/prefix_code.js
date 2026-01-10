"use strict"
module.exports = function(sequelize, DataTypes) {
    const Prefix_code = sequelize.define("Prefix_code", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        kode_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            primaryKey: true
        },
         company_id: {
            type: DataTypes.STRING(10),
            allowNull: false,
            primaryKey: true
        },
        kode_prefix:{
          type: DataTypes.STRING(10),
            allowNull: false,
              
        },
        keterangan:{
            type: DataTypes.STRING(100)
        },
        numbering: {
            type: DataTypes.BIGINT,
           
            defaultValue:0
          }
       
        
    }, {
        tableName: 'Prefix_code',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true

    });
    return Prefix_code;
}