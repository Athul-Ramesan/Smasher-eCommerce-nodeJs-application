const bcrypt = require("bcrypt");

const userModel = require('../models/userModel');
const productModel = require('../models/productModel')
const otpModel = require('../models/otpModel')
const cartModel = require('../models/cartModel')
const sendMail = require('../validators/nodeMailer')
const generateOtp = require('../validators/generateOtp');
const session = require("express-session");

const hash = (password) => {
    try {
        return bcrypt.hash(password, 10);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {

    landingPage: async (req, res) => {
        res.redirect('/home')
    },
    home: async (req, res) => {
        const products =await productModel.find({});
      
        if (req.session && req.session.user) {
           
            const id = req.session.user._id
            const cart =await cartModel.findOne({userId : id})
            console.log(cart,'cart');
            res.render('user/home', { user: req.session.user, products, cart, wishlist:false });
        } else {
            res.render('user/home', { user: false })
        }


    },
    postSignup: async (req, res) => {
        try {
            let { name, email, password, confirmPassword } = req.body;
            name = name.trim()
            email = email.trim()
            password = password.trim()


            if (name == "" || email == "" || password == "") {
                req.flash('userSignupError', 'Empty input fields')
                res.redirect('/signup')
            } else if (!/^[A-Za-z\s'-]+$/.test(name)) {
                req.flash('userSignupError', 'Invalid Name entered')
                res.redirect('/signup')
            } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
                req.flash('userSignupError', 'Invalid email entered')
                res.redirect('/signup')
            } else if (password.length < 8) {
                req.flash('userSignupError', 'Password is too short')
                res.redirect('/signup')
            } else {

                const findUser = await userModel.findOne({ email: req.body.email })
                if (findUser) {
                    req.flash('userSignupError', 'user already exists')
                    res.redirect('/signup')
                } else {
                    if (password !== confirmPassword) {
                        req.flash('userSignupError', 'Password do not match')
                        res.redirect('/signup')
                    } else {

                        req.session.user = req.body
                        console.log(req.session);
                        res.redirect('/otpverification')
                    }

                }
            }

        } catch (error) {
            if (error) {
                console.log(error);
            }
        }
    },
    getSignup: (req, res) => {
        try {
            if (req.session.user) {
                res.redirect('/home')
            } else {
                res.render('user/signup', { message: req.flash() })
            }

        } catch (error) {
            console.log(error);
        }

    },

    getLogin: async (req, res) => {
        try {
            if (req.session.user) {
                res.redirect('/home')
            } else {
                res.render('user/login', { message: req.flash() })
            }

        } catch (error) {
            console.log(error);
            res.render('user/404')
        }

    },
    postLogin: async (req, res) => {
        try {
            let { email, password } = req.body;
            email = email.trim();
            password = password.trim();

            if (email == "" || password == "") {
                req.flash('userLoginError', 'Empty input fields')
                res.redirect('/login')
            } else {
                const user = await userModel.findOne({ email: req.body.email });

                if (!user) {
                    req.flash('userLoginError', 'Email or Password is invalid')
                    res.redirect('/login')
                } else {


                    bcrypt.compare(req.body.password, user.password, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else if (result) {
                            if (user.status === 'Active') {
                                req.session.user = user;

                                console.log(user);
                                res.redirect('/home')
                            } else {
                                req.flash('userLoginError', 'You have been blocked')
                                res.redirect('/login')
                            }
                        } else {
                            req.flash('userLoginError', 'Email or Password is invalid')
                            res.redirect('/login')
                        }
                    })
                }
            }


        } catch (error) {
            if (error) {
                console.log(error);
            }
        }
    },
    getForgotPassword: async (req, res) => {
        res.render('user/forgot-password', { message: req.flash() })
    },
    postForgotPassword: async (req, res) => {

        const email = req.body.email;
        console.log(email);
        const findUser = await userModel.findOne({ email: email })
        if (!findUser) {
            req.flash('verifyEmailError', 'please enter a valid email')
            res.redirect('/forgotPassword')
        } else if (findUser.status === 'Blocked') {
            console.log(findUser);
            req.flash('verifyEmailError', 'Your account has been blocked !')
            res.redirect('/forgotPassword')
        } else {

            req.session.userEmail = email
            console.log(req.session);
            res.redirect('/otpVerificationPassword')
        }
    },
    getOtpVerificationPassword: async (req, res) => {
        const generatedOtp = await generateOtp();
        const email = req.session.userEmail
        sendMail.sendOtpVerificationEmail(generatedOtp, email);
        console.log(email);
        console.log("otp :", generatedOtp);

        res.render('user/otp-verification-password', { message: req.flash() })
    },
    postOtpVerificationPassword: async (req, res) => {
        try {
            console.log('postotp');
            console.log(req.session.userEmail);
            const generatedOtp = await otpModel.findOne({ userEmail: req.session.userEmail })
            const enteredOtp = req.body.otp;

            console.log(enteredOtp, generatedOtp.otp);

            if (generatedOtp.otp === enteredOtp) {

                res.redirect('/setNewPassword')
            } else if (generatedOtp.otp !== enteredOtp) {

                req.flash('otpError', 'Failed to match otp')
                res.redirect('/otpVerificationPassword')
            }
        } catch (error) {
            console.log(error);
        }
    },
    getSetNewPassword: (req, res) => {
        try {
            res.render('user/new-password', { message: req.flash() })
        } catch (error) {
            console.log(error);
        }
    },
    postSetNewPassword: async (req, res) => {

        try {
            const { newPassword, confirmPassword } = req.body
            const email = req.session.userEmail
            const user = await userModel.findOne({ email: email })

            console.log(user);


            if (newPassword === confirmPassword) {
                const hashedNewPassword = await bcrypt.hash(newPassword, 10)
                await userModel.findOneAndUpdate({ email: email }, { password: hashedNewPassword })

                req.session.user = user
                console.log(req.session);
                res.redirect('/home')
            } else {
                req.flash("newPasswordError", "Password matching failed")
                res.redirect('/setNewPassword')
            }



        } catch (error) {
            console.log(error);
        }
    },

    getResendOtpPassword: async (req, res) => {
        const generatedOtp = await generateOtp();
        console.log(req.session);
        const email = req.session.userEmail
        sendMail.sendOtpVerificationEmail(generatedOtp, email);
        console.log(email);
        console.log("otp :", generatedOtp);

        res.render('user/otp-verification-password')
    },
    getSendOtp: async (req, res) => {

        const generatedOtp = await generateOtp();
        const email = req.session.user.email
        sendMail.sendOtpVerificationEmail(generatedOtp, email);
        console.log(email);
        console.log("otp :", generatedOtp);

        res.render('otp-verification', { message: req.flash() })

    },
    postSendOtp: async (req, res) => {
        try {
            const generatedOtp = await otpModel.findOne({ userEmail: req.session.user.email })
            const enteredOtp = req.body.otp;
            console.log(enteredOtp, generatedOtp);

            if (generatedOtp.otp === enteredOtp) {
                const user = req.session.user
                console.log('req.session before signup ', req.session);
                const hashedPassword = await hash(user.password);

                await userModel.create({ name: user.name, email: user.email, password: hashedPassword })

                const newUser = await userModel.findOne({ email: user.email })
                req.session.user = newUser

                res.redirect('/home')
            } else if (generatedOtp.otp !== enteredOtp) {
                req.flash('otpError', 'Failed to match otp')
                res.redirect('/otpverification')
            }
        } catch (error) {
            console.log(error);
        }


    },

    getLogout: (req, res) => {
        req.session.user = null;
        req.session.userId = null;
        res.redirect('/home')
    }
}

