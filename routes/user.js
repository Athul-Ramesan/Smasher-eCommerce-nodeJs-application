const express = require('express');
const router = express.Router()

const userController = require('../controller/userController')
const productController = require('../controller/productController')
const auth = require('../middleware/authentication')
const cartController = require('../controller/cartController')

router.get('/', userController.landingPage)
router.get('/home', userController.home)    ///here auth auth.verifyUser,

router.get("/signup", userController.getSignup)
router.post("/signup", userController.postSignup);

router.get('/login', userController.getLogin)
router.post('/login', userController.postLogin)

router.get('/forgotpassword', userController.getForgotPassword)
router.post('/forgotpassword', userController.postForgotPassword)

router.get('/resendOtpPassword',userController.getResendOtpPassword)

router.get('/setNewPassword',userController.getSetNewPassword)
router.post('/setNewPassword',userController.postSetNewPassword)

router.get('/otpverification', userController.getSendOtp)
router.post('/otpverification', userController.postSendOtp)


router.get('/otpVerificationPassword', userController.getOtpVerificationPassword)
router.post('/otpVerificationPassword', userController.postOtpVerificationPassword)
router.get('/resendOtp', userController.getSendOtp)


router.get('/productView/:id',productController.getProductView) ///here auth auth.verifyUser,

router.get('/shopProduct', productController.getShopProduct) ///here auth auth.verifyUser,

router.get('/cart',cartController.getCart)

router.get('/addToCart/:id',cartController.getAddToCart)



router.get('/logout', userController.getLogout)
module.exports = router
