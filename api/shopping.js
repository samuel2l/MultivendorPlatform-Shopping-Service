const ShoppingService = require("../services/shopping-service");
const { SubscribeMessage } = require("../utils");
const  {auth,isSeller} = require('./middleware/auth');
const { PublishMessage } = require('../utils')
const Order=require("../database/models/Order")
const print=console.log
shoppingRoutes = (app, channel) => {
    
    const service = new ShoppingService();

    SubscribeMessage(channel, service)

    //PLACE AN ORDER ROUTE
    app.post('/order',auth, async (req,res,next) => {

        const { _id } = req.user;
 
        const { data } = await service.PlaceOrder(_id);
        print("data being sent as payload",data)
        const payload = await service.GetOrderPayload(_id, data.orderResults, 'CREATE_ORDER')
        const notificationPayload = await service.GetNotificationPayload(req.user.email, data.orderResults, 'SEND_CHECKOUT_CONFIRMATION_MAIL')
        const productPayload = await service.GetProductPayload( data.productDetails, 'REDUCE_PRODUCT_STOCK')
        
        PublishMessage(channel,process.env.CUSTOMER_BINDING_KEY, JSON.stringify(payload))
        PublishMessage(channel,process.env.NOTIFICATION_BINDING_KEY, JSON.stringify(notificationPayload))
        PublishMessage(channel,process.env.PRODUCT_BINDING_KEY, JSON.stringify(productPayload))

        res.status(200).json(data);

    });
    //GET ALL YOUR PREVIOUS ORDERS

    app.get('/orders',auth, async (req,res,next) => {
        
        const { _id } = req.user;

        const { data } = await service.GetOrders(_id);
        
        res.status(200).json(data);

    });
// A SELLER CAN SEE ALL PRODUCTS SOLD USING THIS ROUTE
    app.get('/seller-sales',isSeller, async (req,res,next) => {

        try {
            const sellerId = req.user._id;

            const sales = await Order.aggregate([
              {
                $match: {
                  "items.product.seller": sellerId
                }
              },
              //   {
              //   $project: {
              //     "orderId":1,
              //     "status":1,
              //     "customerId":1,
              //     "items.product": 1,
              //     "items.amount": 1,
              //     "amount":1,
              //     "createdAt":1,
              //   }
              // } 
            ]);
        
            console.log("Seller sales for ID:", sellerId, "Sales:", sales);
            res.status(200).json(sales);
          } catch (error) {
            console.error("Error in /seller-sales:", error);
            res.status(500).json({ error: "Something went wrong!" });
          }
    });

    //EDIT STATUS OF AN ORDER 
    app.put('/sales/:orderId',isSeller, async (req,res,next) => {

      try {
          const sellerId = req.user._id;
         const order= await Order.findOne({orderId:req.params.orderId})
         print("ORDER",order)
         if (order.items[0].product.seller==sellerId){
          const {status='received'}=req.body
          order.status=status
          const updatedOrder=await order.save()
          
          res.status(200).json(updatedOrder);

         }else{
          res.status(403).json({error:"Ah chale its not your order you want change am? mtch"})
         }
        } catch (error) {
          console.error("Error in /seller-sales:", error);
          res.status(500).json({ error: "Something went wrong!" });
        }

      });

//ADD TO CART. THIS SAME ROUTE IS USED TO BOTH ADD AND REMOVE FROM CART
//TO USE THIS ROUTE YOU NEED TO ADD AN ISREMOVE PROPRTY SET TO TRUE IF YOU ARE REMOVING FROM CART
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