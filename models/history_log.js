"use strict"
module.exports = function(sequelize, DataTypes) {
    const History_log = sequelize.define("History_log", {
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
        status:{
            type: DataTypes.STRING(50)
        },
        status_name:{
            type: DataTypes.STRING
        },
        reff_1:{
            type: DataTypes.STRING(100)
        },
        reff_2:{
            type: DataTypes.STRING(100)
        },
        usrupd:{
            type: DataTypes.STRING
        }
    }, {
        tableName: 'History_log',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    
    

    return History_log;
}
