const express = require('express');
const router = express.Router()
const User = require('../models/userModel');
const userController = require('../controller/userController')
const productController = require('../controller/productController')
router.get('/', userController.landingPage)
router.get('/home', userController.home)

router.get("/signup", userController.getSignup)
router.post("/signup", userController.postSignup);

router.get('/login', userController.getLogin)
router.post('/login', userController.postLogin)
router.get('/forgotpassword', userController.getForgotPassword)
router.post('/forgotpassword', userController.postForgotPassword)

router.get('/otpverification', userController.getSendOtp)
router.post('/otpverification', userController.postSendOtp)

router.get('/otpVerificationPassword', userController.getOtpVerificationPassword)
router.post('/otpVerificationPassword', userController.postOtpVerificationPassword)
router.get('/resendOtp', userController.getSendOtp)


router.get('/productView/:id', productController.getProductView)

router.get('/shopProduct', productController.getShopProduct)




router.get('/logout', userController.getLogout)
module.exports = router
