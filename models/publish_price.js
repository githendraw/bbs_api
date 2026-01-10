"use strict"
module.exports = function(sequelize, DataTypes) {
    const Publish_price = sequelize.define("Publish_price", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        price_id: {
            type: DataTypes.STRING,
            unique:true
        },
        company_group_id:{
            type:DataTypes.STRING(10),
            allowNull: true
        },
        service_id: {
            type: DataTypes.STRING(10)
        },
        uom_id: {
            type: DataTypes.STRING(10)
        },
        moda_id: {
            type: DataTypes.STRING(10)
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue:1
        },
        type_price: {
            type: DataTypes.STRING(10)
        },
        origin: {
            type: DataTypes.STRING(10),
            references: {
                model: 'Destination',
                key: 'dest_id'
              }
        },
        destination: {
            type: DataTypes.STRING(10),
            references: {
                model: 'Destination',
                key: 'dest_id'
              }
        },
        price_1: {
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        price_2: {
            type: DataTypes.FLOAT,
            defaultValue:0
        },
        lead_time_from: {
            type: DataTypes.FLOAT
        },
        lead_time_to: {
            type: DataTypes.FLOAT
        },
        created_by: {
            type: DataTypes.STRING(50)
        },
        updated_by: {
            type: DataTypes.STRING(50)
        }

    }, {
        tableName: 'Publish_price',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Publish_price);
    Publish_price.associate = function (models) {
        models.Publish_price.belongsTo(models.Destination,{
            as :'origin_detail',
            foreignKey:'origin',
            targetKey:'dest_id'
        });

        models.Publish_price.belongsTo(models.Destination,{
            as :'destination_detail',
            foreignKey:'destination',
            targetKey:'dest_id'
        });

        models.Publish_price.belongsTo(models.Uom,{
            as :'uom_detail',
            foreignKey:'uom_id',
            targetKey:'uom_id'
        });

        models.Publish_price.belongsTo(models.Services,{
            as :'service_detail',
            foreignKey:'service_id',
            targetKey:'service_id'
        });



      
    };
    return Publish_price;
}
