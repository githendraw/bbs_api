"use strict"
module.exports = function(sequelize, DataTypes) {
    const Stt_return = sequelize.define("Stt_return", {
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
        stt_return_id: {
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
        company_origin_id: {
            type: DataTypes.STRING
        },
        stt_date: {
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
        confirm_by: {
            type: DataTypes.STRING,
        },
        status_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        usrupd: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'Stt_return',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Stt_return);
    Stt_return.associate = function (models) {
        models.Stt_return.hasMany(models.Stt_return_detail,{
            as :'stt_return_detail',
            foreignKey:'stt_return_id',
            targetKey:'stt_return_id',
            sourceKey:'stt_return_id'
        })

        models.Stt_return.belongsTo(models.Company,{
            as :'company_origin',
            foreignKey:'company_origin_id',
            targetKey:'company_id',
            sourceKey:'company_origin_id'
        })

        models.Stt_return.belongsTo(models.Company,{
            as :'company_branch',
            foreignKey:'company_id',
            targetKey:'company_id',
            sourceKey:'company_id'
        })


       





    }

    Stt_return.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    
    return Stt_return;
}
