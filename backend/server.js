import express from 'express';
import env from 'dotenv';
import connectdb from './config/db.js';
env.config();
const port = process.env.PORT || 3000;
const app= express();

app.get('/',(req,res)=>{
  res.send("Hello World");
});

console.log("Connecting to the database...");
connectdb();

app.listen(port,()=>{
  console.log("Server is running");
  console.log("http://localhost:"+port);
});