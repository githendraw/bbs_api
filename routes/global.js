require('express-router-group');
const express = require('express');
const router = express.Router();
const { globalVerify,adminHOVerify } = require('../middleware/auth_services');
const validasi = require('../middleware/validasi');
const DashboardController = require('../controllers/dashboard.controller');
const ShipmentController = require('../controllers/shipment.controller');
const ContactController = require('../controllers/contact.controller');
const AreaControlller = require('../controllers/area.controller');
const MasterController = require('../controllers/master.controller');
const FileController = require('../controllers/file.controller');
const GlobalController = require('../controllers/global.controller');
const PrintController = require('../controllers/print.controller');
const ManifestController = require('../controllers/manifest.controller');
const AssignmentController = require('../controllers/assignment.controller');
const CompanyController = require('../controllers/company.controller');
const IncomingController = require('../controllers/incoming.controller');
const NotificationController = require('../controllers/notification.controller');
const STTController = require('../controllers/stt.controller');
const STTCustomerController = require('../controllers/stt.customer.controller');
const AuthController = require('../controllers/auth.controller');
const TracingController = require('../controllers/tracing.controller');
const SMUController = require('../controllers/smu.controller');
const DriverController = require('../controllers/driver.controller');
router.get('/', globalVerify, (req, res, next) => {
  res.json({
    status: 'success',
    message: 'GLOBAL ',
    data: { 'GLOBAL VERSION': 'v1.0.23' },
  });
});
/** AUTH */
router.group('/auth', (router) => {
  router.post('/', validasi.auth.login(), AuthController.userLogin);
  router.post('/getme', globalVerify, AuthController.getMe);
  router.post('/setdriver', globalVerify, AuthController.createDriver);
  // router.post('/___reg', AuthController.createUser);
  /** user  */
  /** end of user */
});
router.group('/', (router) => {
  router.post('/fileupload', globalVerify, FileController.fileUpload);
  router.get('/print/:id', globalVerify, PrintController.printx);
  router.get('/print-html/:id', globalVerify, PrintController.printHtml);
  router.get('/tracing/:id', TracingController.tracingPublic);
  router.get('/global', globalVerify, GlobalController.defaultData);
});
router.group('/dashboard', (router) => {
  router.get('/shipment-summary', globalVerify, DashboardController.shipmentSummary);
  router.get('/shipment-summary-periode', globalVerify, DashboardController.shipmentSummaryByMonthYear);
  router.get('/shipment-summary-province', globalVerify, DashboardController.shipmentSummaryProvince);
});
router.group('/driver',(router)=>{
  router.get('/osdeliverysheet', globalVerify, DriverController.osDelivery);
  router.get('/deliverysheet', globalVerify, DriverController.activeDelivery);
})
router.group('/company', (router) => {
  router.get('/', globalVerify, CompanyController.getCompanyHo);
  router.put('/', adminHOVerify, CompanyController.updateCompanyHo);
  router.put('/picture', globalVerify, FileController.updateCompanyHOPicture);
  router.get('/branch/:hub_id', globalVerify, CompanyController.getBranchByHost);
  router.get("/ho/branch/:id",globalVerify,CompanyController.getCompanyByCompanyId);
  router.get('/branch', globalVerify, CompanyController.getCompanyBranchList);
  router.post('/branch', adminHOVerify, validasi.cabang(), CompanyController.saveBranch);
  router.get('/branch/:id', globalVerify, CompanyController.getCompanyBranchList);
  router.put('/branch/:id', adminHOVerify, validasi.cabang(), CompanyController.updateBranch);
  router.get('/bank', globalVerify, CompanyController.bankList);
  router.post('/bank', globalVerify, CompanyController.saveBankList);
});


