const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel');
const { default: mongoose } = require('mongoose');
module.exports = {
    postCheckout: async (req, res) => {

        try {
            console.log(req.body);
            const addressId = req.body.address;
            const userId = new mongoose.Types.ObjectId(req.session.user._id)
            const paymentMethod = req.body.paymentMethod;
            const cart = await cartModel.findOne({ userId: userId }).populate('items.productId')
            const totalAmount = cart.totalAmount;
            const address = await addressModel.findOne({ userId: userId });
            console.log(address);
            const shippingAddress = address.address.find((item) => item._id.equals(addressId))




            const order = new orderModel({
                userId: userId,
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
                totalAmount: totalAmount,
                orderedDate: new Date(),
                items: cart.items,
                expectedDeliveryDate: new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000)
            })

            const result = await cartModel.findOneAndDelete({ userId: userId })
            console.log(result);
            await order.save().then(async (result) => {
                const orderId = result._id
                console.log(orderId);
                for (const item of order.items) {
                    const productId = item.productId;
                    const quantity = item.quantity;



                    const product = await productModel.findOne({ _id: productId })

                    balanceStock = product.stock - quantity;
                    if (balanceStock <= 0) {
                        product.stock = balanceStock;
                        product.status = 'Out of stock';
                        await product.save()
                    } else {
                        product.stock = balanceStock;
                        await product.save()
                    }

                }
                res.json({ success: true, orderId })
            }).catch(error => {
                res.json({ success: false })
            })


        } catch (error) {
            console.log(error);
        }

    },
    getOrderSuccess: async (req, res) => {
        const orderId = req.params.id;
        try {
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id });
            res.render('user/orderSuccess', { user, cart, wishlist: false, orderId })
        } catch (error) {

        }
    },
    getOrders: async (req, res) => {
        try {
            const orders = await orderModel.find({}).populate('items.productId')
            console.log(orders);
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id });

            res.render('user/orders', { user, cart, orders, wishlist: false, message: req.flash() })
        } catch (error) {
            console.log(error);
        }
    },
    getOrderDetails: async (req, res) => {
        const orderId = new mongoose.Types.ObjectId(req.params)
        console.log(req.params);
        try {
            const order = await orderModel.findOne({ _id: orderId }).populate('items.productId')

            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id });

            res.render('user/orderDetails', { user, cart, wishlist: false, order })
        } catch (error) {
            console.log(error);
        }
    },
    getCancelOrder: async (req, res) => {
        const orderId = req.params.id;

        try {

            await orderModel.findOneAndUpdate({ _id: orderId }, { status: 'Cancelled' })
                .then(async (result) => {
                    if (result) {
                        const order = result
                        for (const item of order.items) {
                            const productId = item.productId;
                            const quantity = item.quantity;

                            const product = await productModel.findOne({ _id: productId })

                            newStock = product.stock + quantity;
                            if (newStock > 0) {
                                product.stock = newStock;
                                product.status = 'In stock';
                                await product.save()
                            } else {
                                product.stock = newStock;
                                await product.save()
                            }
                        }
                    }

                })
            req.flash('orderMessage', 'Order Cancelled')
            res.redirect('/orders')
        } catch (error) {
            console.log(error);
        }

    }
}