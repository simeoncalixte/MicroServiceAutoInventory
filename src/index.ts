import http, { IncomingMessage, ServerResponse } from "http";
import express, { Express, NextFunction, Request, Response } from "express";
import router from "./classes/Router";
import dotenv from "dotenv";
import createInventoryRoutes from "./classes/Inventory/route";
import cors from "cors";
// load environment variables
dotenv.config();
// initialize express
const server = express();

server.use(cors());
// Define routes
createInventoryRoutes(server);
server.listen(8000, "localhost", () => {
  console.log("listening on  PORT 8000");
});
