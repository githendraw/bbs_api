"use strict"
module.exports = function(sequelize, DataTypes) {
    const Log_history = sequelize.define("Log_history", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_id:{
            type: DataTypes.STRING(20),
            allowNull:false
        },
        type:{
            type: DataTypes.STRING
        },
        description:{
            type: DataTypes.STRING(100)
        },
       
        shipment_awb:{
            type: DataTypes.STRING(50)
        },
        log_date:{
            type: DataTypes.DATE

        },
        remark:{
            type: DataTypes.STRING
        },
        ref_no:{
            type: DataTypes.STRING
        },
        usrupd:{
            type: DataTypes.STRING
        }
    }, {
        tableName: 'Log_history',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    
    Log_history.associate = function (models) {
      
       
    }

    return Log_history;
}
