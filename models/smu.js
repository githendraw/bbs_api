"use strict"
module.exports = function(sequelize, DataTypes) {
    const Smu = sequelize.define("Smu", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        smu_id: {
            type: DataTypes.STRING(50),
            unique:true
        },
        smu_no: {
            type: DataTypes.STRING(50)
        },
        company_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        company_group_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        smu_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        smu_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        partner_id: {
            type: DataTypes.STRING(50),
            references: {
                model: 'Contact',
                key: 'contact_id'
              }
        },
        partner_name: {
            type: DataTypes.STRING
        },
        partner_email: {
            type: DataTypes.STRING
        },
        partner_pic: {
            type: DataTypes.STRING
        },
        partner_address1: {
            type: DataTypes.STRING
        },
        partner_address2: {
            type: DataTypes.STRING
        },
        partner_state: {
            type: DataTypes.STRING
        },
        partner_city: {
            type: DataTypes.STRING
        },
        partner_country: {
            type: DataTypes.STRING
        },
        partner_phone1: {
            type: DataTypes.STRING
        },
        partner_phone2: {
            type: DataTypes.STRING
        },
        receiver_id: {
            type: DataTypes.STRING(50)
        },
        receiver_name: {
            type: DataTypes.STRING
        },
        receiver_pic: {
            type: DataTypes.STRING
        },
        receiver_email: {
            type: DataTypes.STRING
        },
        receiver_address1: {
            type: DataTypes.STRING
        },
        receiver_address2: {
            type: DataTypes.STRING
        },
        receiver_state: {
            type: DataTypes.STRING
        },
        receiver_city: {
            type: DataTypes.STRING
        },
        receiver_country: {
            type: DataTypes.STRING
        },
        receiver_phone1: {
            type: DataTypes.STRING
        },
        receiver_phone2: {
            type: DataTypes.STRING
        },
        komoditi_id: {
            type: DataTypes.STRING(50)
        },
        item_desc: {
            type: DataTypes.STRING(50)
        },
        airline: {
            type: DataTypes.STRING(100)
        },
        airline_name: {
            type: DataTypes.STRING(100)
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        weight_vol: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        min_weight: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        qty: {
            type: DataTypes.FLOAT
        },
        price_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        handling_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        admin_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        disc_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        sub_total:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        tax_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_tax_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_wh:{
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        host_origin: {
            type: DataTypes.STRING(10),
        },
        host_originname: {
            type: DataTypes.STRING
        },
        host_destination: {
            type: DataTypes.STRING(10),
        },
        host_destinationname: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        detail: {
            type: DataTypes.TEXT
        },
        is_invoice:{
            type:DataTypes.BOOLEAN,
            defaultValue: false
        },
        invoice_no: {
            type: DataTypes.STRING
        },
        count_by: {
            type: DataTypes.STRING(100)
        },
        usrupd: {
            type: DataTypes.STRING
        },
        terbilang: {
            type: DataTypes.TEXT
        },
        is_paid:{
            type:DataTypes.BOOLEAN,
            defaultValue: false
        },

    }, {
        tableName: 'Smu',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Smu);
    Smu.associate = function(models) {

    }
    return Smu;
}
