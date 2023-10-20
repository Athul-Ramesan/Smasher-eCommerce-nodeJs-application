const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')

module.exports = {
    getAddToCart: async (req, res) => {
        try {
            const productId = req.params.id;
         
            
            
            const user = await userModel.findOne({ email: req.session.user.email });
            console.log('user',user);
            let userCart = await cartModel.findOne({ userId: user._id })
            if (!userCart) {

                console.log('no user cart');
                userCart = await cartModel.create({ userId: user._id, items: [] })

            }

            const existingCart= userCart.items.find(item => item.productId.equals(productId) )
            console.log('userCart.items',userCart.items);
            console.log('productId',productId);
            
            if (existingCart ) {

                console.log(' existingCart',existingCart);
                existingCart.quantity += 1
                console.log(userCart);
                
            } else {
                console.log('push');
                userCart.items.push({ productId: productId, quantity: 1 })
            }
            console.log('userCart',userCart);
            await cartModel.findOneAndUpdate({userId:user._id} , userCart)
           const cartCount = userCart.items.length
            res.json({ success: true ,cartCount})
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, error: 'error adding to cart' })
        }



    },
    getCart: async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.session.email })
            const cart = await cartModel.find({}).populate('items.productId')
            console.log(cart);
            const products = await productModel.find({})
            res.render('user/cart', { user ,products,cart})
        } catch (error) {
            console.log(error);
            res.render('user/404')
        }
    }
}