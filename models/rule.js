
"use strict"
module.exports = function(sequelize, DataTypes) {
    const Rule = sequelize.define("Rule", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        rule: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique:true

        },
        
    }, {
        tableName: 'Rule',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    
    Rule.associate = function (models) {
        

      
    }
    return Rule;
}
