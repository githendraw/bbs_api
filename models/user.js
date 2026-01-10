'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            },
            unique: true
        },
        company_id:{
            type: DataTypes.STRING(50),
            allowNull: true
        },
        company_group_id:{
            type: DataTypes.STRING(50),
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact_id: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_user_manager:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue:false
        },
        is_block:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue:false
        },
        is_agen:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue:false
        },
        temp_password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pic_profile: {
            type: DataTypes.STRING
        },
        
        
    },{
        tableName: 'User',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });

    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(User);

    User.associate = function(models) {
        // associations can be defined here
        models.User.belongsTo(models.Company, {
            as: 'user_account',
            foreignKey: 'company_id',
            targetKey: 'company_id',
            sourceKey: 'company_id'
        })

        
    };
   
    User.prototype.toWeb = function (pw) {
        
        let json = this.toJSON();
        return json;
    };
    return User;
};
