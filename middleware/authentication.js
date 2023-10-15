const adminModel = require('../models/adminModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')


module.exports = {
    verifyAdmin: (req, res, next) => {
        if (req.session && req.session.adminId) {
            next()
        } else {

            res.redirect('/admin/login')
        }
    },
    verifyUser: async (req, res, next) => {
        const user = await userModel.find({ _id: req.session.userId })
        const products = await productModel.find({})
        if (req.session && req.session.userId) {

            if (user.status === 'Active') {
                req.session.user = false;

                res.render('user/index', { products })
            }
            next();
        } else {
            res.render('user/index')
        }

    }
}

