const express = require('express');
const router = express.Router()
const adminController = require('../controller/adminController')
const upload = require('../middleware/uploadImages')
const auth = require('../middleware/authentication');
const productController = require('../controller/productController')
const categoryController = require('../controller/categoryController')
const brandController = require('../controller/brandController')


router.get('/', adminController.adminLandingPage)
router.get('/dashboard', auth.verifyAdmin, adminController.getAdminDashboard)
router.get('/login', adminController.getAdminLogin)
router.post('/login', adminController.postAdminLogin)

router.get('/products', auth.verifyAdmin, productController.getAdminProduct)
router.get('/live-product-search',adminController.liveSearchProduct)

router.get('/addProduct', auth.verifyAdmin, productController.getAdminAddProdcuct)

router.post('/addproduct', upload.fields([
    { name: "productImage1", maxCount: 1 },
    { name: "productImage2", maxCount: 1 },
    { name: "productImage3", maxCount: 1 }
]), productController.postAdminAddProduct)

router.get('/editProduct/:id', auth.verifyAdmin, productController.getAdminEditProduct)

router.post('/editProduct/:id', upload.fields([
    { name: "productImage1", maxCount: 1 },
    { name: "productImage2", maxCount: 1 },
    { name: "productImage3", maxCount: 1 }
]), productController.postAdminEditProduct)

router.get('/hideProduct/:id', auth.verifyAdmin, productController.getAdminHideProduct)

router.get('/categoriesAndBrands', auth.verifyAdmin, categoryController.getAdminCategoriesAndBrands)


router.post('/addCategory', categoryController.postAdminAddCategory)


router.post('/addBrand', brandController.postAdminAddBrand)

router.get('/editBrand/:id', auth.verifyAdmin, brandController.getAdminEditBrand)
router.post('/editBrand/:id', brandController.postAdminEditBrand)

router.get('/editCategory/:id', auth.verifyAdmin, categoryController.getAdminEditCategory)
router.post('/editCategory/:id', categoryController.postAdminEditCategory)


router.get('/customers', auth.verifyAdmin, adminController.getCustomers)
router.get('/blockUser/:id', auth.verifyAdmin, adminController.getAdminBlockUser)
router.get('/live-user-search',adminController.liveSearchUser)
router.get('/logout', adminController.getAdminLogout)
module.exports = router