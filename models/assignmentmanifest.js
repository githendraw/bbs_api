"use strict"
module.exports = function(sequelize, DataTypes) {
    const Assignment_manifest = sequelize.define("Assignment_manifest", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.STRING,
            allowNull: false,

        },

        assignment_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
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
        contact_id: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        pic: {
            type: DataTypes.STRING(20),
            allowNull: true
        },

        pic_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        assignment_date: {
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
        is_print: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        status_id: {
            type: DataTypes.STRING
        },
        is_confirm: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        confirm_date: {
            type: DataTypes.DATE,
        },
        is_approve: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        approve_date: {
            type: DataTypes.DATE,
        },
        approve_by: {
            type: DataTypes.STRING,
        },
        is_finish: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },

        finish_date: {
            type: DataTypes.DATE,
        },

        finish_by: {
            type: DataTypes.STRING,
        },

        is_success: {
            type: DataTypes.BOOLEAN,
            defaultValue:true
        },
        status_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        usrupd: {
            type: DataTypes.STRING
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue: 1
        },
        weight_volume: {
            type: DataTypes.FLOAT,
            defaultValue: 1
        },
        uom_id: {
            type: DataTypes.STRING(10)
        },
        moda_id: {
            type: DataTypes.STRING(10)
        },
        
        total_bagging: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_bagging_success: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_bagging_cancel: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },


    }, {
        tableName: 'Assignment_manifest',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Assignment_manifest);
    Assignment_manifest.associate = function (models) {

        models.Assignment_manifest.hasMany(models.Assignment_manifest_detail,{
            as :'assignment_manifest_detail',
            foreignKey:'assignment_id',
            targetKey:'assignment_id',
            sourceKey:'assignment_id'
        })
        models.Assignment_manifest.belongsTo(models.Company,{
            as :'company_branch',
            foreignKey:'company_branch_id',
            targetKey:'company_id',
            sourceKey:'company_branch_id'
        })

        models.Assignment_manifest.belongsTo(models.Company,{
            as :'company_origin',
            foreignKey:'company_id',
            targetKey:'company_id',
            sourceKey:'company_id'
        })

        models.Assignment_manifest.belongsTo(models.Contact,{
            as :'vendor',
            foreignKey:'contact_id',
            targetKey:'contact_id',
            sourceKey:'contact_id'
        })



    }

    Assignment_manifest.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };


    return Assignment_manifest;
}
