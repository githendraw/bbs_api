"use strict"
module.exports = function (sequelize, DataTypes) {
    const Assignment_manifest_detail = sequelize.define("Assignment_manifest_detail", {
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
        assignment_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        manifest_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        receive_date: {
            type: DataTypes.DATE
        },
        receive_time: {
            type: DataTypes.DATE
        },
        receive_by: {
            type: DataTypes.STRING
        },
        status_id: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        pic1: {
            type: DataTypes.TEXT
        },
        pic2: {
            type: DataTypes.TEXT
        },
        pic3: {
            type: DataTypes.TEXT
        },
        pic4: {
            type: DataTypes.TEXT
        },
        pic5: {
            type: DataTypes.TEXT
        },
        pic6: {
            type: DataTypes.TEXT
        },
        sign: {
            type: DataTypes.TEXT
        },
        is_success: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_undel: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_confirm: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        confirm_date: {
            type: DataTypes.DATE
        },
        confirm_by: {
            type: DataTypes.STRING
        },
        is_incoming_wh: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        incoming_date: {
            type: DataTypes.DATE
        },
        incoming_by: {
            type: DataTypes.STRING
        },
        usrupd: {
            type: DataTypes.STRING
        },
        lat: {
            type: DataTypes.STRING
        },
        lng: {
            type: DataTypes.STRING
        },
        hub_id: {
            type: DataTypes.STRING(10),
            references: {
                model: 'Hub',
                key: 'hub_id'
              }
        },
        host_name: {
            type: DataTypes.STRING
        },
        company_branch_id: {
            type: DataTypes.STRING

        },
        company_branch_name:{
            type: DataTypes.STRING
        }
    }, {
        tableName: 'Assignment_manifest_detail',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Assignment_manifest_detail);
    Assignment_manifest_detail.associate = function (models) {
        models.Assignment_manifest_detail.belongsTo(models.Assignment_manifest, {
            as: 'assignment_manifest',
            foreignKey: 'assignment_id',
            targetKey: 'assignment_id'
        })

        models.Assignment_manifest_detail.belongsTo(models.Manifest_header, {
            as: 'manifest_detail',
            foreignKey:'manifest_id',
            targetKey:'manifest_id',
            sourceKey:'manifest_id'
        })
        models.Assignment_manifest_detail.belongsTo(models.Company,{
            as :'company_branch',
            foreignKey:'company_branch_id',
            targetKey:'company_id',
            sourceKey:'company_branch_id'
        })

        models.Assignment_manifest_detail.belongsTo(models.Company,{
            as :'company_origin',
            foreignKey:'company_id',
            targetKey:'company_id',
            sourceKey:'company_id'
        })


    }
    return Assignment_manifest_detail;
}