router.group('/shipment', (router) => {
  router.get('/', globalVerify, ShipmentController.filterShipment);
  router.post('/', globalVerify, validasi.shipment.order(), ShipmentController.shipmentSave);
  router.delete('/delete/:id', globalVerify,ShipmentController.deleteById);
  router.put('/edit/:shipment_awb', globalVerify, validasi.shipment.order(), ShipmentController.shipmentUpdate);
  router.put('/incomingwh', globalVerify, validasi.shipment.order(), ShipmentController.shipmentUpdateIncoming);
  // router.put('/:id',globalVerify,validasi.shipment.order(),shipmentSave)
  router.get('/pickup', globalVerify, ShipmentController.pickupView);
  router.get('/pickup/os', globalVerify, ShipmentController.pickupViewOs);
  router.get('/outbound', globalVerify, ShipmentController.outboundView);
  // router.post('/outbound', globalVerify, ShipmentController.shipmentSave);
  router.get('/outbound/:id', globalVerify, ShipmentController.outboundById);
  router.get('/price/:id', globalVerify, ShipmentController.hitungHargaCustomer);
  router.get('/:type/detail', globalVerify, ShipmentController.filterShipment);
  router.put('/statusmanual/:shipment_awb', globalVerify, ShipmentController.shipmentUpdateStatus);
  router.put('/update/awbm/:shipment_awb', globalVerify, ShipmentController.shipmentUpdateAWBM);
});
router.group('/manifest', (router) => {
  router.get('/', globalVerify, ManifestController.getManifest);
  router.post('/', globalVerify, ManifestController.simpanManifest);
  router.get('/byid/:manifest_id', globalVerify, ManifestController.getManifestByManifestId);
  router.get('/os', globalVerify, ManifestController.getManifestOsBerangkat);
  router.get('/os/:hub', globalVerify, ManifestController.getManifestOsBerangkat);
  router.get('/os/:hub/:id', globalVerify, ManifestController.getManifestOsBerangkatByHubById);
  router.get('/osbyid/:id', globalVerify, ManifestController.getManifestOsBerangkatById);
  router.get('/osbyhub', globalVerify, ManifestController.unmanifestSummaryByHub);
  router.get('/osbyhub/:hub', globalVerify, ManifestController.unmanifestByHubDetail);
  router.get('/osbyhub/:hub/shipment/:id', globalVerify, ManifestController.unmanifestByHubByShipment);
});
router.group('/assignment', (router) => {
  router.get('/manifest', globalVerify, AssignmentController.getAssignmentManifest);
  router.get('/manifest/:assignment_id', globalVerify, AssignmentController.getAssignmentManifestByAssigmentId);
  router.post('/manifest', globalVerify, validasi.assignment.manifest(), AssignmentController.saveAssignmentManifest);
  router.put('/manifest/:assignment_id', globalVerify, validasi.assignment.manifest(), AssignmentController.updateAssignmentManifest);

  router.get('/osmanifest', globalVerify, AssignmentController.osAssignmentManifest);
  router.get('/osds', globalVerify, AssignmentController.countOutstandingDeliveryAssignment);
  router.get('/osds/courier', globalVerify, AssignmentController.outstandingDeliveryAssignmentCourier);
  router.get('/osds/ondelivery', globalVerify, AssignmentController.outstandingOnDeliveryAssignmentCourier);
  router.get('/deliverysheet', globalVerify, AssignmentController.viewDelivery);
  router.get('/undeliverysheet', globalVerify, AssignmentController.undeliverySheet);
  router.get('/undeliverysheet/:id', globalVerify, AssignmentController.undeliverySheetByShipmentAwb);

  router.post('/deliverysheet', globalVerify, validasi.assignment.deliverySheet(), AssignmentController.saveDelivery);
  router.get('/deliverysheet/:id', globalVerify, AssignmentController.deliverySheetById);
  router.put('/deliverysheet/:id', globalVerify, validasi.assignment.deliverySheet(), AssignmentController.updateDelivery);
});
/**incoming */
router.group('/incoming', (router) => {
  router.get('/os', globalVerify, IncomingController.osIncoming);
  router.get('/os/:assignment_id/:manifest_id', globalVerify, IncomingController.getOsIncomingByAssignment);
  router.post('/confirm/:assignment_id/:manifest_id', globalVerify, validasi.assignment.incoming(), IncomingController.confirmIncomingByAssignmentByManifest);
});
/**STT */
router.group('/stt', (router) => {
  router.get('/return/check/:awb', globalVerify, STTController.sttAwbCheck);
  router.get('/return/origin/os', globalVerify, STTController.getSttReturnOs);
  router.get('/return/origin', globalVerify, STTController.getSttReturn);
  router.get('/return/branch/os', globalVerify, STTController.getSttReturnBranchOs);
  router.get('/return/branch', globalVerify, STTController.getSttReturnBranch);
  router.post('/return/branch/confirm/:stt_id/:awb', globalVerify, STTController.confirmSttBranch);
  router.post('/return/branch/unconfirm/:stt_id/:awb', globalVerify, STTController.unConfirmSttBranch);
  router.get('/return', globalVerify, STTController.getSttReturn);
  router.get('/return/:id', globalVerify, STTController.findById);
  router.post('/return', globalVerify, validasi.stt.return(), STTController.saveSttReturn);
  router.put('/return/:id', globalVerify, validasi.stt.return(), STTController.updateSttReturn);
  router.get('/customer', globalVerify, STTCustomerController.getSttReturnCustomer);
  router.get('/customer/:id', globalVerify, STTCustomerController.findById);
  router.get('/customer/check/:partner_id/:awb', globalVerify, STTCustomerController.sttAwbCheck);
  router.post('/customer', globalVerify, validasi.stt.customer(), STTCustomerController.saveSttReturn);
  router.put('/customer/:id', globalVerify, validasi.stt.customer(), STTCustomerController.updateSttReturn);
});
/** END OF STT */

