
"use strict"
module.exports = function(sequelize, DataTypes) {
    const Rule_menu = sequelize.define("Rule_menu", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        
            autoIncrement: true
        },
        rule: {
            type: DataTypes.STRING(20),
            allowNull: false

        },
        menu_id: {
            type: DataTypes.STRING(10),
            unique:true
        },
        menu_name: {
            type: DataTypes.STRING(100),
        },
        is_allow: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        
    }, {
        tableName: 'Rule_menu',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    
    Rule_menu.associate = function (models) {
        
        models.Rule_menu.hasMany(models.Rule_sub_menu,{
            as :'menu_detail',
            foreignKey:'menu_id',
            targetKey:'menu_id',
            sourceKey:'menu_id'
        })
      
    }
    return Rule_menu;
}
