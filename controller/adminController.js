const adminModel = require('../models/adminModel');
const categoryModel = require('../models/categoryModel')
const brandModel = require('../models/brandModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const { CATEGORY, BRAND } = require('../utils/constants/schemaName')


module.exports = {
    adminLandingPage: (erq, res) => {
        res.redirect('/admin/dashboard')
    },
    getAdminDashboard: (req, res) => {
        console.log(req.session);
        res.render('admin/dashboard', { message: req.flash(), admin: true })
    },

    getAdminLogin: async (req, res) => {
        try {
            if (req.session.adminId) {
                res.redirect('/admin/dashboard')
            } else {
                res.render('admin/admin-login', { message: req.flash() })
            }

        } catch (error) {

        }

    },
    postAdminLogin: async (req, res) => {
        try {

            const admin = await adminModel.findOne({ email: req.body.email })
            if (!admin) {
                req.flash('adminLoginError', 'User name or password is incorrect')
                res.redirect('/admin/login')
            } else {
                if (req.body.password !== admin.password) {
                    req.flash('adminLoginError', 'User name or password is incorrect')
                    res.redirect('/admin/login')
                } else {

                    const adminId = admin._id;
                    req.session.adminId = adminId

                    res.redirect('/admin/dashboard')
                }

            }

        } catch (error) {
            console.log(error);
        }
    },
    getOtp: async (req, res) => {
        res.render('otp-verification', { message: req.flash() });
    },
    postOtp: async (req, res) => {
        try {

        } catch (error) {

        }
    },









    getCustomers: async (req, res) => {
        try {

            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 10; // Number of items per page
            const skip = (page - 1) * perPage;

            const users = await userModel.find().skip(skip).limit(perPage);
            const totalCount = await userModel.countDocuments();
            console.log(users);

            res.render("admin/customers", {
                users,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage)
            })


        } catch (error) {

        }

    },
    getAdminBlockUser: async (req, res) => {
        try {
            console.log(req.params);
            const id = req.params.id;
            const user = await userModel.findOne({ _id: id })

            if (user.status === 'Active') {
                const result = await userModel.updateOne({ _id: id }, { status: 'Blocked' })
                // console.log(result); 
                if (result.modifiedCount === 1) {
                    res.redirect('/admin/customers')
                }
            } else {
                const result = await userModel.updateOne({ _id: id }, { status: 'Active' })
                if (result.modifiedCount === 1) {
                    res.redirect('/admin/customers')
                }
            }



        } catch (error) {
            console.log(error);
        }

    },
    liveSearchUser: async (req, res) => {
        const query = req.query.q
        try {
            console.log(query);
            const users = await userModel.find(
                {
                    name:
                        { $regex: query, $options: 'i' }
                }
            )
            res.json({ users })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred while searching users' })
        }
    },
    // liveSearchProduct :async(req,res)=>{
    //     const query = req.query.q;
    //     try {
    //         const products = await productModel.find({name: 
    //             {$regex :query, $options: 'i'}})
    //             res.json({products})
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).json({ error: 'An error occurred while searching products' })
    //     }
    // },
    getAdminLogout: async (req, res) => {
        try {
            req.session.adminId = null
            res.redirect('/admin/login')
        } catch (error) {
            console.log(error);
        }

    }


}