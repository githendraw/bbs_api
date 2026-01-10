"use strict"
module.exports = function (sequelize, DataTypes) {
    const Numbering = sequelize.define("Numbering", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        kode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        desc: {
            type: DataTypes.STRING,
            allowNull: true
        },

        company_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        numbering: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'Numbering',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true

    });
    return Numbering;
}