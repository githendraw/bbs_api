"use strict"
module.exports = function (sequelize, DataTypes) {
   
    const Contact_trip = sequelize.define("Contact_trip", {
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
        tableName: 'Contact_trip',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Contact_trip);
    Contact_trip.associate = function (models) {
        
   


    }


    Contact_trip.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Contact_trip;
}