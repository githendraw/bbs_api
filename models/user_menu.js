
"use strict"
module.exports = function(sequelize, DataTypes) {
    const User_menu = sequelize.define("User_menu", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            


        },
        menu_group: {
            type: DataTypes.STRING(100),
        },

        menu_id: {
            type: DataTypes.STRING(10),
            allowNull:false
        },
        menu_name: {
            type: DataTypes.STRING(100),
        },
        is_view: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        is_add: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        is_edit: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        is_hapus: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },

        
    }, {
        tableName: 'User_menu',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    
    User_menu.associate = function (models) {
        
    
      
    }
    return User_menu;
}
