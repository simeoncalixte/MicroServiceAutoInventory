"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const Router_1 = __importDefault(require("./src/classes/Router"));
const dotenv_1 = __importDefault(require("dotenv"));
const Inventory_1 = __importDefault(require("./src/classes/Inventory/Inventory"));
//load environment variables 
dotenv_1.default.config();
Router_1.default.createRoute("GET", "/", (req, res) => {
});
/**
 * @todo : make routes accept method calls and index route accept args
 */
let url = `/Inventory/?Year:/?make:/?model:/?modelDetail:/?bodyStyle:`;
url += `/?color:/?odometer:/?hasKeys:/?retailValue:/?repairCost:/?buyItNowPrice:`;
url += `/?engine:/?drive:/?transmission:/?fuelType:/?cylinder:/?runAndDrive:`;
url += `/?makeAnOffer:/?damages:/?locationProximity:`;
Router_1.default.createRoute("GET", url, (req, res, data) => {
    Inventory_1.default.getInventory(data).then((array) => {
        res.writeHead(200, "Success", { "Content-type": "application/json" });
        res.write(JSON.stringify(array));
        res.end();
    });
});
Router_1.default.createRoute("GET", `/favicon.ico`, (req, res, data) => {
    res.statusCode = 204;
    res.end();
});
const server = http_1.default.createServer((req, res) => {
    Router_1.default.handleRequest(req, res);
});
server.listen(8000, "localhost", () => {
    console.log("listening on  PORT 8000");
});
