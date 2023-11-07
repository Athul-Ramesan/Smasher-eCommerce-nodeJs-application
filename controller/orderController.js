const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel');
const { default: mongoose } = require('mongoose');
const moment = require('moment')
const crypto = require('crypto')

const orderService = require('../services/orderService');


module.exports = {
    getAdminOrders: async (req, res) => {
        const itemsPerPage = 10;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * itemsPerPage;
        try {
            totalItems = await orderModel.countDocuments();
            const totalPages = Math.ceil(totalItems / itemsPerPage)

            const orders = await orderModel
                .find()
                .skip(skip)
                .limit(itemsPerPage)

            const formatedOrders = orders.map(doc => ({
                ...doc.toObject(),
                orderedDate: moment(doc.orderedDate).format('MMMM Do YYYY, h:mm:ss a'),
                expectedDeliveryDate: moment(doc.expectedDeliveryDate).format('MMMM Do YYYY')
            }))

            console.log(formatedOrders);
            res.render('admin/orders', {
                orders: formatedOrders,
                currentPage,
                totalPages
            })
        } catch (error) {
            console.log(error);
        }
    },
    getAdminOrderDetails: async (req, res) => {
        const orderId = req.params.id;
        try {
            const order = await orderModel.findOne({ _id: orderId }).populate('items.productId')
            res.render('admin/orderDetails', { order })
        } catch (error) {

        }
    },
    putAdminUpdateOrderStatus: async (req, res) => {
        console.log(req.query);
        const { id, status } = req.query;
        // const orderId = req.body.orderId;
        // const newStatus = req.body.newStatus;

        try {
            if (id && status) {

                if (status === "Delivered") {
                    await orderModel.updateOne({ _id: id }, { $set: { status: status, paymentStatus: 'Paid' } })

                    res.json({ success: true, paymentStatus: 'Paid' })
                } else {
                    await orderModel.updateOne({ _id: id }, { $set: { status: status, paymentStatus: 'Pending' } })
                    res.json({ success: true, paymentStatus: 'Pending' })
                }

            } else {
                res.json({ success: false })
            }
        } catch (error) {
            console.log(error);
        }
    },
    checkout: async (req, res) => {
        try {
            const userId = req.session.user._id
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id });
            const addresses = await addressModel.findOne({ userId: userId })
            const product = await 
            if (cart) {
                res.render('user/checkout', {
                    user,
                    cart,
                    wishlist: false,
                    addresses,
                    message: req.flash()
                })
            } else {
                res.redirect('/cart')
            }


        } catch (error) {
            console.log(error);

        }
    },

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

            if (paymentMethod && addressId) {

                const { order, generatedOrderId } = await orderService.generateOrder(userId, addressId)

                if (paymentMethod === 'cod') {
                    await orderModel.findOneAndUpdate(
                        {
                            orderId: generatedOrderId
                        },
                        {
                            paymentMethod: paymentMethod
                        }
                    ).then(async (result) => {

                        await cartModel.findOneAndDelete({ userId: userId })
                        const orderId = result._id
                        console.log(orderId, 'orderIdddd');
                        console.log(result, 'result');
                        orderService.stockUpdate(orderId)
                        res.json({ success: true, paymentMethod: 'cod', orderId })
                    }).catch(err => console.log(err))
                } else if (paymentMethod === 'online') {
                    await orderService.razorpay(generatedOrderId, totalAmount)
                        .then((createdOrder) => {

                            res.json({ success: true, createdOrder, paymentMethod: 'online' })
                        })
                }


            } else {
                if (paymentMethod && !addressId) {
                    res.json({ success: false, message: 'please select shipping address' })
                } else if (!paymentMethod && addressId) {
                    res.json({ success: false, message: 'please select payment method' })
                }

            }

        } catch (error) {
            res.json({ error: 'something went wrong, please try again' })
            console.log(error);
        }

    },
    verifyPayment: async (req, res) => {
        const userId = new mongoose.Types.ObjectId(req.session.user._id)
        try {
            console.log("it is the body", req.body);
            let hmac = crypto.createHmac("sha256", 'JgTsfJUr8zUD26HaeJd0brUM');
            hmac.update(
                req.body.payment.razorpay_order_id +
                "|" +
                req.body.payment.razorpay_payment_id
            );

            hmac = hmac.digest("hex");
            console.log(hmac);
            if (hmac === req.body.payment.razorpay_signature) {

                console.log('inside hmac');
                const generatedOrderId = req.body.order.createdOrder.receipt

                await orderModel.findOneAndUpdate({ orderId: generatedOrderId }, {
                    paymentStatus: "Paid",
                    paymentMethod: "Online",
                }, { new: true }).then(async (result) => {
                    console.log(result, 'result');
                    const orderId = result._id;
                    orderService.stockUpdate(orderId);
                    await cartModel.findOneAndDelete({ userId: userId })
                    res.json({ success: true, orderId });
                }).catch(error => {
                    console.log(error);
                })
                console.log("hmac success");

            } else {
                console.log("hmac failed");
                res.json({ failure: true });
            }

        } catch (error) {
            console.log(error);
        }
    },
    getAddAddressCheckout: async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id })
            res.render('user/addAddress', { user, cart, wishlist: false, message: req.flash() })
        } catch (error) {
            console.log(error);

        }
    },
    postAddAddressCheckout: async (req, res) => {
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
                res.redirect('/checkout')
            } else {
                await addressModel.findOneAndUpdate(
                    { userId: userId },
                    {
                        $push: { address: data }
                    }
                ).then((result) => {
                    console.log(result);

                    req.flash('addressMessage', 'Address added successfully')
                    res.redirect('/checkout')

                })
            }

        } catch (error) {
            console.log(error);
            res.render('user/404')
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