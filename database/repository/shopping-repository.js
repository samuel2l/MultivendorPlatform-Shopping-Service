const Order = require("../models/Order");

const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
let print = console.log;
const { v4: uuidv4 } = require("uuid");

class ShoppingRepository {
  async Orders(customerId) {
    const orders = await Order.find({ customerId });

    return orders;
  }

  async Cart(customerId) {
    const cartItems = await Cart.find({ customerId });

    if (cartItems) {
      return cartItems;
    }

    return [];
  }
  async AddWishlistItem(customerId, item, amount, isRemove) {
    const wishlist = await Wishlist.findOne({ customerId: customerId });

    const { _id } = item;

    if (wishlist) {
      let isExist = false;

      let wishlistItems = wishlist.items;

      if (wishlistItems.length > 0) {
        wishlistItems.map((item) => {
          if (item.product._id.toString() === _id.toString()) {
            if (isRemove) {
              wishlistItems.splice(wishlistItems.indexOf(item), 1);
            } else {
              item.amount = amount;
            }
            isExist = true;
          }
        });
      }

      if (!isExist && !isRemove) {
        wishlistItems.push({ product: { ...item }, amount });
      }

      wishlist.items = wishlistItems;
      console.log("IN MANAGE wishlist FUNCTION", wishlist.items);

      return await wishlist.save();
    } else {
      return await Wishlist.create({
        customerId,
        items: [{ product: { ...item }, amount: amount }],
      });
    }
  }

  async AddCartItem(customerId, item, amount, isRemove) {
    const cart = await Cart.findOne({ customerId });
    print("ADD CART ITEM FUNC", cart);

    if (cart == []) {
      return [];
    }

    const { _id } = item;

    if (cart) {
      let isExist = false;

      let cartItems = cart.items;

      if (cartItems.length > 0) {
        cartItems.map((item) => {
          if (item.product._id.toString() === _id.toString()) {
            if (isRemove) {
              cartItems.splice(cartItems.indexOf(item), 1);
            } else {
              item.amount = amount;
            }
            isExist = true;
          }
        });
      }

      if (!isExist && !isRemove) {
        cartItems.push({ product: { ...item }, amount });
      }

      cart.items = cartItems;
      console.log("IN MANAGE CART FUNCTION", cart.items);

      return await cart.save();
    } else {
      return await Cart.create({
        customerId,
        items: [{ product: { ...item }, amount }],
      });
    }
  }

  async CreateNewOrder(customerId) {
    const cart = await Cart.findOne({ customerId });
    console.log("INSIDE CREATE NEW ORDER FUNCTIONNNNNNNNN", cart.items);
    if (!cart || cart.items.length === 0) {
      return {};
    }
    let productDetails = []
    const sellerOrders = {};
    cart.items.forEach((item) => {
      print("ITEMS OF CART.ITEMS", cart.items);
      const sellerId = item.product.seller;
      if (!sellerOrders[sellerId]) {
        sellerOrders[sellerId] = {
          items: [],
          totalAmount: 0,
        };
      }
      const itemTotal = parseFloat(item.product.price) * parseInt(item.amount);
      sellerOrders[sellerId].totalAmount += parseFloat(itemTotal.toFixed(2));
      sellerOrders[sellerId].items.push(item);
      productDetails.push({
        productId: item.product._id,
        productAmountBought: item.amount,
      });
    });
    let orderResults = [];

    for (const [sellerId, orderData] of Object.entries(sellerOrders)) {
        print("IN FOR LOOP",sellerId,orderData)
      const orderId = uuidv4();
        print("does it even reach here")
        const order = new Order({
          orderId,
          customerId,
          amount: orderData.totalAmount,
          status: "received",
          items: orderData.items,
        });
        const orderResult = await order.save();
        print("ah order result?",orderResult)
        orderResults.push(orderResult);
    }

    // cart.items = [];
    // await cart.save();

    return {
      orderResults,
      productDetails,
    };
  }
}

module.exports = ShoppingRepository;
