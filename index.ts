import http, { IncomingMessage, ServerResponse } from "http";
import router from "./src/classes/Router"
import dotenv from "dotenv";
import Inventory from "./src/classes/Inventory";
//load environment variables 
dotenv.config()


router.createRoute("GET", "/",(req: IncomingMessage, res: ServerResponse)=>{
});

/**
 * @todo : make routes accept method calls and index route accept args  
 */
let url = `/Inventory/?Year:/?make:/?model:/?modelDetail:/?bodyStyle:`
url += `/?color:/?odometer:/?hasKeys:/?retailValue:/?repairCost:/?buyItNowPrice:`;
url += `/?engine:/?drive:/?transmission:/?fuelType:/?cylinder:/?runAndDrive:`;
url += `/?makeAnOffer:/?damages:/?locationProximity:`;
router.createRoute(
    "GET", 
    url,
    (req,res,data) => {
        Inventory.getInventory(data).then((array)=>{
            res.writeHead(200,"Success",{"Content-type": "application/json"})
            res.write(JSON.stringify(array))
            res.end();
        })
    }
);

router.createRoute(
    "GET", `/favicon.ico`,
    (req,res,data) => {
        res.statusCode = 204
        res.end()    
    }
);

const server = http.createServer(
    (req: IncomingMessage,res: ServerResponse) => {
        router.handleRequest(req,res);
    });

server.listen(8000,"localhost",()=>{
    console.log("listening on  PORT 8000")
});

