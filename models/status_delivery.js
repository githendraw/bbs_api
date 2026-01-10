"use strict"
module.exports = function (sequelize, DataTypes) {
    const Status_delivery = sequelize.define("Status_delivery", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        status_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        status_delivery_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },

       
        status_dename: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        back_color:{
            type: DataTypes.STRING(50),
            defaultValue:"bg-blue"

        },
        icon:{
            type: DataTypes.STRING,
            defaultValue:"fa-envelope"

        }
        
    }, {
        tableName: 'Status_delivery',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    Status_delivery.associate = function (models) {
         
    }
    return Status_delivery;
}


// 1	01	PENDING	bg-blue	fa-envelope	2021-04-06 11:04:02	2021-04-06 11:04:06
// 2	02	ACCEPT	bg-blue	fa-envelope	2021-04-06 11:04:49	2021-04-06 11:04:51
// 3	03	APPROVE	bg-blue	fa-envelope	2021-04-06 11:05:02	2021-04-06 11:05:04
// 4	04	ON PROGRESS	bg-blue	fa-envelope	2021-04-06 11:05:29	2021-04-06 11:05:31
// 5	05	FINISH	bg-blue	fa-envelope	2021-04-06 11:05:43	2021-04-06 11:05:45