const ShoppingRepository = require("../database/repository/shopping-repository");
const { FormatData } = require("../utils/");
const Cart = require("../database/models/Cart");
let print = console.log;
class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository();
  }

  async GetCart({ _id }) {
    const cartItems = await this.repository.Cart(_id);
    return FormatData(cartItems);
  }

  async PlaceOrder(_id) {
    const { orderResult, productDetails } =
      await this.repository.CreateNewOrder(_id);

    return FormatData({ orderResult, productDetails });
  }

  async GetOrders(customerId) {
    const orders = await this.repository.Orders(customerId);
    return FormatData(orders);
  }

  async GetOrderDetails({ _id, orderId }) {
    const orders = await this.repository.Orders(_id);
    return FormatData(orders);
  }

  async ManageCart(customerId, item, amount, isRemove) {
    const cartResult = await this.repository.AddCartItem(
      customerId,
      item,
      amount,
      isRemove
    );
    return FormatData(cartResult);
  }

  async EditWishlist(customerId, item, amount, isRemove) {
    const wishlistResult = await this.repository.AddWishlistItem(
      customerId,
      item,
      amount,
      isRemove
    );
    return FormatData(wishlistResult);
  }

  async SubscribeEvents(payload) {
    payload = JSON.parse(payload);
    console.log("INSIDE SHOPPPINGGG SERVICEEE");
    const { event, data } = payload;
    console.log("EVENT X DATA CAUSING ERROR", event, data);
    if (data !== undefined) {
      const { userId, product, amount } = data;
      console.log("SUBSCRIBE EVENTS FROM SHOPPING SERVICE", data);
      //s
      console.log("destructured data??????", userId, product, amount);
      switch (event) {
        case "ADD_TO_CART": {
          const { userId, product, amount, isRemove } = data;
          print("RECEIVED DATA ADD TO CART",userId,product,amount,isRemove)
          this.ManageCart(userId, product, amount, isRemove);
          break;
        }
        case "REMOVE_FROM_CART":
          this.ManageCart(userId, product, amount, true);
          break;
        case "ADD_TO_WISHLIST":
          this.EditWishlist(userId, product, amount, false);
          break;
        case "REMOVE_FROM_WISHLIST":
          this.EditWishlist(userId, product, amount, true);
          break;

        default:
          console.log("the unavailable event is ", event);
          console.log("this event is not valid");
          break;
      }
    }
  }

  async GetOrderPayload(userId, order, event) {
    if (order) {
      const payload = {
        event: event,
        data: { userId, order },
      };

      return payload;
    } else {
      return FormatData({ error: "No Order Available" });
    }
  }
  async GetProductPayload(productDetails, event) {
    const payload = {
      event: event,
      data: productDetails,
    };

    return payload;
  }

  async GetNotificationPayload(userEmail, order, event) {
    if (order) {
      const payload = {
        event: event,
        data: { userEmail, order },
      };

      return payload;
    } else {
      return FormatData({ error: "No Order Available" });
    }
  }
}

module.exports = ShoppingService;
