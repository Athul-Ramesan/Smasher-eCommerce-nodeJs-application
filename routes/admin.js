const express = require('express');
const router = express.Router()
const adminController = require('../controller/adminController')
const upload = require('../middleware/uploadImages')
const Auth = require('../middleware/authentication');


router.get('/', adminController.adminLandingPage)
router.get('/dashboard', adminController.getAdminDashboard)
router.get('/login', adminController.getAdminLogin)
router.post('/login', adminController.postAdminLogin)

router.get('/products', adminController.getAdminProduct)

router.get('/addproduct', adminController.getAdminAddProdcuct)
router.post('/addproduct', upload.fields([
    { name: "productImage1", maxCount: 1 },
    { name: "productImage2", maxCount: 1 },
    { name: "productImage3", maxCount: 1 }
]), adminController.postAdminAddProduct)
router.get('/editProduct/:id', adminController.getAdminEditProduct)
router.get('/hideProduct/:id', adminController.getAdminHideProduct)
router.get('/categoriesAndBrands', adminController.getAdminCategoriesAndBrands)

router.get('/addCategory', adminController.getAdminAddCategory)
router.post('/addCategory', adminController.postAdminAddCategory)

router.post('/addBrand', adminController.postAdminAddBrand)

router.get('/edit/:id', adminController.getAdminEditCategory)
router.get('/customers', adminController.getCustomers)
router.get('/blockUser/:id', adminController.getAdminBlockUser)

router.get('/logout', adminController.getAdminLogout)
module.exports = router