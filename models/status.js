"use strict"
module.exports = function (sequelize, DataTypes) {
    const Status = sequelize.define("Status", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        status_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        status_type: {
            type: DataTypes.STRING(20)
        },
        status_code: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
     
        status_name: {
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

        },
        status_urut: {
            type: DataTypes.INTEGER,
            defaultValue:0
        },
     
        
    }, {
        tableName: 'Status',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    Status.associate = function (models) {
        models.Status.hasMany(models.History,{
            as :'history_detail',
            foreignKey:'status_id',
            targetKey:'status_id',
            sourceKey:'status_id'
        })

        models.Status.hasMany(models.Shipment,{
            as :'shipment',
            foreignKey:'last_status',
            targetKey:'last_status',
            sourceKey:'status_id'
        })

        models.Status.hasMany(models.Shipment_pickup,{
            as :'shipment_pickup',
            foreignKey:'last_status',
            targetKey:'last_status',
            sourceKey:'status_id'
        })
        
    }
    return Status;
}

// 15	01	PICKUP	PICK UP	PICK UP	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 16	02	ARRIVED	ARRIVED AT ORIGIN OFFICE	ARRIVED AT ORIGIN OFFICE	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 17	03	MANIFEST	ORIGIN MANIFEST	ORIGIN MANIFEST	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 18	04	MANIFEST	ORIGIN MANIFEST HANDOVER	ORIGIN MANIFEST HANDOVER	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 19	05A	MANIFEST	DEPARTED ORIGIN AIRPORT	DEPARTED ORIGIN AIRPORT	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 20	05B	MANIFEST	DEPARTED ORIGIN - I	DEPARTED ORIGIN - I	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 21	05C	MANIFEST	DEPARTED ORIGIN - V	DEPARTED ORIGIN - V	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 22	05D	MANIFEST	DEPARTED ORIGIN - T	DEPARTED ORIGIN - T	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 23	05E	MANIFEST	DEPARTED ORIGIN - S	DEPARTED ORIGIN - S	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 24	05F	MANIFEST	DEPARTED TRANSIT AIRPORT	DEPARTED TRANSIT AIRPORT	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 25	07	MANIFEST	ARRIVED AT BRANCH	ARRIVED AT BRANCH	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 26	08	MANIFEST	TRANSIT MANIFEST	TRANSIT MANIFEST	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 27	09	DELIVERY	DELIVERY	DELIVERY	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 28	10	RECEIVED	SHIPMENT RECEIVED AND SIGN	SHIPMENT RECEIVED AND SIGN	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 29	11	RETURN 	POD COPY RETURN TO ORIGIN	POD COPY RETURN TO ORIGIN	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 30	12	RECEIVED	UNDELIVERY SHIPMENT(FAILED)	UNDELIVERY SHIPMENT(FAILED)	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
// 31	17	RETURN 	HAND OVER POD TO CUSTOMER	HAND OVER POD TO CUSTOMER	bg-blue	fa-envelope	2021-03-29 02:18:11	2021-03-29 02:18:15
