const addressModel = require('../models/addressModel')
const userModel = require('../models/userModel');
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel');


module.exports = {
    getAddress :async(req,res)=>{
        try {
            const user =await userModel.findOne({email: req.session.user.email});
            const cart = await cartModel.findOne({userId: req.session.user._id});
            const addresses = await addressModel.find({})
            res.render('user/address',{user,cart,wishlist:false,addresses})
           
        } catch (error) {
            console.log(error);
            res.render ('user/404')
        }
    },
    getAddAddress : async (req,res)=>{
        try {
            const user =await userModel.findOne({email: req.session.user.email});
            const cart = await cartModel.findOne({userId: req.session.user._id})
            res.render('user/addAddress',{user,cart,wishlist:false, message: req.flash()})
        } catch (error) {
            console.log(error);

        }
    },
    postAddAddress : async (req,res)=>{
        try {
            console.log(req.body);
            const userId = req.session.user._id;
            const data = req.body;
            data.userId = userId;
            // const {name ,mobile,houseName,locality,pincode,district,state} = req.body
            console.log(userId);
            
            await addressModel.create(data)
            req.flash('addressMessage','Address added successfully')
            res.redirect('/addAddress')
        } catch (error) {
            console.log(error);
            res.render ('user/404')
        }
        
    }
}