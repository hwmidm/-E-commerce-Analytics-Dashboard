import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";


// *** Configurations ***
// Load enviroment variable
configDotenv({ path: "./config.env" });

// DATABASE Connection
mongoose
  .connect(process.env.LOCAL_DATABASE)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => console.log(`DB connection failed : ${err}`));


// Enviroment logging 
if (process.env.development) {
  console.log("Development");
} else if (process.env.production) {
  console.log("Production");
}

// server setup and start server
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`This server is running on port ${port}`);
});
