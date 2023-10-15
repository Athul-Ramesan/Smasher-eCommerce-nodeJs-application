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
        console.log('dashboard');
        res.render('admin/dashboard', { message: req.flash(), admin: true })
    },

    getAdminLogin: async (req, res) => {
        console.log('login get');
        res.render('admin/admin-login', { message: req.flash() })
    },
    postAdminLogin: async (req, res) => {
        try {
            console.log('inside');
            const admin = await adminModel.findOne({ email: req.body.email })
            if (!admin) {
                req.flash('adminLoginError', 'User name or password is incorrect')
                res.redirect('/admin/login')
            } else {
                if (req.body.password !== admin.password) {
                    req.flash('adminLoginError', 'User name or password is incorrect')
                    res.redirect('/admin/login')
                } else {
                    console.log('yeah');
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
    getAdminProduct: async (req, res) => {
        try {
            const products = await productModel.find({})
            res.render('admin/products', { products })
        } catch (error) {
            console.log(error);
        }

    },
    getAdminAddProdcuct: async (req, res) => {
        try {
            const categories = await categoryModel.find({})
            const brands = await brandModel.find({})
            console.log(categories);
            console.log(brands);
            res.render('admin/add-product', { categories, brands })
        } catch (error) {
            console.log(error);
        }
    },
    postAdminAddProduct: async (req, res) => {
        try {
            const {
                productName,
                description,
                details,
                specification,
                price,
                discountAmount,
                stock,
                category,
                subcategory,
                brand,
                tags
            } = req.body
            console.log(req.body);
            console.log(productName);
            console.log(category, 'category');

            const image1 = req.files['productImage1'][0].filename
            const image2 = req.files['productImage2'][0].filename
            const image3 = req.files['productImage3'][0].filename


            const newProduct = new productModel({
                name: productName,
                productImage1: image1,
                productImage2: image2,
                productImage3: image3,
                description: description,
                details: details,
                category: category,
                specificatios: specification,
                subcategory: subcategory,
                stock: stock,
                price: price,
                discountAmount: discountAmount,
                brand: brand,
                tags: tags
            });
            await newProduct.save()
                .then(savedProduct => {
                    console.log('Product saved:', savedProduct);
                }).catch(error => {
                    console.error('Error saving product:', error);
                });

            res.redirect('/admin/products')





        } catch (error) {
            console.log(error);
        }

    },
    getAdminEditProduct: async (req, res) => {
        try {
            console.log(req.params);
            const id = req.params.id
            const product = await productModel
                .findOne({ _id: id })
                .populate(CATEGORY)
                .populate(BRAND)


            console.log(product, 'category id');
            const categories = await categoryModel.find({});
            const brands = await brandModel.find({})
            res.render('admin/edit-product', { product, brands, categories })
        } catch (error) {
            console.log(error);
        }
    },
    getAdminHideProduct: async (req, res) => {
        try {
            const id = req.params.id;
            const product = await productModel.findOne({ _id: id });
            if (product.active) {
                const result = await productModel.updateOne({ _id: id }, { active: false })
                if (result.modifiedCount === 1) {
                    res.redirect('/admin/products')
                }
            } else {
                const result = await productModel.updateOne({ _id: id }, { active: true })
                if (result.modifiedCount === 1) {
                    res.redirect('/admin/products')
                }
            }
        } catch (error) {
            console.log(error);
        }

    },
    getAdminCategoriesAndBrands: async (req, res) => {
        try {

            const categories = await categoryModel.find({})
            const brands = await brandModel.find({})


            res.render('admin/categories', { categories, brands, message: req.flash() })
        } catch (error) {
            console.log(error);
        }

    },
    getAdminAddCategory: (req, res) => {

        res.render('admin/add-category')
    },
    postAdminAddCategory: async (req, res) => {
        try {
            console.log(req.body.category);
            const newCategory = new categoryModel({
                name: req.body.category
            })
            await newCategory.save();
            req.flash('categoryMessage', "New category added succesfully")
            res.redirect('/admin/categoriesAndBrands')
        } catch (error) {
            console.log(error);
        }

    },
    getAdminEditCategory: (req, res) => {
        try {
            res.render('admin/edit-category')

        } catch (error) {
            console.log(error);
        }

    },
    postAdminEditCategory: async (req, res) => {
        try {
            const id = req.query._id;
            await categoryModel.updateOne({ _id: id }, { name: req.body.name })
        } catch (error) {

        }
    },

    postAdminAddBrand: async (req, res) => {
        try {

            const newBrand = new brandModel({
                name: req.body.brand
            })
            await newBrand.save();
            req.flash('bandMessage', "New brand added succesfully")
            res.redirect('/admin/categoriesAndBrands')
        } catch (error) {
            console.log(error);
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
    getAdminLogout: async (req, res) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                }
                res.redirect('/admin/login');
            });
        } catch (error) {
            console.log(error);
        }

    }


}