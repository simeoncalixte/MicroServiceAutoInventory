import {Express} from "express";
import { IncomingMessage, Server, ServerResponse } from "http";
import Inventory from "./";




export default (server: Express) =>{
    ///Route for inventory images//////////////////////////////////////////////////
    server.get("/Inventory/images", Inventory.getImages);
    /////////////////////////////////////////////////////////////////////////////////
    //Attribute Routes
    let attributesParams = `:attributes?`;
    server.get("/Inventory/attributes"+attributesParams, Inventory.attributes);
    /////////////////////////////////////////////////////////////////////////////////
    //List Inventory Route
    let listParams = `/:Year?/:make?/:model?/:modelDetail?/:bodyStyle?`;
    listParams += `/:color?/:odometer?/:hasKeys?/:retailValue?/:repairCost?/:buyItNowPrice?`;
    listParams += `/:engine?/:drive?/:transmission?/:fuelType?/:cylinder?/:runAndDrive?`;
    listParams += `/:makeAnOffer?/:damages?/:locationProximity?`;
    server.get("/Inventory/list"+listParams, Inventory.getInventory);
    server.get("/Inventory"+listParams, Inventory.getInventory);
}