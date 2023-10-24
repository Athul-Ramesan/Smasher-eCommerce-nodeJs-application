const express = require('express');
const router = express.Router()

const userController = require('../controller/userController')
const productController = require('../controller/productController')
const auth = require('../middleware/authentication')
const cartController = require('../controller/cartController')
const addressController = require('../controller/addressController')


router.get('/', userController.landingPage)
router.get('/home',auth.verifyUser,userController.home)    ///here auth auth.verifyUser,

router.get("/signup", userController.getSignup)
router.post("/signup", userController.postSignup);

router.get('/login', userController.getLogin)
router.post('/login', userController.postLogin)

router.get('/forgotpassword', userController.getVerifyEmail)
router.post('/forgotpassword', userController.postVerifyEmail)

// router.get('/resendOtpPassword',userController.getResendOtpPassword)

router.get('/setNewPassword',userController.getSetNewPassword)
router.post('/setNewPassword',userController.postSetNewPassword)

router.get('/otpverification', userController.getVerifyOtp)
router.post('/otpverification', userController.postVerifyOtp)



router.get('/otpVerificationPassword', userController.getOtpVerificationPassword)
router.post('/otpVerificationPassword', userController.postOtpVerificationPassword)
router.get('/resendOtp', userController.resendOtp)


router.get('/productView/:id',auth.verifyUser,productController.getProductView) ///here auth auth.verifyUser,

router.get('/shopProduct',auth.verifyUser, productController.getShopProduct) ///here auth auth.verifyUser,

router.get('/cart',auth.verifyUser,cartController.getCart)

router.post('/addToCart/:id',cartController.getAddToCart)
router.post('/updateCartQuantity',cartController.postUpdateCartQuantity)
router.get('/removeFromCart/:id',cartController.getRemoveFromCart)

router.get('/profile',auth.auth, userController.getProfile)


router.post('/changePassword',userController.postChangePassword)

router.get('/address',auth.auth,addressController.getAddress)
router.get('/addAddress',auth.auth,addressController.getAddAddress)
router.post('/addAddress',addressController.postAddAddress)

router.get('/checkout',auth.auth,auth.verifyUser,userController.checkout)

router.get('/logout', userController.getLogout)
module.exports = router

