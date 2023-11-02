const cartModel = require('../models/cartModel')
const addressModel = require('../models/addressModel')
const orderModel = require('../models/orderModel')
const Razorpay = require('razorpay')
const uuid =require('uuid')

const generateOrderId = function(){  
    return `ORD-${uuid.v4()}`;
}

module.exports = {
   

    generateOrder: async (userId, addressId) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('hiiii');
                const generatedOrderId = generateOrderId();
            console.log('generatedOrderId',generatedOrderId);

                const cart = await cartModel.findOne({ userId: userId }).populate('items.productId')
                const totalAmount = cart.totalAmount;
                const address = await addressModel.findOne({ userId: userId });
                console.log(address);
                const shippingAddress = address.address.find((item) => item._id.equals(addressId))
                const orderedDate = new Date() 

                const data = new orderModel({
                    orderId: generatedOrderId,
                    userId: userId,
                    shippingAddress: shippingAddress,
                    totalAmount: totalAmount,
                    orderedDate: orderedDate,
                    items: cart.items,
                    expectedDeliveryDate: new Date(orderedDate).setDate(orderedDate.getDate() + 7)
                })
                const order = await data.save()

                if (order) {
                    resolve({
                        order,
                        generatedOrderId
                    });
                } else {
                    const error = new Error('Order cannot be placed');
                    error.status = 400;
                    reject(error)
                }

            } catch (error) {
                reject(error)
            }

        })




    },
    razorpay: async (generatedOrderId,totalAmount)=>{
        return new Promise ((resolve,reject)=>{
            var razorpay = new Razorpay({ key_id: 'rzp_test_ZLOedi08NLKHof', key_secret: 'JgTsfJUr8zUD26HaeJd0brUM' })

        
            const razorpayOrder = razorpay.orders.create({
                amount: totalAmount,
                currency: "INR",
                receipt: generatedOrderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            })
console.log(razorpayOrder);
            resolve(razorpayOrder)
        })
        
    }
}


