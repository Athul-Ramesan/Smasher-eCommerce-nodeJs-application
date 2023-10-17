const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const brandModel = require('../models/brandModel')
const { CATEGORY, BRAND } = require('../utils/constants/schemaName')
const moment = require('moment')

module.exports = {

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
                stock: stock,
                price: price,
                discountAmount: discountAmount,
                brand: brand,
                tags: tags,
                createdAt : moment(new Date()).format('MMMM Do YYYY, h:mm:ss a')
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
    
    postAdminEditProduct : async(req,res)=>{
        try {
            const productId= req.params.id
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


            await productModel.findOneAndUpdate({_id:productId},
                {$set: {
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
                tags: tags,
                createdAt : moment(new Date()).format('MMMM Do YYYY, h:mm:ss a')

            }})
            
            

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
        try {
            const productId = req.params.id;
            const product = await productModel.findOne({ _id: productId }).populate('brand')
            console.log(product);
            res.render('user/product-view', { user: req.session.user, product })
        } catch (error) {
            console.log(error);
        }
    },
    getShopProduct: async (req, res) => {
        try {
            const products = await productModel.find()
            
            res.render('user/shop-product', { products, user: req.session.user })
        } catch (error) {
            console.log(error);
        }
    }
}