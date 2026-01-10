"use strict"
module.exports = function(sequelize, DataTypes) {
    const Smu_harga = sequelize.define("Smu_harga", {
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
        company_group_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        tipe_sewa:{
            type: DataTypes.STRING(15),
        },
        minimum:{
            type:DataTypes.FLOAT,
            defaultValue:0,
            allowNull:false
        },
        harga_satuan:{
            type:DataTypes.FLOAT,
            defaultValue:0,
            allowNull:false
        },
        ppn:{
            type:DataTypes.FLOAT,
            defaultValue:11,
            allowNull:false
        },

        usrupd: {
            type: DataTypes.STRING
        },

    }, {
        tableName: 'Smu_harga',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });

    return Smu_harga;
}
