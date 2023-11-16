const joi = require('joi');

addCoupon = new joi.object({
    couponName : joi.string().trim().required(),
    couponCode : joi.string().trim().length(6).required(),
    discountPercent : joi.number().min(0).max(100).required(),
    maxUseCount : joi.number().required(),
    minimumOrderAmount : joi.number().min(0).required(),
    maximumDiscountAmount : joi.number().min(0).required(),
    expiryDate : joi.date().min(new Date()).required()

})

module.exports = addCoupon