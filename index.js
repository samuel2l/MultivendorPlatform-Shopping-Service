const express = require("express");
const app = express();
const mongoose = require("mongoose");
const print = console.log;
const cors = require("cors");

const shoppingRoutes = require("./api/shopping");
const port = process.env.PORT || 8003

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));

const { CreateChannel} = require("./utils");
require("dotenv").config();
app.use(express.urlencoded({ extended: true }));

async function startApp() {
  try {
    await mongoose.connect(process.env.DB_URI);
    print("Connection sauce");

    const channel = await CreateChannel();

    

    shoppingRoutes(app, channel);
    app.listen(port, () => {
      console.log(`Order Service is Listening to Port ${port}`);
    });
  } catch (err) {
    console.log("Failed to start app:", err);
  }
}

startApp();
