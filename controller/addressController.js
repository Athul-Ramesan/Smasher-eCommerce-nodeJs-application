const addressModel = require('../models/addressModel')
const userModel = require('../models/userModel');
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel');
const mongoose = require('mongoose');


module.exports = {
    getAddress: async (req, res) => {
        try {
            const userId = req.session.user._id
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id });
            const addresses = await addressModel.findOne({ userId: userId })
            res.render('user/address', { user, cart, wishlist: false, addresses, message: req.flash() })

        } catch (error) {
            console.log(error);
            res.render('user/404')
        }
    },
    getAddAddress: async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id })
            res.render('user/addAddress', { user, cart, wishlist: false, message: req.flash() })
        } catch (error) {
            console.log(error);

        }
    },
    postAddAddress: async (req, res) => {
        try {
            console.log(req.body);
            const userId = req.session.user._id;
            const data = req.body;
            data.userId = userId;
            // const {name ,mobile,houseName,locality,pincode,district,state} = req.body
            console.log(userId);
            const address = await addressModel.findOne({ userId: userId })

            if (!address) {
                await addressModel.create({ userId: userId, address: [data] })
                req.flash('addressMessage', 'Address added successfully')
                res.redirect('/address')
            } else {
                await addressModel.findOneAndUpdate(
                    { userId: userId },
                    {
                        $push: { address: data }
                    }
                ).then((result) => {
                    console.log(result);
                    req.flash('addressMessage', 'Address added successfully')
                    res.redirect('/address')
                })
            }

        } catch (error) {
            console.log(error);
            res.render('user/404')
        }

    },
    getEditAddress: async (req, res) => {
        try {

            const addressId = req.params.id;
            const userId = req.session.user._id
            const userAddress = await addressModel.findOne({ userId: userId })
            const address = userAddress.address.find((item) => item._id.equals(addressId))

            const user = await userModel.findOne({ email: req.session.user.email });

            const cart = await cartModel.findOne({ userId: req.session.user._id })

            res.render('user/editAddress', { user, cart, wishlist: false, address, message: req.flash() })
        } catch (error) {
            console.log(error);
        }
    },
    postEditAddress: async (req, res) => {
        try {
            const addressId= req.params.id;
            const data = req.body;
            console.log(data);
            
            const userId = new mongoose.Types.ObjectId(req.session.user._id)
                await addressModel.findOneAndUpdate(
                    {userId: userId,'address._id': addressId},
                    {$set :
                        {'address.$':data}
                        },
                        ).then((result)=>{
                            console.log(result);
                        }).catch((err)=>{
                            console.log(err);
                        })
            req.flash('addressMessage', 'Address edited Successfully')
            res.redirect('/address');
        } catch (error) {
            console.log(error);
        }
    },
    getDeleteAddress: async (req, res) => {
        try { 
            const userId= req.session.user._id
            const addressId = req.params.id
            console.log(addressId);
            await addressModel.findOneAndUpdate(
                {userId:userId},
                {$pull : {address : {_id : addressId} }},
                { new: true }
                ).then((result)=>{
                    console.log(result);
                    res.redirect('/address')
                })
           
        } catch (error) {

        }
    }
}