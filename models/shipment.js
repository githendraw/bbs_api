"use strict"
module.exports = function(sequelize, DataTypes) {
    const Shipment = sequelize.define("Shipment", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        shipment_awb: {
            type: DataTypes.STRING(50),
            unique:true
        },
        shipment_awbm: {
            type: DataTypes.STRING(50)
        },
        job_id: {
            type: DataTypes.STRING(50)
        },
        route_id: {
            type: DataTypes.STRING(50)
        },
        shipment_do: {
            type: DataTypes.STRING(100)
        },
        company_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        company_group_id: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        shipment_type_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        shipment_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        sub_contact_id: {
            type: DataTypes.STRING(50)
        },
        sub_contact_name: {
            type: DataTypes.STRING
        },
        sub_contact_email: {
            type: DataTypes.STRING
        },
        sub_contact_phone1: {
            type: DataTypes.STRING
        },
        sub_contact_pic: {
            type: DataTypes.STRING
        },
        sub_contact_address1: {
            type: DataTypes.STRING
        },
        partner_id: {
            type: DataTypes.STRING(50),
            references: {
                model: 'Contact',
                key: 'contact_id'
              }
        },
        partner_name: {
            type: DataTypes.STRING
        },
        partner_email: {
            type: DataTypes.STRING
        },
        partner_pic: {
            type: DataTypes.STRING
        },
        partner_address1: {
            type: DataTypes.STRING
        },
        partner_address2: {
            type: DataTypes.STRING
        },
        partner_state: {
            type: DataTypes.STRING
        },
        partner_city: {
            type: DataTypes.STRING
        },
        partner_country: {
            type: DataTypes.STRING
        },
        partner_phone1: {
            type: DataTypes.STRING
        },
        partner_phone2: {
            type: DataTypes.STRING
        },
        receiver_id: {
            type: DataTypes.STRING(50)
        },
        receiver_name: {
            type: DataTypes.STRING
        },
        receiver_pic: {
            type: DataTypes.STRING
        },
        receiver_email: {
            type: DataTypes.STRING
        },
        receiver_address1: {
            type: DataTypes.STRING
        },
        receiver_address2: {
            type: DataTypes.STRING
        },
        receiver_state: {
            type: DataTypes.STRING
        },
        receiver_city: {
            type: DataTypes.STRING
        },
        receiver_country: {
            type: DataTypes.STRING
        },
        receiver_phone1: {
            type: DataTypes.STRING
        },
        receiver_phone2: {
            type: DataTypes.STRING
        },
        service_id: {
            type: DataTypes.STRING(20)
        },
        uom_id: {
            type: DataTypes.STRING(10)
        },
        moda_id: {
            type: DataTypes.STRING(10)
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        weight_actual: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        weight_vol: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        vol: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        p: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        l: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        t: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        qty: {
            type: DataTypes.FLOAT
        },
        qty_bagging: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        weight_invoice: {
            type: DataTypes.FLOAT
        },
        uom_invoice: {
            type: DataTypes.STRING(10)
        },
        collect_price: {
            type: DataTypes.FLOAT
        },
        origin: {
            type: DataTypes.STRING(10),
            references: {
                model: 'Destination',
                key: 'dest_id'
              }
        },
        originname: {
            type: DataTypes.STRING
        },
        destination: {
            type: DataTypes.STRING(10),
            references: {
                model: 'Destination',
                key: 'dest_id'
              }
        },
        destinationname: {
            type: DataTypes.STRING
        },
        specialinst: {
            type: DataTypes.STRING
        },
        itemdesc: {
            type: DataTypes.STRING
        },
        lat_pos: {
            type: DataTypes.STRING
        },
        lang_pos: {
            type: DataTypes.STRING
        },
        isdeleted: {
            type: DataTypes.BOOLEAN
        },
        last_moda: {
            type: DataTypes.STRING
        },
        vehicle_id: {
            type: DataTypes.STRING
        },
        vessel_id: {
            type: DataTypes.STRING
        },
        last_status: {
            type: DataTypes.STRING(50)
        },
        last_status_remark: {
            type: DataTypes.STRING
        },
        is_cash: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_collect: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_pickup: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_from_pickup: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_pickup_confirm: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
                // jika sudah melakukan proses pickup
        },
        sales_id: {
            type: DataTypes.STRING(20)
        },

        sales_by: {
            type: DataTypes.STRING
        },
        pickup_id: {
            type: DataTypes.STRING(20)
        },
        pickup_by: {
            type: DataTypes.STRING
        },
        is_cod: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        pickup_date: {
            type: DataTypes.DATE
        },
        is_incoming_wh: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_incoming_wh_date: {
            type: DataTypes.DATE
        },
        is_incoming_wh_by: {
            type: DataTypes.STRING
        },
        is_checked_incoming: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_manifest: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_print_manifest: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_checked_manifest: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_process_manifest: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        manifest_no: {
            type: DataTypes.STRING
        },
        manifest_date: {
            type: DataTypes.DATE
        },
        manifest_by: {
            type: DataTypes.STRING
        },
        bagging_no: {
            type: DataTypes.STRING
        },
        is_departure: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        departure_by: {
            type: DataTypes.STRING
        },
        departure_date: {
            type: DataTypes.DATE
        },
        is_arrive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_checked_arrive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_process_arrive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        arrive_by: {
            type: DataTypes.STRING
        },
        arrive_date: {
            type: DataTypes.DATE
        },
        is_delivery: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_checked_delivery: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_process_delivery: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        delivery_by: {
            type: DataTypes.STRING
        },
        delivery_date: {
            type: DataTypes.DATE
        },
        delivery_no: {
            type: DataTypes.STRING
        },
        is_return: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_return_pod: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        return_by: {
            type: DataTypes.STRING
        },
        return_pod_no: {
            type: DataTypes.STRING
        },
        return_pod_date: {
            type: DataTypes.DATE
        },

        is_return_customer: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        return_customer_by: {
            type: DataTypes.STRING
        },
        return_customer_date: {
            type: DataTypes.DATE
        },
        return_customer_no: {
            type: DataTypes.STRING
        },
        is_invoice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_confirm_invoice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_checked_invoice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_printinvoice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        invoice_no: {
            type: DataTypes.STRING
        },
        invoice_by: {
            type: DataTypes.STRING
        },
        invoice_date: {
            type: DataTypes.DATE
        },
        received_date: {
            type: DataTypes.DATE
        },
        received_time: {
            type: DataTypes.DATE
        },
        is_received: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        received_status: {
            type: DataTypes.STRING
        },
        received_reason: {
            type: DataTypes.STRING
        },
        received_by: {
            type: DataTypes.STRING
        },
        charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        is_insurance: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        insurance: {
            type: DataTypes.DOUBLE,
            defaultValue: 0 
        },
        insurance_percent: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        insurance_value: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        is_others_charge: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        others_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        is_pickup_charge: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        pickup_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        handling: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        is_packing: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        packing_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        tools_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        buruh_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        telly_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        trucking_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        lolo_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        thc_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        do_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        clining_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        ppftz1_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        ppftz2_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        ppftz3_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        
        claim_charge: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },






        



        
        tax_percent: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        tax_amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        sub_total: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        sub_total_tax: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        discount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        discount_amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        total_discount_amount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },

        total: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        lt: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        lead_time: {
            type: DataTypes.STRING,
            defaultValue: 0
        },
        charge_prices: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        charge_min: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        charge_description: {
            type: DataTypes.STRING
        },
        usr_upd: {
            type: DataTypes.STRING
        },
        usrupd: {
            type: DataTypes.STRING
        },
        is_redel: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        eta_date: {
            type: DataTypes.DATE
        },
        is_paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_reset_number:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
        }
    }, {
        tableName: 'Shipment',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Shipment);
    Shipment.associate = function(models) {
        // models.Shipment.belongsTo(models.Joborder, {
        //     as: 'joborder',
        //     foreignKey: 'job_id',
        //     targetKey: 'job_id'
        // })
        models.Shipment.belongsTo(models.Company, {
            as: 'agen',
            foreignKey: 'company_id',
            targetKey: 'company_id',
            sourceKey: 'company_id'
        })
        models.Shipment.belongsTo(models.Contact, {
            as: 'contact',
            foreignKey: 'partner_id',
            targetKey: 'contact_id',
            sourceKey: 'partner_id'
        })
        models.Shipment.hasMany(models.Assignment_delivery_detail,{
            as :'assignment',
            foreignKey:'shipment_awb',
            targetKey:'shipment_awb',
            sourceKey:'shipment_awb'
        })
        models.Shipment.hasMany(models.History,{
            as :'history',
            foreignKey:'shipment_awb',
            targetKey:'shipment_awb',
            sourceKey:'shipment_awb'
        })


        models.Shipment.hasMany(models.Manifest_detail,{
            as :'detail_manifest',
            foreignKey:'shipment_awb',
            targetKey:'shipment_awb',
            sourceKey:'shipment_awb'
        })

        models.Shipment.hasMany(models.Shipment_detail,{
            as :'item',
            foreignKey:'shipment_awb',
            targetKey:'shipment_awb',
            sourceKey:'shipment_awb'
        })
        models.Shipment.hasMany(models.Shipment_detail_reff,{
            as :'detail_reff',
            foreignKey:'shipment_awb',
            targetKey:'shipment_awb',
            sourceKey:'shipment_awb'
        })

        models.Shipment.hasMany(models.Invoice_detail,{
            as :'invoice_detail',
            foreignKey:'shipment_awb',
            targetKey:'shipment_awb',
            sourceKey:'shipment_awb'
        })

        models.Shipment.belongsTo(models.Status, {
            as: 'status',
            foreignKey: 'last_status',
            targetKey: 'status_id',
            sourceKey: 'last_status'
        })
        models.Shipment.belongsTo(models.Destination,{
            as :'destination_detail',
            foreignKey:'destination',
            targetKey:'dest_id'
        });

        models.Shipment.belongsTo(models.Uom, {
            as: 'uom_detail',
            foreignKey: 'uom_id',
            targetKey: 'uom_id',
            sourceKey: 'uom_id'
        })

        models.Shipment.belongsTo(models.Services, {
            as: 'service',
            foreignKey:'service_id',
                targetKey:'service_id',
                sourceKey:'service_id'
        })
    }

    Shipment.prototype.toWeb = function (pw) {
        
        let json = this.toJSON();
        return json;
    };
    return Shipment;
}
