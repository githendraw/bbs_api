"use strict"
module.exports = function(sequelize, DataTypes) {
    const Manifest_header = sequelize.define("Manifest_header", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.STRING,
            allowNull: false

        },

        manifest_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        bag_id:{
            type: DataTypes.STRING,
            allowNull:false,
            unique: true
        },
        bag_number:{
            type: DataTypes.FLOAT
        },
        moda_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        hub_id: {
            type: DataTypes.STRING,
            allowNull: false

        },
        hub_name: {
            type: DataTypes.STRING,
            allowNull: false

        },
        manifest_date: {
            type: DataTypes.DATE,
            allowNull: false

        },
        description: {
            type: DataTypes.STRING
        },
        ref_no: {
            type: DataTypes.STRING
        },
        ref_id_no: {
            type: DataTypes.STRING
        },
        qty: {
            type: DataTypes.FLOAT,
            default: 0
        },
        weight: {
            type: DataTypes.FLOAT,
            default: 0
        },
        uom: {
            type: DataTypes.STRING(10)
        },

        is_bagging: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        is_print: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        status_id: {
            type: DataTypes.STRING(50)
        },
        is_confirm: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        confirm_date: {
            type: DataTypes.DATE,
        },
        is_confirm_outbound: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        confirm_outbound_date: {
            type: DataTypes.DATE,
        },
        is_arrival: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        is_manual: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        arrival_date: {
            type: DataTypes.DATE,
        },
        usrupd: {
            type: DataTypes.STRING
        },
        contact_id: {
            type: DataTypes.STRING(10),
            allowNull: true
        }
    }, {
        tableName: 'Manifest_header',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    Manifest_header.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Manifest_header);

    Manifest_header.associate = function (models) {
       models.Manifest_header.hasMany(models.Manifest_detail,{
           as :'detail_manifest',
           foreignKey:'manifest_id',
           targetKey:'manifest_id',
           sourceKey:'manifest_id'
       })
       models.Manifest_header.hasMany(models.Assignment_manifest_detail,{
        as :'assignment_detail_manifest',
        foreignKey:'manifest_id',
        targetKey:'manifest_id',
        sourceKey:'manifest_id'
    })

    };


    return Manifest_header;
}
