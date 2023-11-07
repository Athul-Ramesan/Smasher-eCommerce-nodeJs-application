const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const cartModel = require('../models/cartModel')
const brandModel = require('../models/brandModel')
const { CATEGORY, BRAND } = require('../utils/constants/schemaName')
const moment = require('moment')
const userModel = require('../models/userModel')

module.exports = {

    getAdminProduct: async (req, res) => {
        const itemsPerPage = 10;
        const currentPage =parseInt( req.query.page) || 1;
        const skip = (currentPage - 1) * itemsPerPage;
        try {
            totalItems = await productModel.countDocuments();
            const totalPages = Math.ceil(totalItems / itemsPerPage)
            console.log(totalPages);

            const products = await productModel
            .find()
            .skip(skip)
            .limit(itemsPerPage)


            const formatedProducts = products.map(doc=>({
                ...doc.toObject(),
                createdAt : moment(doc.createdAt).format('MMMM Do YYYY, h:mm:ss a'),
            }))
            res.render('admin/products', { 
                products :formatedProducts,
                totalPages,
                currentPage,
                title : "Admin-products"
             })
        } catch (error) {
            console.log(error);
        }

    },
    postAdminSearchProduct: async (req, res) => {
        const query = req.body.query;
        console.log(req.body);
        try {
            await productModel.find({

                name: { $regex: '^' + query, $options: 'i' }

            }).then((result) => {
                if (result !== null) {
                    const products = result;
                    console.log(result);
                    res.render('admin/products', { products })
                } else {

                }

            })
        } catch (error) {
            console.log(error);
        }
    },
    getAdminAddProdcuct: async (req, res) => {
        try {
            const categories = await categoryModel.find({})
            const brands = await brandModel.find({})

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
                stock: Math.abs(stock),
                price: Math.abs(price),
                discountAmount: Math.abs(discountAmount),
                brand: brand,
                tags: tags,
                createdAt: new Date()
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

            const id = req.params.id
            const product = await productModel
                .findOne({ _id: id })
                .populate(CATEGORY)
                .populate(BRAND)



            const categories = await categoryModel.find({});
            const brands = await brandModel.find({})
            res.render('admin/edit-product', { product, brands, categories })
        } catch (error) {
            console.log(error);
        }
    },

    postAdminEditProduct: async (req, res) => {
        try {
            const productId = req.params.id
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



           
                const image1 = req.files['productImage1'][0].filename
                const image2 = req.files['productImage2'][0].filename
                const image3 = req.files['productImage3'][0].filename
                    


            await productModel.findOneAndUpdate({ _id: productId },
                {
                    $set: {
                        name: productName,
                        productImage1: image1,
                        productImage2: image2,
                        productImage3: image3,
                        description: description,
                        details: details,
                        category: category,
                        specificatios: specification,
                        subcategory: subcategory,
                        stock: Math.abs(stock),
                        price: Math.abs(price),
                        discountAmount: Math.abs(discountAmount),
                        brand: brand,
                        tags: tags
                        

                    }
                })



            res.redirect('/admin/products')


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
    getProductView: async (req, res) => {
        const productId = req.params.id;
        try {
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id });
            const product = await productModel.findOne({ _id: productId }).populate('brand')

            console.log(product);
            res.render('user/product-view', { user, product, cart, wishlist: false })
        } catch (error) {
            console.log(error);
        }
    },
    getShopProduct: async (req, res) => {
        const itemsPerPage = 5;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * itemsPerPage;
        try {
            const totalitems = await productModel.countDocuments();
            const totalPages = Math.ceil(totalitems / itemsPerPage)



            const products = await productModel
                .find({ active: true })
                .skip(skip)
                .limit(itemsPerPage)

            const categories = await categoryModel.find()
            const brands = await brandModel.find()

            if (req.session.user) {
                const user = await userModel.findById(req.session.user._id)
                const cart = await cartModel.findOne({ userId: req.session.user._id })
                res.render('user/shop-product', {
                    currentPage,
                    totalPages,
                    products,
                    user,
                    brands,
                    cart,
                    categories,
                    wishlist: false,
                    message: req.flash()
                })
            } else {
                res.render('user/shop-product', {
                    currentPage,
                    totalPages,
                    products,
                    brands,
                    categories,
                    user: req.session.user,
                    cart: false,
                    wishlist: false,
                    message: req.flash()
                })
            }

        } catch (error) {
            console.log(error);
        }
    },
    postFilterProdcuts: async (req, res) => {
        const itemsPerPage = 5;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * itemsPerPage;

        const brand = req.body.brand;
        const category = req.body.category

        try {
            const totalitems = await productModel.countDocuments();
            const totalPages = Math.ceil(totalitems / itemsPerPage)


            const categories = await categoryModel.find()
            const brands = await brandModel.find()

            if (req.session.user) {
                if (brand && category) {
                    const products = await productModel.find({ brand: brand, category: category, active: true })
                    console.log(products);
                    const user = await userModel.findById(req.session.user._id)
                    const cart = await cartModel.findOne({ userId: req.session.user._id })

                    res.render('user/shop-product', {
                        currentPage,
                        totalPages,
                        products,
                        user,
                        cart,
                        message: req.flash(),
                        brands,
                        categories,
                        wishlist: false
                    })

                } else if (brand || category) {
                    const products = await productModel.find({
                        $and: [{ active: true },
                        {
                            $or:
                                [{ category: category }, { brand: brand }]
                        }
                        ]
                    })
                    console.log(products);
                    const user = await userModel.findById(req.session.user._id)
                    const cart = await cartModel.findOne({ userId: req.session.user._id })
                    res.render('user/shop-product', {
                        currentPage,
                        totalPages,
                        products,
                        user,
                        cart,
                        brands,
                        categories,
                        wishlist: false,
                        message: req.flash()
                    })
                }
            } else {
                if (brand && category) {
                    const products = await productModel.find({ brand: brand, category: category ,active:true})
                    console.log(products);

                    res.render('user/shop-product', {
                        currentPage,
                        totalPages,
                        products,
                        user: false,
                        cart: false,
                        brands,
                        categories,
                        wishlist: false,
                        message: req.flash()
                    })

                } else if (brand || category) {
                    const products = await productModel.find({
                        $or:
                            [{ category: category }, { brand: brand }]


                    })
                    console.log(products);
                    res.render('user/shop-product', {
                        currentPage,
                        totalPages,
                        products,
                        user: false,
                        cart: false,
                        brands,
                        categories,
                        wishlist: false,
                        message: req.flash()
                    })
                }
            }


        } catch (error) {
            console.log(error);
        }
    },
    postSearchProduct: async (req, res) => {
        const query = req.body.query;
        try {
            await productModel.find({
                $or: [
                    { name: { $regex: '^' + query, $options: 'i' } },
                    { tags: { $regex: '^' + query, $options: 'i' } }
                ]
            }).then(async (result) => {
                console.log(result);
                if (result.length !== 0 && query.length > 0) {


                    const products = result
                    const categories = await categoryModel.find()
                    const brands = await brandModel.find()

                    if (req.session.user) {
                        const user = await userModel.findById(req.session.user._id)
                        const cart = await cartModel.findOne({ userId: req.session.user._id })
                        res.render('user/shop-product', { products, user, brands, cart, categories, wishlist: false, message: req.flash() })
                    } else {
                        res.render('user/shop-product', { products, brands, categories, user: req.session.user, cart: false, wishlist: false, message: req.flash() })
                    }

                } else {
                    req.flash('productSearchMessage', '! No item found as per your request')
                    res.redirect('/shopProduct')
                }
            }).catch(error => console.log(error))
        } catch (error) {
            console.log(error);
        }
    }
}