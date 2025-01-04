
# Shopping Service

The **Shopping Service** is a microservice designed to handle shopping-related operations in a multi-service e-commerce architecture. It manages cart operations, processes orders, and communicates with other services such as Product and User services for seamless functionality.

---

## Features

- **Manage Cart:**
  - Add items to a user's cart.
  - Update item quantities.
  - Remove items from the cart.
- **Place Orders:**
  - Process user orders and calculate the total cost.
  - Update product stock levels dynamically.
  - Send order details to other services (e.g., Product and User).
- **Interservice Communication:**
  - Leverages RabbitMQ for communication with related microservices.

---

## Technologies Used

- **Node.js:** Backend runtime environment.
- **Express.js:** Framework for building RESTful APIs.
- **MongoDB:** Database for storing product information.
- **Mongoose:** ORM for MongoDB interactions.
- **RabbitMQ:** Message broker for communication with other microservices (e.g., Order, Search).
- **Cloudinary:** (Optional) For handling product image uploads.

---

## Installation and Setup

### Steps to Set Up

1. Delete the `node_modules` folder, then run the following command in the root directory:
   ```bash
   npm install

2. Create a .env file that looks like this:
   
		    DB_URI=<your MongoDB URI>
		    MESSAGE_BROKER_URL=<Your broker URL>
		    EXCHANGE_NAME=<any exchange name of your choice>
		    QUEUE_NAME=<any queue name of your choice>
        CUSTOMER_BINDING_KEY=<variable to bind messages to the user/customer queue. eg customerBindingKey>
        SHOPPING_BINDING_KEY=<variable to bind messages to the shopping queue. eg shoppingBindingKey>
        NOTIFICATION_BINDING_KEY= <variable to bind messages to the shopping queue. eg notificationKey>
        PRODUCT_BINDING_KEY=<<variable to bind messages to the shopping queue. eg productKey>


	



	3.	Note:
The RabbitMQ URL for interservice communication can be obtained from CloudAMQP:
	•	Create a new instance and follow the prompts.
	•	After creating the instance, click on the link for the instance with the name you gave it to view and copy the URL.
	4.	Start the service by running:

Run:


	5.	node index.js


You can now test the APIs

## Multivendor Application Services

This is one of the four services for the **Multivendor Application**.  

### Related Repositories

- **Shopping Frontend:**  
  [MultivendorPlatform-Shopping-Frontend](https://github.com/haariswaqas/MultivendorPlatform-Shopping-Frontend)

- **Notification Microservice:**  
  [MultiVendorPlatform-Notification-Microservice](https://github.com/samuel2l/MultiVendorPlatform-Notification-Microservice)

- **Products Microservice:**  
  [MultiVendorApp-Products-Microservice](https://github.com/samuel2l/MultiVendorApp-Products-Microservice)

- **User Microservice:**  
  [MultiVendorApp-User-Service](https://github.com/samuel2l/MultiVendorApp-User-Service)
