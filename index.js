"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const RequestHandler_1 = __importDefault(require("./src/classes/RequestHandler"));
const dotenv_1 = __importDefault(require("dotenv"));
const getInventory_1 = __importDefault(require("./src/classes/getInventory"));
//load environment variables 
dotenv_1.default.config();
const ReqHandler = new RequestHandler_1.default();
ReqHandler.router.createRoute("GET", "/", (req, res) => {
    console.log("Hello /");
});
/**
 * @todo : make routes accept method calls and index route accept args
 */
ReqHandler.router.createRoute("GET", `/Inventory/?Year:/?make:/?model:/?modelGroup:/?bodyStyle:/?color:/?odometer:/?hasKeys:`, (req, res, data) => {
    getInventory_1.default.getInventory(data).then((array) => {
        res.writeHead(200, "Success", { "Content-type": "application/json" });
        res.write(JSON.stringify(array));
        res.end();
    });
});
ReqHandler.router.createRoute("GET", `/favicon.ico`, (req, res, data) => {
    res.statusCode = 204;
    res.end();
});
const server = http_1.default.createServer((req, res) => {
    ReqHandler.handleRequest(req, res);
});
server.listen(8000, "localhost", () => {
    console.log("listening on  PORT 8000");
});
