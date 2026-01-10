"use strict"
module.exports = function(sequelize, DataTypes) {
    const Stt_return_customer = sequelize.define("Stt_return_customer", {
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
        
        usrupd: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'Stt_return_customer',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Stt_return_customer);
    Stt_return_customer.associate = function (models) {
        models.Stt_return_customer.hasMany(models.Stt_return_customer_detail,{
            as :'stt_return_customer_detail',
            foreignKey:'stt_return_id',
            targetKey:'stt_return_id',
            sourceKey:'stt_return_id'
        })
        models.Stt_return_customer.belongsTo(models.Contact, {
            as: 'contact',
            foreignKey: 'partner_id',
            targetKey: 'contact_id',
            sourceKey: 'partner_id'
        })
    }

    Stt_return_customer.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    
    return Stt_return_customer;
}
