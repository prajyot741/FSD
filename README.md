# Goa Drives 🚗

Goa Drives is a full-stack web application for a pre-owned car dealership based in Goa. It features a public-facing website where users can browse inventory, submit their own cars for valuation, and contact the dealership. The project is built with a Node.js and Express backend, a MongoDB database, and a static HTML, CSS, and JavaScript frontend.

---
## ## Features

* **Multi-Page Frontend**: A complete, responsive website with Home, Inventory, Sell Your Car, and Contact pages.
* **User Authentication**: A secure signup and login system with password hashing.
* **Database Integration**: All user data, car submissions, and contact messages are stored in a MongoDB database.
* **Dynamic Filtering**: The inventory page allows users to filter car listings by make, price, and fuel type.
* **Interactive Forms**: Modern, user-friendly forms for user registration, car submission, and inquiries.
* **Backend API**: A RESTful API built with Express.js to handle all data operations.

---
## ## Technologies Used

* **Frontend**:
    * HTML5
    * CSS3
    * JavaScript (ES6+)
* **Backend**:
    * **Node.js**: JavaScript runtime environment.
    * **Express.js**: Web framework for building the API and serving the site.
    * **MongoDB**: NoSQL database for storing all application data.
    * **Mongoose**: Object Data Modeling (ODM) library for MongoDB and Node.js.
    * **Bcrypt.js**: Library for hashing user passwords.
    * **CORS**: Middleware for handling Cross-Origin Resource Sharing.

---
## ## Setup and Installation

Follow these steps to get the project running on your local machine.

### **Prerequisites**

* [Node.js](https://nodejs.org/) installed on your machine.
* [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

### **Installation**

1.  **Clone the repository** (or place the project files in a directory on your computer).

2.  **Navigate to the backend folder**:
    ```bash
    cd /path/to/your/project/backend
    ```

3.  **Install NPM packages**:
    ```bash
    npm install
    ```

4.  **Run the server**:
    ```bash
    node server.js
    ```

5.  Open your web browser and go to **`http://localhost:3000`**. The application should now be running.

---
## ## File Structure

The project is organized with the frontend code neatly contained within the `public` directory, served by the main `server.js` file.
