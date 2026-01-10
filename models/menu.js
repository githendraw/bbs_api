"use strict"
module.exports = function(sequelize, DataTypes) {
    const Menu = sequelize.define("Menu", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        menu_id: {
            type: DataTypes.STRING(10),
            unique: true
        },
        menu_group: {
            type: DataTypes.STRING(100),
        },
         menu_name: {
            type: DataTypes.STRING(100),
        },
        menu_endpoint: {
            type: DataTypes.STRING  ,
        },

        is_view: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        is_add: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        is_update: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        is_delete: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },




    }, {
        tableName: 'Menu',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true

    });

    Menu.associate = function (models) {
        
         

       

    }

    Menu.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };


    return Menu;
}
