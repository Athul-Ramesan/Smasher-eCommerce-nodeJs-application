const mongoose  = require('mongoose')
const {PRODUCT, USER, CART} = require('../utils/constants/schemaName')

const cartSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : USER,
        required : true
    },
    items: [{
        productId : {
            type: mongoose.Schema.Types.ObjectId,
            ref:PRODUCT,
            required : true
        },
        quantity : {
            type: Number
        }
    }],
    totalAmount : {
        type : Number
    }
    
})

const cart = mongoose.model(CART,cartSchema);
module.exports = cart