E-commerce Analytics Dashboard API
This project is a robust and scalable API for an e-commerce platform, built with Node.js, Express, and MongoDB. The primary goal was to create a feature-rich backend capable of managing products, orders, and users, with a strong focus on data aggregation and security.

🔑 Key Features
Product Management (CRUD): Create, read, update, and delete products with flexible filtering and sorting options.

User Authentication: Secure user registration and login using JWT (JSON Web Tokens) for authentication.

Order Management: Handle the creation, retrieval, and status updates of customer orders.

Advanced Data Analytics: Utilize MongoDB Aggregation Pipelines to generate valuable sales statistics and identify top-performing products.

Error Handling: A custom, centralized error handling middleware that provides detailed error logs in development and sends user-friendly messages in production.

🛠️ Technologies Used
Node.js: The core JavaScript runtime environment.

Express.js: The web application framework for building the API.

MongoDB: The NoSQL database used for data storage.

Mongoose: The ODM (Object Data Modeling) library for MongoDB.

JSON Web Tokens (JWT): For secure, token-based authentication.

Bcrypt.js: For hashing and securing user passwords.

Dotenv: For managing environment variables.

⚠️ Important Note: No Payment System
This API does not include any real or simulated payment processing functionality. It is designed solely for managing e-commerce data and does not handle financial transactions.
