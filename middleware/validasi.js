const {
    body,
    validationResult
} = require('express-validator');
module.exports={
    accounting:{
        coa_group:()=>{
            return [

                body('account_code').notEmpty(),
                body('account_name').notEmpty(),
                body('parent_id').notEmpty(),



            ]
        },
        coa:()=>{
            return [

                body('account_code').notEmpty(),
                body('account_name').notEmpty(),
                body('group_code').notEmpty(),
                body('notes').notEmpty(),



            ]
        }
    },
    cabang:()=>{
        return [
            body('company_name').notEmpty(),
            body('alias').notEmpty(),
            body('address1').notEmpty(),
            body('city_code').notEmpty(),




        ]
    },
    area:{
        country:()=>{
            return [
                body('country_id').notEmpty(),
                body('country_name').notEmpty(),
            ]
        },
        province:()=>{
            return [
            body('country_id').notEmpty(),
            body('province_name').notEmpty(),
            body('province_id').notEmpty()
            ]
        },
        hub:()=>{
            return [
                body('province_id').notEmpty(),
                body('hub_name').notEmpty(),
                body('hub_id').notEmpty()
                ]
        },
        destination:()=>{
            return [
                body('dest_id').notEmpty(),
                body('hub_id').notEmpty(),
                body('dest_name').notEmpty(),
            ]
        }
    },
    shipment:{
        order:()=>{
            return [
                body('shipment_date').notEmpty(),
                body('partner_id').notEmpty(),
                body('receiver_name').notEmpty(),
                body('moda_id').notEmpty(),
                body('service_id').notEmpty(),
                body('moda_id').notEmpty(),
                body('destination').notEmpty(),
                body('origin').notEmpty()
            ]
        },
    },
    smu:{
        sewagudang:()=>{
            return [
                body('smu_date').notEmpty(),
                body('smu_no').notEmpty(),
                body('airline').notEmpty(),
                body('host_origin').notEmpty(),
                body('host_destination').notEmpty(),
            ]
        },
    },
    contact:()=>{
        return[
            body('name').notEmpty(),
            body('address1').notEmpty(),
            body('city_code').notEmpty()
        ]
    },
    contactGroup:()=>{
        return[
            body('name').notEmpty(),
            body('address1').notEmpty(),
            
        ]
    },
    contactPrice:()=>{
        return [
            body('origin').notEmpty(),
            body('destination').notEmpty(),
            body('uom_id').notEmpty(),
            body('moda_id').notEmpty(),
            body('service_id').notEmpty(),
            body('partner_id').notEmpty(),
            body('price_from').notEmpty(),
            body('price_to').notEmpty(),

        ]
    },
    assignment:{
        deliverySheet:()=>{
            return[
                body('contact_id').notEmpty(),
                body('assignment_date').notEmpty()

            ]
        },
        manifest:()=>{
            return[
                body('assignment_date').notEmpty(),
                body('contact_id').notEmpty(),
                body('weight').notEmpty(),
                body('uom_id').notEmpty()


            ]
        },
        incoming:()=>{
            return[
                body('incoming_date').notEmpty(),

            ]
        },
    },
    stt:{
        return:()=>{
            return[
                body('stt_date').notEmpty(),
            body('hub_id').notEmpty(),
            body('company_origin_id').notEmpty()
            ]

        },
        customer:()=>{
            return[
                body('stt_date').notEmpty(),
            body('partner_id').notEmpty(),
            ]

        }
    },
    register:{
        user:()=>{
            return [
                body('email').notEmpty(),
                body('phone').notEmpty(),
                body('password').isLength({ min: 6 }).withMessage('Minimal 6 Char'),
                body('email').isEmail().normalizeEmail(),
            ]
        },
        verification:()=>{
            return [
                body('token_verification').notEmpty()
            ]
        },
        resend_verification:()=>{
            return [
                body('email').notEmpty(),
                body('email').isEmail().normalizeEmail(),
            ]
        },
        forget_password:()=>{
            return [
                body('email').notEmpty(),
                body('email').isEmail().normalizeEmail(),
            ]
        },
        update_password:()=>{
            return [
                body('password').isLength({ min: 6 }).withMessage('Minimal 6 Char'),
                body('confirm_password').isLength({ min: 6 }).withMessage('Minimal 6 Char'),
            ]
        }
    },
    auth:{
        login:()=>{
            return [
                body('email').notEmpty(),
                body('password').notEmpty(),
                body('email').isEmail()
            ]
        },
    }
};