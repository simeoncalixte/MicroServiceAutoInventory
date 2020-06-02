"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const route_1 = __importDefault(require("./src/classes/Inventory/route"));
//load environment variables 
dotenv_1.default.config();
// initialize express
const server = express_1.default();
route_1.default(server);
server.listen(8000, "localhost", () => {
    console.log("listening on  PORT 8000");
});
