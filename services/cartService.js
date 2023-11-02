const mongoose = require('mongoose');

const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');



module.exports = {
  
    calculateCartTotal : async(userId)=>{
        try {
            const cart = await cartModel.findOne({ userId: userId })
        const cartSummary = await cartModel.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $unwind: '$items'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $set: {
                    'items.subtotal': { $multiply: ['$items.quantity', '$product.price'] }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    totalAmount: { $sum: '$items.subtotal' }
                }
            }
        ]);

        console.log(cartSummary,'cartSummary');
        let totalAmount
        if(cartSummary.length >0){
             totalAmount = cartSummary[0].totalAmount
        }else{
            totalAmount =0;
        }
        
        cart.totalAmount = totalAmount
        
        await cart.save()
        return totalAmount
        } catch (error) {
            console.log(error);
        }
        
    }
}
