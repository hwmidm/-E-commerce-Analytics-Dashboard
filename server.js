import { configDotenv } from "dotenv";
configDotenv({ path: "./config.env" });

import mongoose from "mongoose";

import app from "./app.js";

if(process.env.development) {
    console.log("Development");
} else if (process.env.production){
    console.log("Production");
}

const port = process.env.PORT || 3000;

app.listen(port , ()=>{
    console.log(`This server is running on port ${port}`);
})