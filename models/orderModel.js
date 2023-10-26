const mongoose = require('mongoose');
const {USER, PRODUCT, ORDER ,ADDRESS} = require('../utils/constants/schemaName')

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : USER
    },
    items:[{
        productId :{
            type: mongoose.Schema.Types.ObjectId,
            ref: PRODUCT
        },
        quantity: {
            type: Number
        }
    }],
    orderedDate : {
        type: Date
    },
    deliveredDate : {
        type: Date
    },
    returnDate: {
        type: Date
    },
    expectedDeliveryDate:{
        type: Date
    },
    status:{
        type: String,
        default: 'Order Placed'
    },
    shippingAddress:{
        type:String,
        ref: ADDRESS
    },
    paymentMethod:{
        type: String,
        required: true
    },
    paymentStatus:{

    },
    returnReason:{

    },
    totalAmount:{

    }

})
const order = mongoose.model('ORDER', orderSchema)

module.exports = order;