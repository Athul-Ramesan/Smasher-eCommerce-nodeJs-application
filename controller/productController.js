const productModel = require('../models/productModel')

module.exports = {
    getProductView: async (req, res) => {
        try {
            const productId = req.params.id;
            const product = await productModel.findOne({ _id: productId }).populate('brand')
            console.log(product);
            res.render('user/product-view', { user: true, product })
        } catch (error) {

        }
    },
    getShopProduct: async (req, res) => {
        try {
            const products = await productModel.find()

            res.render('user/shop-product', { products, user: true })
        } catch (error) {
            console.log(error);
        }
    }
}