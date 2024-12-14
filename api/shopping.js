const ShoppingService = require("../services/shopping-service");
const { SubscribeMessage } = require("../utils");
const  auth = require('./middleware/auth');
const { PublishMessage } = require('../utils')

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