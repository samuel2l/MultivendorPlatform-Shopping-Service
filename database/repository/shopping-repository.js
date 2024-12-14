const Order = require('../models/Order');

const Cart = require('../models/Cart');
const { v4: uuidv4 } = require('uuid');

class ShoppingRepository {

    async Orders(customerId){

        const orders = await Order.find({customerId });
        
        return orders;

    }

    async Cart(customerId){

        const cartItems = await Cart.find({ customerId});

        if(cartItems){
            return cartItems;
        }

        return []
    }

    async AddCartItem(customerId,item,amount,isRemove){
 

            const cart = await Cart.findOne({ customerId: customerId })

            const { _id } = item;

            if(cart){
                
                let isExist = false;

                let cartItems = cart.items;

                if(cartItems.length > 0){

                    cartItems.map(item => {
                                                
                        if(item.product._id.toString() === _id.toString()){
                            if(isRemove){
                                cartItems.splice(cartItems.indexOf(item), 1);
                             }else{
                               item.amount = amount;
                            }
                             isExist = true;
                        }
                    });
                } 
                
                if(!isExist && !isRemove){
                    cartItems.push({product: { ...item}, amount });
                }

                cart.items = cartItems;
                console.log('IN MANAGE CART FUNCTION',cart.items)

                return await cart.save()
 
            }else{

               return await Cart.create({
                    customerId,
                    items:[{product: { ...item}, stock: amount }]
                })
            }

        
    }
 
    async CreateNewOrder(customerId) {
        const cart = await Cart.findOne({ customerId });
        
        if (!cart || cart.items.length === 0) {
            return {}; 
        }
    
        let totalAmount = 0;
        const orderItems = [];
        let productDetails = []; 

        cart.items.forEach((item) => {
            
            const itemTotal = parseFloat(item.product.price) * parseInt(item.amount);
            totalAmount += itemTotal;
            totalAmount = parseFloat(totalAmount.toFixed(2));
            orderItems.push(item);
            productDetails.push({
                productId: item.product._id,
                productAmountBought: item.amount,
            });
        });
    
        const orderId = uuidv4();
        const order = new Order({
            orderId,
            customerId,
            amount: totalAmount,
            status: 'received',
            items: orderItems,
        });
    
        // cart.items = []; 
    
        const orderResult = await order.save();
        await cart.save();
 
        return {
            orderResult,
            productDetails,
        };
    }
}

module.exports = ShoppingRepository;
