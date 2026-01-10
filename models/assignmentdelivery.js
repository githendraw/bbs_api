"use strict"
module.exports = function(sequelize, DataTypes) {
    const Assignment_delivery = sequelize.define("Assignment_delivery", {
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
        
        delivery_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        route_id: {
            type: DataTypes.STRING(50)
        },
        contact_id: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        name: {
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
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        usrupd: {
            type: DataTypes.STRING
        },
        total_shipment: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_shipment_success: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_shipment_cancel: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        
    }, {
        tableName: 'Assignment_delivery',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Assignment_delivery);
    Assignment_delivery.associate = function (models) {
        models.Assignment_delivery.hasMany(models.Assignment_delivery_detail,{
            as :'assignment_delivery_detail',
            foreignKey:'delivery_id',
            targetKey:'delivery_id',
            sourceKey:'delivery_id'
        })

        models.Assignment_delivery.belongsTo(models.Contact,{
            as :'contact_detail',
            foreignKey:'contact_id',
            targetKey:'contact_id',
            sourceKey:'contact_id'
        })

       

    }

    Assignment_delivery.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    
    return Assignment_delivery;
}
