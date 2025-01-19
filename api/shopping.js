const ShoppingService = require("../services/shopping-service");
const { SubscribeMessage } = require("../utils");
const  {auth,isSeller} = require('./middleware/auth');
const { PublishMessage } = require('../utils')
const Order=require("../database/models/Order")
shoppingRoutes = (app, channel) => {
    
    const service = new ShoppingService();

    SubscribeMessage(channel, service)

    app.post('/order',auth, async (req,res,next) => {

        const { _id } = req.user;
 
        const { data } = await service.PlaceOrder(_id);
        const payload = await service.GetOrderPayload(_id, data.orderResult, 'CREATE_ORDER')
        const notificationPayload = await service.GetNotificationPayload(req.user.email, data.orderResult, 'SEND_CHECKOUT_CONFIRMATION_MAIL')
        const productPayload = await service.GetProductPayload( data.productDetails, 'REDUCE_PRODUCT_STOCK')
        
        PublishMessage(channel,process.env.CUSTOMER_BINDING_KEY, JSON.stringify(payload))
        PublishMessage(channel,process.env.NOTIFICATION_BINDING_KEY, JSON.stringify(notificationPayload))
        PublishMessage(channel,process.env.PRODUCT_BINDING_KEY, JSON.stringify(productPayload))

        res.status(200).json(data);

    });

    app.get('/orders',auth, async (req,res,next) => {
        
        const { _id } = req.user;

        const { data } = await service.GetOrders(_id);
        
        res.status(200).json(data);

    });

    app.get('/seller-sales',isSeller, async (req,res,next) => {

        try {
            const sellerId = req.user._id;
            console.log("In seller sales route", sellerId);
            // Aggregation in MongoDB is like a pipeline where data flows through multiple stages. Each stage performs a specific operation, such as filtering, reshaping, or transforming the data, and then passes the results to the next stage.
            const sales = await Order.aggregate([
              {
                $match: {
                  "items.product.seller": sellerId
                }
              },
              {
                // Reshape documents to include/exclude specific fields.
                $project: {
                  items: {
                    $filter: {
                      input: "$items",
                      as: "item",
                      cond: { $eq: ["$$item.product.seller", sellerId] }
                    }
                  }
                }
              },
                // further Reshape documents to include only the product and amount fields as that is all we really need to sidplay the sellers sales you barb.
                {
                $project: {
                  "items.product": 1,
                  "items.amount": 1
                }
              }
            ]);
        
            console.log("Seller sales for ID:", sellerId, "Sales:", sales);
            res.status(200).json(sales);
          } catch (error) {
            console.error("Error in /seller-sales:", error);
            res.status(500).json({ error: "Something went wrong!" });
          }
    });


    app.put('/cart',auth, async (req,res,next) => {

        const { _id } = req.user;
        const {item,amount,isRemove=false}=req.body

        const { data } = await service.ManageCart(_id,item,amount,isRemove);
        
        res.status(200).json(data);

    });
    app.get('/cart', auth, async (req,res,next) => {

        const { _id } = req.user;
        
        const { data } = await service.GetCart({ _id });

        return res.status(200).json(data);
    });

}
module.exports=shoppingRoutes