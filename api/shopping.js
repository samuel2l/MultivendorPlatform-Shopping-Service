const ShoppingService = require("../services/shopping-service");
const { SubscribeMessage } = require("../utils");
const { auth, isSeller } = require("./middleware/auth");
const { PublishMessage } = require("../utils");
const Order = require("../database/models/Order");
const Wishlist = require("../database/models/Wishlist");
const Cart = require("../database/models/Cart");
require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_KEY);
const app = express();
app.use(express.json());

const print = console.log;

shoppingRoutes = (app, channel) => {
  const service = new ShoppingService();
  //   app.get("/delete-all", async (req, res) => {
  //     try {
  //         await Cart.deleteMany({});
  //         await Order.deleteMany({});
  //         await Wishlist.deleteMany({});
  //         await 
  //         res.json({ message: "All products deleted successfully" });
  //     } catch (error) {
  //         console.error("Error deleting products:", error);
  //         res.status(500).json({ error: "Failed to delete products" });
  //     }
  // });

  SubscribeMessage(channel, service);

  app.post('/order',auth, async (req,res,next) => {

    const { _id } = req.user;

    const { data } = await service.PlaceOrder(_id);
    print("data being sent as payload",data)
    const payload = await service.GetOrderPayload(_id, data.orderResults, 'CREATE_ORDER')
    const notificationPayload = await service.GetNotificationPayload(req.user.email, data.orderResults, 'SEND_CHECKOUT_CONFIRMATION_MAIL')
    const productPayload = await service.GetProductPayload( data.productDetails, 'REDUCE_PRODUCT_STOCK')

    print("|DATA BEING SENT TO PRODUCT SERVICES",productPayload)
    PublishMessage(channel,process.env.CUSTOMER_BINDING_KEY, JSON.stringify(payload))
    PublishMessage(channel,process.env.NOTIFICATION_BINDING_KEY, JSON.stringify(notificationPayload))
    PublishMessage(channel,process.env.PRODUCT_BINDING_KEY, JSON.stringify(productPayload))

    res.status(200).json(data);

});

  app.get("/orders", auth, async (req, res, next) => {
    const { _id } = req.user;

    const { data } = await service.GetOrders(_id);

    res.status(200).json(data);
  });
  // A SELLER CAN SEE ALL PRODUCTS SOLD USING THIS ROUTE
  app.get("/seller-sales", isSeller, async (req, res, next) => {
    try {
      const sellerId = req.user._id;

      const sales = await Order.aggregate([
        {
          $match: {
            "items.product.seller": sellerId,
          },
        },

      ]);

      console.log("Seller sales for ID:", sellerId, "Sales:", sales);
      res.status(200).json(sales);
    } catch (error) {
      console.error("Error in /seller-sales:", error);
      res.status(500).json({ error: "Something went wrong!" });
    }
  });

  //EDIT STATUS OF AN ORDER
  app.put("/sales/:orderId", isSeller, async (req, res, next) => {
    try {

      const sellerId = req.user._id;
      const order = await Order.findOne({ orderId: req.params.orderId });
      print("ORDER", order);
      if (order.items[0].product.seller == sellerId) {
        const { status = "received" } = req.body;
        order.status = status;
        const updatedOrder =  await Order.findOneAndUpdate(
          { _id: order._id }, 
          { $set: { status: status } }, 
          { new: true, runValidators: true }
      );
      PublishMessage(channel,process.env.CUSTOMER_BINDING_KEY, JSON.stringify({event:"SEND_ORDER_STATUS_CHANGE_MAIL",data:{
        buyerId:order.customerId,
        status

      }}))

        res.status(200).json(updatedOrder);
      } else {
        res
          .status(403)
          .json({
            error: "Ah chale its not your order you want change am? mtch",
          });
      }
    } catch (error) {
      console.error("Error in /seller-sales:", error);
      res.status(500).json({ error: "Something went wrong!" });
    }
  });

  //ADD TO CART. THIS SAME ROUTE IS USED TO BOTH ADD AND REMOVE FROM CART
  //TO USE THIS ROUTE YOU NEED TO ADD AN ISREMOVE PROPRTY SET TO TRUE IF YOU ARE REMOVING FROM CART
  app.put("/cart", auth, async (req, res, next) => {
    const { _id } = req.user;
    const { item, amount, isRemove = false } = req.body;

    const { data } = await service.ManageCart(_id, item, amount, isRemove);

    res.status(200).json(data);
  });
  app.get("/cart", auth, async (req, res, next) => {
    const { _id } = req.user;

    const { data } = await service.GetCart({ _id });

    return res.status(200).json(data);
  });

  app.post("/create-payment-intent", async (req, res) => {
    try {
      const customer = await stripe.customers.create();
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2023-10-16" }
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.total,
        currency: "usd",
        customer: customer.id,
        description: "Your transaction description here",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.STRIPE_PBLK_KET_TST,
      });
    } catch (error) {
      console.log(error);
      logger.error(`stripe: ${error.message}`);
      return res.json({ error: true, message: error.message, data: null });
    }
  });
};
module.exports = shoppingRoutes;
