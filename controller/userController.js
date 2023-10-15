const bcrypt = require("bcrypt");

const userModel = require('../models/userModel');
const otpModel = require('../models/otpModel')
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

        res.render('user/home', { user: req.session.user })

    },
    postSignup: async (req, res) => {
        try {
            let { name, email, password } = req.body;
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

                    console.log('isnide postlogin');
                    req.session.user = req.body
                    console.log(req.session);
                    res.redirect('/otpverification')
                }
            }

        } catch (error) {
            if (error) {
                console.log(error);
            }
        }
    },
    getSignup: (req, res) => {
        res.render('user/signup', { message: req.flash() })
    },

    getLogin: async (req, res) => {
        res.render('user/login', { message: req.flash() })
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
                            req.session.user = user;
                            console.log(req.session.user);

                            res.redirect('/home')
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
        res.render('user/forgot-password', { message: req.flash })
    },
    postForgotPassword: async (req, res) => {

        const email = req.body.email;
        console.log(email);
        const findUser = await userModel.findOne({ email: email })
        if (!findUser) {
            req.flash('verifyEmailError', 'please enter a valid email')
            res.redirect('/forgotPassword')
        } else {
            req.session.userEmail = email
            res.redirect('/otpVerificationPassword')
        }
    },
    getOtpVerificationPassword: async (req, res) => {
        const generatedOtp = await generateOtp();
        const email = req.session.userEmail
        sendMail.sendOtpVerificationEmail(generatedOtp, email);
        console.log(email);
        console.log("otp :", generatedOtp);

        res.render('user/otp-verification-password')
    },
    postOtpVerificationPassword: async (req, res) => {
        console.log('postotp');
        console.log(req.session.userEmail);
        const generatedOtp = await otpModel.findOne({ userEmail: req.session.userEmail })
        const enteredOtp = req.body.otp;
        console.log(enteredOtp, generatedOtp.otp);

        if (generatedOtp.otp === enteredOtp) {
            res.redirect('/home')
        }
    },


    getSendOtp: async (req, res) => {

        const generatedOtp = await generateOtp();
        const email = req.session.user.email
        sendMail.sendOtpVerificationEmail(generatedOtp, email);
        console.log(email);
        console.log("otp :", generatedOtp);

        res.render('otp-verification')

    },
    postSendOtp: async (req, res) => {
        console.log('postLogin');
        console.log(req.session.user);
        const generatedOtp = await otpModel.findOne({ userEmail: req.session.user.email })
        const enteredOtp = req.body.otp;
        console.log(enteredOtp, generatedOtp);

        if (generatedOtp.otp === enteredOtp) {
            const user = req.session.user

            const hashedPassword = await hash(user.password);

            await userModel.create({ name: user.name, email: user.email, password: hashedPassword })
            req.session.authUser = true
            res.redirect('/home')
        }
    },

    getLogout: (req, res) => {
        req.session.destroy();
        res.redirect('/home')
    }
}

