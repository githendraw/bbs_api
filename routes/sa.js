require('express-router-group');
const express = require('express');
const router = express.Router();
const {adminHOVerify} = require('../middleware/auth_services');
const validasi = require('../middleware/validasi');
const SACompanyController = require('../controllers_sa/company');
const SAInvoiceController = require('../controllers_sa/invoice');
const SAContactController = require('../controllers_sa/contact');
const SAShipmentController = require('../controllers_sa/shipment');
const AuthController = require('../controllers/auth.controller');
const ExcelController = require('../controllers_sa/excel');
router.post('/setadmin', adminHOVerify, AuthController.createUser);
router.group('/user',(router)=>{
    router.get('/:company_id', adminHOVerify, AuthController.getUser);
    router.get('/:id/detail', adminHOVerify, AuthController.getUserId);
    router.post('/:id/block', adminHOVerify, AuthController.blockUser);
    router.post('/:id/unblock', adminHOVerify, AuthController.unblockUser);
    router.post('/:id/setpassword', adminHOVerify, AuthController.updatePassword);
    
})
router.group('/contact',(router)=>{
    router.get('/:type/:company_id', adminHOVerify, SAContactController.getContact);
})
router.group('/company', (router) => {
    router.get('/branch', adminHOVerify, SACompanyController.SA_BRANCH_LIST);
    router.get('/bank/:company_id', adminHOVerify, SACompanyController.SA_BANK_LIST);
    router.post('/bank/:company_id', adminHOVerify, SACompanyController.SA_BANK_SAVE);
    router.post('/billing-revenue', adminHOVerify, SACompanyController.SA_BILLING_REVENUE);
    router.post('/billing-expense', adminHOVerify, SACompanyController.SA_BILLING_EXPENSE);
    router.get('/billing/:type', adminHOVerify, SACompanyController.SA_BILLING);

})
router.group('/shipment',(router)=>{
    router.get('/:company_id', adminHOVerify, SAShipmentController.SHIPMENT_FILTER);
    router.get('/invoice/:id', adminHOVerify, SAInvoiceController.SHIPMENT_BY_AWB_INVOICE);
    router.put('/invoice/:id', adminHOVerify, validasi.shipment.order(), SAInvoiceController.SHIPMENT_VALIDASI_INVOICE_UPDATE);
    router.get('/cashbyid/:id', adminHOVerify, SAInvoiceController.SHIPMENT_BY_AWB_CASH);
    router.put('/cashbyid/:id', adminHOVerify, validasi.shipment.order(), SAInvoiceController.SHIPMENT_VALIDASI_CASH_UPDATE);
    router.get('/cash/:company_id', adminHOVerify, SAInvoiceController.SHIPMENT_CASH);
    router.get('/zero-amount/:company_id', adminHOVerify, SAInvoiceController.SHIPMENT_ZERO_AMOUNT);
    router.get('/uninvoicecustomer/:company_id',adminHOVerify,SAInvoiceController.SHIPMENT_UNINVOICE_BYCUST);
    router.get('/uninvoice/:company_id',adminHOVerify,SAInvoiceController.SHIPMENT_UNINVOICE);
    router.get('/uninvoice/:company_id/:contact_id',adminHOVerify,SAInvoiceController.SHIPMENT_UNINVOICE);
    router.get('/paid/:company_id',adminHOVerify,SAInvoiceController.SHIPMENT_PAID);
})
router.group('/smu',(router)=>{
    router.get('/uninvoice/:company_id',adminHOVerify,SAInvoiceController.SEWA_GUDANG_UNINVOICE);
    router.get('/uninvoice/:company_id/:contact_id',adminHOVerify,SAInvoiceController.SEWA_GUDANG_UNINVOICE);
    router.get('/byid/:id', adminHOVerify, SAInvoiceController.SEWA_GUDANG_BY_SMU_INVOICE);
})
router.group('/invoice',(router)=>{
    router.get('/wh/:company_id/:id',adminHOVerify,SAInvoiceController.GET_INVOICE_WH_ID)
    router.get('/wh/:company_id',adminHOVerify,SAInvoiceController.GET_INVOICE_WH_LIST)
    router.post('/wh/:company_id',adminHOVerify,SAInvoiceController.SAVE_INVOICE_WH)
    router.put('/wh/:company_id/:id',adminHOVerify,SAInvoiceController.UPDATE_INVOICE_WH)
    router.get('/payment/:company_id/os',adminHOVerify,SAInvoiceController.GET_INVOICE_OS_PAYMENT)
    router.post('/payment/:company_id',adminHOVerify,SAInvoiceController.SAVE_PAYMENT)
    router.get('/:company_id/:id',adminHOVerify,SAInvoiceController.GET_INVOICE_ID)
    router.get('/:company_id',adminHOVerify,SAInvoiceController.GET_INVOICE_LIST)
    router.post('/:company_id',adminHOVerify,SAInvoiceController.SAVE_INVOICE)
    router.put('/:company_id/:id',adminHOVerify,SAInvoiceController.UPDATE_INVOICE)
    router.post('/:company_id/:id/void',adminHOVerify,SAInvoiceController.VOID_INVOICE)
})
router.group('/payment',(router)=>{
    router.get('/:company_id/os',adminHOVerify,SAInvoiceController.GET_INVOICE_OS_PAYMENT)
    router.get('/:company_id',adminHOVerify,SAInvoiceController.GET_LIST_PAYMENT)
    router.get('/:company_id/payment/:id',adminHOVerify,SAInvoiceController.GET_PAYMENT_ID)
    router.post('/:company_id',adminHOVerify,SAInvoiceController.SAVE_PAYMENT)
    router.put('/:company_id/:id',adminHOVerify,SAInvoiceController.UPDATE_PAYMENT)
    router.post('/:company_id/delete-invoice/:payment_id/:invoice_id',adminHOVerify,SAInvoiceController.DELETE_PAYMENT_INVOICE_ID)
})
router.group('/excel',(router)=>{
    router.get('/shipment/:company_id', adminHOVerify, ExcelController.EXCEL_SHIPMENT);
})
module.exports = router;
