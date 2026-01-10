"use strict"
module.exports = function (sequelize, DataTypes) {

    const Company = sequelize.define("Company", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_group_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        company_id: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true
        },
        company_name: {
            type: DataTypes.STRING(100),
            allowNull: false
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
        balance_d: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        balance_c: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        balance: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        fiscal_start: {
            type: DataTypes.DATE,
        },
        fiscal_end: {
            type: DataTypes.DATE,
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_own: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        pic: {
            type: DataTypes.STRING

        },
        invoice_prepare: {
            type: DataTypes.STRING

        },
        invoice_approve: {
            type: DataTypes.STRING

        },

        usrUpd: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'Company',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Company);
    Company.associate = function (models) {
        models.Company.belongsTo(models.Company_group, {
            as: 'company_group',
            foreignKey: 'company_group_id',
            targetKey: 'company_group_id',
            sourceKey: 'company_group_id'
        })

        models.Company.hasMany(models.Shipment, {
            as: 'shipment',
            foreignKey: 'company_id',
            targetKey: 'company_id',
            sourceKey: 'company_id'
        })

        models.Company.hasMany(models.Shipment_pickup, {
            as: 'shipment_pickup',
            foreignKey: 'company_id',
            targetKey: 'company_id',
            sourceKey: 'company_id'
        })

        models.Company.hasMany(models.Assignment_manifest, {
            as: 'assignment_manifest',
            foreignKey: 'company_branch_id',
            targetKey: 'company_branch_id',
            sourceKey: 'company_id'
        })

        models.Company.hasMany(models.Assignment_manifest_detail, {
            as: 'Assignment_manifest_detail',
            foreignKey: 'company_branch_id',
            targetKey: 'company_branch_id',
            sourceKey: 'company_id'
        })




        models.Company.hasMany(models.Stt_return, {
            as: 'stt_return',
            foreignKey: 'company_origin_id',
            targetKey: 'company_origin_id',
            sourceKey: 'company_id'
        })

        models.Company.hasMany(models.Company_price, {
            as: 'company_price',
            foreignKey: 'company_id',
            targetKey: 'company_id',
            sourceKey: 'company_id'
        })

        // models.Company.hasMany(models.Company_topup,{
        //     as: 'topup',
        //         foreignKey:'company_id',
        //         targetKey:'company_id',
        //         sourceKey:'company_id'
        // })
        // models.Company.hasMany(models.Assignment_pu_detail,{
        //     as: 'pickup',
        //         foreignKey:'company_id',
        //         targetKey:'agen_id',
        //         sourceKey:'company_id'
        // })


        models.Company.hasMany(models.User, {
            as: 'user_account',
            foreignKey: 'company_id',
            targetKey: 'company_id',
            sourceKey: 'company_id'
        })

    }
    Company.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };
    return Company;
}
