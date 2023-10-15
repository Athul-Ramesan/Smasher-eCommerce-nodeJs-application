const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const otpModel = require('../models/otpModel');





module.exports = {
    sendOtpVerificationEmail: async (otp, email) => {
        try {

            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'dev.athulrameshan@gmail.com',
                    pass: 'ywhl okqn coww shmy',
                }
            });
            //mail options

            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Verify Your Email",
                html: `<p> Enter <b> ${otp} <b> in the app to verify your email address and complete the signup.<p> <b>This code <b> expires in 1 hour <b> <p>`
            };



            // const hashedOtp = await bcrypt.hash(otp, 10)

            await otpModel.create({
                userEmail: email,
                otp: otp,
                createdAt: Date.now(),
                expiresAt: Date.now() + 1000 * 60 * 60
            })
            setTimeout(() => {
                otpModel.deleteOne({ userEmail: email }).then(() => {
                    console.log('otp doc deleted successfully');
                }).catch((error) => {
                    console.log(error);
                })
            }, 30000)
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            }).then(() => {
                console.log('mailed');
            })
        } catch (error) {
            if (error) {
                console.log(error);
            }
        }
    }
}





