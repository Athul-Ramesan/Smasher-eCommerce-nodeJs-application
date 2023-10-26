const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
module.exports = {
    postCheckout: async (req, res) => {

        try {
            console.log(req.body);
            const addressId = req.body.address;
            const userId = req.session.user._id;
            const paymentMethod = req.body.paymentMethod;
            const cart = await cartModel.findOne({userId: userId}).populate('items.productId')
            const totalAmount = cart.totalAmount;

            console.log(addressId);
            console.log(userId);
            console.log(paymentMethod);
            console.log(cart);
            console.log(cart.items);
            console.log(totalAmount);

            const order = new orderModel({
                userId : userId,
                shippingAddress: addressId,
                paymentMethod : paymentMethod,
                totalAmount : totalAmount,
                orderedDate : new Date(),
                items : cart.items
            })
            await order.save().then(async(result)=>{
                console.log(result);

               for(const item of order.items){
                const productId= item.productId;
                const quantity = item.quantity;



                const product = await productModel.findOne({_id:productId})
                let stock = product.stock;
                balanceStock = stock - quantity;
                if(balanceStock <= 0){
                    stock = balanceStock;
                    product.status = 'Out of stock'
                }
               }

            })



        res.json({success:true})
        } catch (error) {
            console.log(error);
        }



    }
}