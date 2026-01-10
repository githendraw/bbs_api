
"use strict"
module.exports = function(sequelize, DataTypes) {
    const Rule_sub_menu = sequelize.define("Rule_sub_menu", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
       
        sub_menu_id: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique:true
        },
        menu_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
         sub_menu_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        is_allow: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        
    }, {
        tableName: 'Rule_sub_menu',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    
    Rule_sub_menu.associate = function (models) {
        
        models.Rule_sub_menu.belongsTo(models.Rule_menu, {
            as: 'menu_header',
            foreignKey: 'menu_id',
            targetKey: 'menu_id'
        })

      
    }
    return Rule_sub_menu;
}
