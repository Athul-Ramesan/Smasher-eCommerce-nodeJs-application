const mongoose = require('mongoose');

const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');



module.exports = {

    calculateCartTotal: async (userId) => {
        try {
            const cart = await cartModel.findOne({ userId: userId })

            await cartModel.aggregate([
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
                        'items.productSubtotal': { $multiply: ['$items.quantity', '$product.price'] },
                        'items.discountSubtotal': { $cond: [{ $eq: ['$product.isDiscountApplied', true] }, { $multiply: ['$items.quantity', '$product.discountAmount'] }, 0] }
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        totalAmount: { $sum: '$items.productSubtotal' },
                        totalDiscount: { $sum: '$items.discountSubtotal' }
                    }
                }
            ]).then(cartSummary => {
                console.log(cartSummary, 'this is result');
                if (cartSummary.length > 0) {
                    totalAmount = cartSummary[0].totalAmount
                    totalDiscount = cartSummary[0].totalDiscount
                } else {
                    totalAmount = 0;
                    totalDiscount = 0;
                }
                cart.totalAmount = totalAmount
                cart.totalDiscount = totalDiscount
                
            }).catch(err => {
                console.log(err);
            })


            await cart.save()
            return { totalAmount, totalDiscount }
        } catch (error) {
            console.log(error);
        }

    }
}
