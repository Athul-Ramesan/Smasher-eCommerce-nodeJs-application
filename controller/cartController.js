const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel');


const cartService = require('../services/cartService')

module.exports = {
    getAddToCart: async (req, res) => {
        try {
            const productId = req.params.id;

            console.log('inside getaddtocart');
            const user = await userModel.findOne({ email: req.session.user.email });
            console.log('user', user);
            let userCart = await cartModel.findOne({ userId: user._id })
            if (!userCart) {
                
                console.log('no user cart');    
                userCart = await cartModel.create({ userId: user._id, items: [{productId: productId, quantity: 1}] })
                const cartCount = userCart.items.length
                 res.json({ success: true, cartCount })

            }else{
                const existingCart = userCart.items.find(item => item.productId.equals(productId))
            
                console.log('inside else');
                if (existingCart) {
    
                    console.log(' existingCart', existingCart);
                    existingCart.quantity += 1
                    console.log(userCart);
    
                }else{
                    userCart.items.push({productId:productId, quantity: 1})
                } 
                console.log('userCart', userCart);
                await cartModel.findOneAndUpdate({ userId: user._id }, userCart)
                const cartCount = userCart.items.length
                res.json({ success: true, cartCount })
            }

            
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, error: 'error adding to cart' })
        }



    },
    getCart: async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.session.user.email })
            
            await cartService.calculateCartTotal(req.session.user._id)
            const cart = await cartModel.findOne({ userId: user._id }).populate('items.productId')

            const products = await productModel.find({})
            console.log(cart);

            res.render('user/cart', { user, products, cart, wishlist: false })

        } catch (error) {
            console.log(error);
            res.render('user/404')
        }
    },

    postUpdateCartQuantity: async (req, res) => {
        try {
            const productId = req.body.productId;
            
            
           
            const netChange = req.body.quantity;
          
            const cart = await cartModel.findOne({ userId: req.session.user._id })

            if (!cart) {
                throw new Error('cart not found')
            }
            const itemToUpdate = await cart.items.find(item => item.productId.equals(productId))

            const quantity = itemToUpdate.quantity
         
            const newQuantity = quantity + parseInt(netChange)
            itemToUpdate.quantity = newQuantity;
            await cart.save()

            const totalAmount = await cartService.calculateCartTotal(req.session.user._id)

            
            const product = await productModel.findById(productId)
            console.log(product, 'product');
            const stock = product.stock;
            res.json({
                success: true,
                newQuantity,
                totalAmount,
                stock
            })
        } catch (error) {
            throw error;
        }
    },
    getRemoveFromCart: async (req, res) => {
        const productId = req.params.id;
        try {
            await cartModel.findOneAndUpdate(
                { userId: req.session.user._id },
                {
                    $pull: {
                        items: {
                            productId: productId
                        }
                    }
                },
                { new: true }
            ).then(() => {
                res.redirect('/cart')
            }).catch((error)=>{
                console.log(error);
            })
        } catch (error) {
            console.log(error);
        }


    }
}