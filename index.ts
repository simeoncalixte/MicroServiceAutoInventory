import http, { IncomingMessage, ServerResponse } from "http";
import RequestHandler from "./src/classes/RequestHandler"
import dotenv from "dotenv";
import Inventory from "./src/classes/getInventory";
//load environment variables 
dotenv.config()

 

const ReqHandler = new RequestHandler();
ReqHandler.router.createRoute("GET", "/",(req: IncomingMessage, res: ServerResponse)=>{
    console.log("Hello /")
});


/**
 * @todo : make routes accept method calls and index route accept args  
 */
ReqHandler.router.createRoute(
    "GET", 
    `/Inventory/?Year:/?make:/?model:/?modelGroup:/?bodyStyle:/?color:/?odometer:/?hasKeys:`,
    (req,res,data) => {
        Inventory.getInventory(data).then((array)=>{
            res.writeHead(200,"Success",{"Content-type": "application/json"})
            res.write(JSON.stringify(array))
            res.end();
        })
    }
);

ReqHandler.router.createRoute(
    "GET", `/favicon.ico`,
    (req,res,data) => {
        res.statusCode = 204
        res.end()    
    }
);


const server = http.createServer(
    (req: IncomingMessage,res: ServerResponse) => {
        ReqHandler.handleRequest(req,res);
    });

server.listen(8000,"localhost",()=>{
    console.log("listening on  PORT 8000")
});

