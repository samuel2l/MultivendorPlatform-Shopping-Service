const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    orderId: { type: String },
    customerId: { type: String },
    amount: { type: Number },
    status: { type: String,enum:["received","on the way","delivered","cancelled"] },
    items: [
      {
        product: {
          _id: { type: String, require: true },
          name: { type: String },
          desc: { type: String },
          img: { type: String },
          type: { type: String },
          stock: { type: Number },
          price: { type: Number },
          available: {
            type: Boolean,
            default: true,
          },
          sizes: {
            type: [String],
            enum: [
              "US C1 / UK 0.5 / EU 16",
              "US C2 / UK 1.5 / EU 17",
              "US C3 / UK 2.5 / EU 18",
              "US C4 / UK 3.5 / EU 19",
              "US C5 / UK 4.5 / EU 20",
              "US C6 / UK 5.5 / EU 21",
              "US C7 / UK 6.5 / EU 22",
              "US C8 / UK 7.5 / EU 23",
              "US C9 / UK 8.5 / EU 24",
              "US C10 / UK 9.5 / EU 25",
              "US C11 / UK 10.5 / EU 26",
              "US C12 / UK 11.5 / EU 27",
              "US C13 / UK 12.5 / EU 28",
              "US 1 / UK 13 / EU 29",
              "US 1.5 / UK 13.5 / EU 30",
              "US 2 / UK 1 / EU 31",
              "US 2.5 / UK 1.5 / EU 31.5",
              "US 3 / UK 2 / EU 32",
              "US 3.5 / UK 2.5 / EU 33",
              "US 4 / UK 3 / EU 34",
              "US 4.5 / UK 3.5 / EU 35",
              "US 5 / UK 3 / EU 36",
              "US 5.5 / UK 3.5 / EU 36.5",
              "US 6 / UK 4 / EU 37",
              "US 6.5 / UK 4.5 / EU 37.5",
              "US 7 / UK 5 / EU 38",
              "US 7.5 / UK 5.5 / EU 38.5",
              "US 8 / UK 6 / EU 39",
              "US 8.5 / UK 6.5 / EU 40",
              "US 9 / UK 7 / EU 40.5",
              "US 9.5 / UK 7.5 / EU 41",
              "US 10 / UK 8 / EU 42",
              "US 10.5 / UK 8.5 / EU 42.5",
              "US 11 / UK 9 / EU 43",
              "US 11.5 / UK 9.5 / EU 44",
              "US 12 / UK 10 / EU 44.5",
              "US 13 / UK 11 / EU 46",
              "XS",
              "S",
              "M",
              "L",
              "XL",
              "XXL",
            ],
          },
          colors: {
            type: [String],
          },

          seller: { type: String },
        },
        amount: { type: Number, require: true },
      },
    ],
  },
  {
    optimisticConcurrency: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

module.exports = mongoose.model("order", OrderSchema);
