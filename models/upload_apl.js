"use strict"
module.exports = function(sequelize, DataTypes) {
    const Upload_apl = sequelize.define("Upload_apl", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        ar_term:{
            type: DataTypes.STRING,
        },
        item_id:{
            type: DataTypes.STRING,
        },
        actual_route:{
            type: DataTypes.STRING,
        },
        zyllem_order:{
            type: DataTypes.STRING,
        },
        actual_shipmentcompletiondate:{
            type: DataTypes.STRING,
        },
        actual_shipmentcompletiontime:{
            type: DataTypes.STRING,
        },
        authorised_receiver:{
            type: DataTypes.STRING,
        },
        customer_group1:{
            type: DataTypes.STRING,
        },
        customer_group2:{
            type: DataTypes.STRING,
        },
        delivery_createdondate:{
            type: DataTypes.STRING,
        },
        delivery_createdontime:{
            type: DataTypes.STRING,
        },
        delivery_number:{
            type: DataTypes.STRING
        
        },
        order_date:{
            type: DataTypes.STRING,
        },
        invoice_creationdate:{
            type: DataTypes.STRING,
        },
        order_datetime:{
            type: DataTypes.STRING,
        },
        invoice_creationtime:{
            type: DataTypes.STRING,
        },
        invoice_number:{
            type: DataTypes.STRING,
                unique:true
        },
        invoice_totallines:{
            type: DataTypes.STRING,
        },
        invoice_type:{
            type: DataTypes.STRING,
        },
        invoice_valueaftertax:{
            type: DataTypes.STRING,
        },
        order_source:{
            type: DataTypes.STRING,
        },
        order_type:{
            type: DataTypes.STRING,
        },
        planned_deliverydate:{
            type: DataTypes.STRING,
        },
        planned_deliverytime:{
            type: DataTypes.STRING,
        },
        ordered_byuserid:{
            type: DataTypes.STRING,
        },
        purchase_order:{
            type: DataTypes.STRING,
        },
        ordered_byuser:{
            type: DataTypes.STRING,
        },
        region_code:{
            type: DataTypes.STRING,
        },
        sales_ordernumber:{
            type: DataTypes.STRING,
        },
        sales_org:{
            type: DataTypes.STRING,
        },
        ship_tocity:{
            type: DataTypes.STRING,
        },
        ship_tocode:{
            type: DataTypes.STRING,
        },
        ship_todistrict:{
            type: DataTypes.STRING,
        },
        ordered_onnetworkid:{
            type: DataTypes.STRING,
        },
        shipment_number:{
            type: DataTypes.STRING,
        },
        shipment_startdate:{
            type: DataTypes.STRING,
        },
        ordered_onnetwork:{
            type: DataTypes.STRING
        },
        shipment_starttime:{
            type: DataTypes.STRING,
        },
        shipment_type:{
            type: DataTypes.STRING,
        },
        shipping_condition:{
            type: DataTypes.STRING,
        },
        sold_tocode:{
            type: DataTypes.STRING,
        },
        tracking_page:{
            type: DataTypes.STRING,
        },
        total_packages:{
            type: DataTypes.STRING,
        },
        transpzone:{
            type: DataTypes.STRING,
        },
        transport_group:{
            type: DataTypes.STRING,
        },
        transport_vendor:{
            type: DataTypes.STRING,
        },
        service:{
            type: DataTypes.STRING,
        },
        whs_code:{
            type: DataTypes.STRING,
        },
        requested_pickupdate_time:{
            type: DataTypes.STRING,
        },
        customer_name:{
            type: DataTypes.STRING,
        },
        origin_contactid:{
            type: DataTypes.STRING,
        },
        origin_contactname:{
            type: DataTypes.STRING,
        },
        origin_contactphone:{
            type: DataTypes.STRING,
        },
        origin_contactaddress:{
            type: DataTypes.STRING,
        },
        destination_contactid:{
            type: DataTypes.STRING,
        },
        destination_contactname:{
            type: DataTypes.STRING,
        },
        destination_contactphone:{
            type: DataTypes.STRING,
        },
        destination_contactaddress:{
            type: DataTypes.STRING,
        },
        source:{
            type: DataTypes.STRING,
        },
        current_step:{
            type: DataTypes.STRING,
        },
        current_operatorid:{
            type: DataTypes.STRING,
        },
        current_operator:{
            type: DataTypes.STRING,
        },
        current_operatorteam:{
            type: DataTypes.STRING,
        },
        pod_status:{
            type: DataTypes.STRING,
        },
        eta_starts:{
            type: DataTypes.STRING,
        },
        eta_ends:{
            type: DataTypes.STRING,
        },
        scheduled_etastarts:{
            type: DataTypes.STRING,
        },
        scheduled_etaends:{
            type: DataTypes.STRING,
        },
        major_state:{
            type: DataTypes.STRING,
        },
        comments:{
            type: DataTypes.STRING,
        },
        is_confirm: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        shipment_awb: {
            type: DataTypes.STRING,
        },

    }, {
        tableName: 'Upload_apl',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true
    });
    const sequelizePaginate = require('sequelize-paginate');
    sequelizePaginate.paginate(Upload_apl);
   
    return Upload_apl;
}

