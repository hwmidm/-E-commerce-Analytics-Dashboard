import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Product from "../../model/productModel.js";

// --- Configuration ---
// Load environment variables from the config.env file
dotenv.config({ path: "./config.env" });

// --- Database Connection ---
// Connect to MongoDB using the connection string from environment variables
mongoose
  .connect(process.env.LOCAL_DATABASE)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log("DB connection error:", err));

// --- File Path Setup (for ES Modules) ---
// Get current file path and directory name for reading JSON data
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Data Loading ---
// Read the sample question data from the question.json file
const data = JSON.parse(fs.readFileSync(`${__dirname}/products.json`, "utf-8"));

// --- Data Operations ---
// Function to import all data from the JSON file into the database
const importData = async () => {
  try {
    await Product.create(data); // Create documents in the Questions collection
    console.log("data loaded successfully !!!");
    process.exit(0); // Exit process on success
  } catch (error) {
    console.log("cannot import data", error);
    process.exit(1); // Exit process on failure
  }
};


// Function to delete all data from the Questions collection in the database
const deleteData = async () => {
  try {
    await Product.deleteMany();  // Delete all documents in the Questions collection
    console.log("data removed successfully !!!");
    process.exit(0); // Exit process on success
  } catch (error) {
    console.log("cannot remove data", error);
    process.exit(1); // Exit process on failure
  }
};

// --- Command Line Argument Handling ---
// Check command-line arguments to determine whether to import or delete data
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
