require('express-router-group');
const express = require('express');
const router = express.Router();
const {adminHOVerify} = require('../middleware/auth_services');
const validasi = require('../middleware/validasi');
const hoCustomer = require('../controllers_ho/customer');

router.group('/customer',(router)=>{
    router.get('/', adminHOVerify, adminHOVerify,hoCustomer.getCustomer );
    router.post('/', adminHOVerify, validasi.contactGroup(), hoCustomer.saveCustomer);
})
module.exports = router;
