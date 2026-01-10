'use strict';

module.exports = (sequelize, DataTypes) => {
    const Company_group = sequelize.define('Company_group', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_group_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        company_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        company_legal: {
            type: DataTypes.STRING
        },
        alias: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        address1: {
            type: DataTypes.STRING,
        },
        address2: {
            type: DataTypes.STRING,
        },
        address3: {
            type: DataTypes.STRING,
        },
        city_code: {
            type: DataTypes.STRING(50),

        },
        city_name: {
            type: DataTypes.STRING(100),

        },
        zip_code: {
            type: DataTypes.STRING(10),

        },
        lat: {
            type: DataTypes.STRING,
        },
        long: {
            type: DataTypes.STRING,
        },
        phone1: {
            type: DataTypes.STRING,
        },
        phone2: {
            type: DataTypes.STRING,
        },
        fax: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true
            }
        },
        logo: {
            type: DataTypes.STRING
        },
        npwp: {
            type: DataTypes.STRING
        },
        website: {
            type: DataTypes.STRING
        },
        currency: {
            type: DataTypes.STRING
        },
        fiscal_start: {
            type: DataTypes.DATE,
        },
        fiscal_end: {
            type: DataTypes.DATE,
        },
        usrUpd: {
            type: DataTypes.STRING,
            allowNull: false
        }

    }, {
        tableName: 'Company_group',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    Company_group.associate = function (models) {
        // associations can be defined here
        models.Company_group.hasMany(models.Company, {
            as: 'company',
            foreignKey:'company_group_id',
            targetKey:'company_group_id',
            sourceKey:'company_group_id'})
    };
    Company_group.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Company_group;
};
