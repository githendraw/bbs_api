"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Contact_trip_detail = sequelize.define("Contact_trip_detail", {
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
        pos_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        
        lat_pos: {
            type: DataTypes.STRING,
        },
        long_pos: {
            type: DataTypes.STRING,
        },
        acuracy: {
            type: DataTypes.DOUBLE,
        },
        speed: {
            type: DataTypes.FLOAT,
        },


        
    }, {
        tableName: 'Contact_trip_detail',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Contact_trip_detail);
    Contact_trip_detail.associate = function (models) {
        
   


    }


    Contact_trip_detail.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Contact_trip_detail;
}