const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
  customerId: { type: String },
  items: [
    {
      product: {
        _id: { type: String, require: true },
        name: { type: String },
        desc: { type: String },
        img:{type:String},
        type: { type: String },
        stock: { type: Number },
        price: { type: Number },
        available:{
type:Boolean,default:true
        },
        seller: { type: String },
      },
      amount: { type: Number, require: true },
    },
  ],
});

module.exports = mongoose.model("wishlist", WishlistSchema);
