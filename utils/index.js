const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");





module.exports.GeneratePassword = async (password) => {
  return await bcrypt.hash(password,8);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
 
) => {
  return bcrypt.compare(enteredPassword,savedPassword);
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, 'secretKey', { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], 'secretKey');
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormatData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};


//Message Broker

module.exports.CreateChannel = async () => {
  try {

    const connection = await amqplib.connect(process.env.MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    //do not create exchanges on the cloud. this code nor will create it once connected
    //may change this to assertQueue if issues arise
    await channel.assertExchange(process.env.EXCHANGE_NAME,"direct",{durable:true});
    return channel;
  } catch (err) {
    throw err;
  }
};

module.exports.PublishMessage = (channel, bindingKey, msg) => {
  console.log('MESSAGE VAR FROM PUBLISH MSG',msg,bindingKey)
 try{ channel.publish(process.env.EXCHANGE_NAME, bindingKey, Buffer.from(msg));
  console.log("Sent: ", msg);}catch(err){
    throw err
  }
};

// Consumes messages from a queue processes and acknowledges them.
module.exports.SubscribeMessage = async (channel, service) => {
  const appQueue=await channel.assertQueue(process.env.QUEUE_NAME,{durable:true})
  channel.bindQueue(appQueue.queue,process.env.EXCHANGE_NAME,process.env.SHOPPING_BINDING_KEY)
  channel.consume(appQueue.queue,data=>{
    console.log('dataaa from shopping service',data.content.toString())
    service.SubscribeEvents(data.content.toString())
    channel.ack(data)
  })
 };