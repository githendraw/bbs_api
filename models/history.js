    "use strict"
module.exports = function(sequelize, DataTypes) {
    const History = sequelize.define("History", {
         id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_id:{
            type: DataTypes.STRING(20),
            allowNull:false
        },
        status_id:{
            type: DataTypes.STRING(50)
        },
        status_name:{
            type: DataTypes.STRING(100)
        },
       
        shipment_awb:{
            type: DataTypes.STRING(50)
        },
        history_date:{
            type: DataTypes.DATE,
            allowNull: false

        },
        update_date:{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue:sequelize.NOW
        },
        description:{
            type: DataTypes.STRING
        },
        remark:{
            type: DataTypes.STRING
        },
        ref_no:{
            type: DataTypes.STRING,
            allowNull: true
        },
        ref_id_no:{
            type: DataTypes.STRING,
            allowNull: true
        },
        received_status:{
            type: DataTypes.STRING,
            allowNull: true
        },
        received_reason:{
            type: DataTypes.STRING,
            allowNull: true
        },
        pic1: {
            type: DataTypes.TEXT
        },
        pic2: {
            type: DataTypes.TEXT
        },
        pic3: {
            type: DataTypes.TEXT
        },
        pic4: {
            type: DataTypes.TEXT
        },
        pic5: {
            type: DataTypes.TEXT
        },
        pic6: {
            type: DataTypes.TEXT
        },
        sign: {
            type: DataTypes.TEXT
        },
       
        usrupd:{
            type: DataTypes.STRING
        }
    }, {
        tableName: 'History',
        updatedAt: 'updated',
        createdAt: 'created',
        timestamps: true,
        // indexes: [{
        //     name: 'history_partial_idx',
        //     unique: true,
        //     fields: ['status_id', 'shipment_awb']
            
        //   }],
    });
    
    History.associate = function (models) {
        models.History.belongsTo(models.Status,{
            as :'status',
            foreignKey:'status_id',
            targetKey:'status_id'
        })
        models.History.belongsTo(models.Shipment,{
            as :'shipment',
            foreignKey:'shipment_awb',
            targetKey:'shipment_awb'
        })

        models.History.belongsTo(models.Shipment_pickup,{
            as :'shipment_pickup',
            foreignKey:'shipment_awb',
            targetKey:'shipment_awb'
        })

    }

    return History;
}