router.group('/smu', (router) => {
  router.get('/sewagudang/:type', globalVerify,SMUController.smuSewaGudangView);
  router.get('/sewagudang/:type/:id', globalVerify,SMUController.smuSewaGudangId);
  router.post('/sewagudang/:type', globalVerify,validasi.smu.sewagudang(),SMUController.smuSewaGudangEntry);
  router.delete('/sewagudang/:id', globalVerify,SMUController.smuDeleteHargaSewaGudang);
  router.put('/sewagudang/:type/:id', globalVerify,validasi.smu.sewagudang(),SMUController.smuSewaGudangUpdate);
  router.get('/hargasewagudang/:type', globalVerify,SMUController.smuGetHargaSewaGudang);
  router.post('/hargasewagudang/:type', globalVerify,SMUController.smuSaveHargaSewaGudang);
})
/**INVOICE
 *
 *
 */
router.group('/invoice', (router) => {

});
/** END OF INVOICE */
/* master data */
router.group('/contact', (router) => {
  router.get('/:type', globalVerify, ContactController.getContact);
  router.post('/:type', globalVerify, validasi.contact(), ContactController.saveContact);
  router.get('/:type/:id', globalVerify, ContactController.getContactById);
  router.put('/:type/:id', globalVerify, validasi.contact(), ContactController.updateContact);
  router.put('/:type/:id/profile', globalVerify, FileController.updateProfilePicture);

  router.get('/:type/:id/subcontact', globalVerify, ContactController.getSubContact);
  router.get('/:type/:id/subcontact/count', globalVerify, ContactController.getSubContactCount);
  router.get('/:type/:id/price/filter', globalVerify, ContactController.getCustomerPricesByFiveKeys);
  router.post('/:type/:id/price', globalVerify, validasi.contactPrice(), ContactController.saveContactPrice);
  router.put('/:type/:id/price/:price_id', globalVerify, validasi.contactPrice(), ContactController.updateContactPrice);
  router.delete('/:type/:id/price/:price_id', globalVerify, validasi.contactPrice(), ContactController.deleteCustomerPrice);
});
router.group('/area', (router) => {
  /**COUNTRY */
  router.get('/country', globalVerify, AreaControlller.getCountry);
  router.post('/country', globalVerify, validasi.area.country(), AreaControlller.saveCountry);
  //   router.put('/country/:id',globalVerify, validasi.area.country(), AreaControlller.country.updateCountry)
  //   /**PROVINSI */
  router.get('/province', globalVerify, AreaControlller.getProvince);
  router.post('/province', globalVerify, validasi.area.province(), AreaControlller.saveProvince);
  router.put('/province/:id', globalVerify, validasi.area.province(), AreaControlller.updateProvince);
  /** HUB */
  router.get('/hub', globalVerify, AreaControlller.getHub);
  router.get('/hub/:hub_id', globalVerify, AreaControlller.getHubId);
  router.post('/hub', globalVerify, validasi.area.hub(), AreaControlller.saveHub);
  router.put('/hub/:id', globalVerify, validasi.area.hub(), AreaControlller.updateHub);
  router.get('/hub/:hub_id/detail', globalVerify, AreaControlller.getHubIdDetail);
  //  /**DESTINATION */
  router.get('/destination', globalVerify, AreaControlller.getDestination);
  router.get('/destination/:dest_id', globalVerify, AreaControlller.getDestinationId);
  router.get('/destination/hub/:hub_id', globalVerify, AreaControlller.getDestinationByHub);
  router.post('/destination', globalVerify, validasi.area.destination(), AreaControlller.saveDestination);
  router.put('/destination/:id', globalVerify, validasi.area.destination(), AreaControlller.updateDestination);
});
router.group('/master', (router) => {
  router.get('/moda', globalVerify, MasterController.getModa);
  router.get('/service', globalVerify, MasterController.getService);
  router.post('/service', globalVerify, MasterController.saveService);
  router.put('/service/:id', globalVerify, MasterController.updateService);
  router.delete('/service/:id', globalVerify, MasterController.deleteService);
  router.get('/uom', globalVerify, MasterController.getUom);
  router.post('/uom', globalVerify, MasterController.saveUom);
  router.put('/uom/:id', globalVerify, MasterController.saveUom);
  router.delete('/uom/:id', globalVerify, MasterController.deleteUom);
  router.get('/status-list', globalVerify, GlobalController.getStatusMain);
  router.get('/status-list-delivery', globalVerify, GlobalController.getStatusList);
  
  router.put('/bank/:id', globalVerify, MasterController.updateBank);
});
router.group('/notification', (router) => {
  router.get('/bell-notification', globalVerify, NotificationController.bellNotification);
});
module.exports = router;
