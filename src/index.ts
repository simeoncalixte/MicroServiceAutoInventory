import http, { IncomingMessage, ServerResponse } from "http";
import express, {Express, NextFunction,Request,Response} from "express";
import router from "./classes/Router"
import dotenv from "dotenv";
import Inventory from "./classes/Inventory/route";
//load environment variables 
dotenv.config();
// initialize express
const server = express();
Inventory(server);
server.listen(8000,"localhost",()=>{
    console.log("listening on  PORT 8000")
});

