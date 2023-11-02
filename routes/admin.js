const express = require('express');
const router = express.Router()
const adminController = require('../controller/adminController')
const upload = require('../middleware/uploadImages')
const auth = require('../middleware/authentication');
const productController = require('../controller/productController')
const categoryController = require('../controller/categoryController')
const brandController = require('../controller/brandController')
const orderController = require('../controller/orderController')


router.get('/login', adminController.getAdminLogin)
router.post('/login', adminController.postAdminLogin)


router.use(auth.verifyAdmin)   // protecting admin routes

router.get('/', adminController.adminLandingPage)
router.get('/dashboard',  adminController.getAdminDashboard)

router.get('/products',  productController.getAdminProduct)
router.post('/adminSearchProduct', productController.postAdminSearchProduct)

router.get('/addProduct',  productController.getAdminAddProdcuct)

router.post('/addproduct', upload.fields([
    { name: "productImage1", maxCount: 1 },
    { name: "productImage2", maxCount: 1 },
    { name: "productImage3", maxCount: 1 }
]), productController.postAdminAddProduct)

router.get('/editProduct/:id',  productController.getAdminEditProduct)

router.post('/editProduct/:id', upload.fields([
    { name: "productImage1", maxCount: 1 },
    { name: "productImage2", maxCount: 1 },
    { name: "productImage3", maxCount: 1 }
]), productController.postAdminEditProduct)

router.get('/hideProduct/:id',  productController.getAdminHideProduct)

router.get('/categoriesAndBrands',  categoryController.getAdminCategoriesAndBrands)


router.post('/addCategory', categoryController.postAdminAddCategory)


router.post('/addBrand', brandController.postAdminAddBrand)

router.get('/editBrand/:id',  brandController.getAdminEditBrand)
router.post('/editBrand/:id', brandController.postAdminEditBrand)

router.get('/editCategory/:id',  categoryController.getAdminEditCategory)
router.post('/editCategory/:id', categoryController.postAdminEditCategory)


router.get('/customers',  adminController.getCustomers)
router.get('/blockUser/:id',  adminController.getAdminBlockUser)
router.post('/adminSearchUser', adminController.postAdminSearchUser)

router .get('/orders',orderController.getAdminOrders)
router .get('/orderDetails/:id',orderController.getAdminOrderDetails)
router.put('/updateOrderStatus',orderController.putAdminUpdateOrderStatus)

router.get('/logout', adminController.getAdminLogout)
module.exports = router