import https from "https"
import { IncomingMessage } from "http";
import CSVImporter from "../DataImporters/csvImporter";
import fs from "fs";
import rootPath from "app-root-path";
import utils from "util";
import mongoClient from "../../database/mongoClient";
import {routeQueryCreator} from "../Inventory/queryCreator"


const access = utils.promisify(fs.access);
const mkdir = utils.promisify(fs.mkdir);

export default class Inventory {
    private url: string = "";
    private mainInventoryCSVDir = `${rootPath}\\data\\inventory\\`;
    private archiveInventoryCSVDir = `${rootPath}\\data\\inventory\\archive\\`;
    private fileName = `inv.csv`
    
    constructor (url: string){
        this.url = url;
    }

    public  download = ( ) => {
       this.checkForAndCreateDir(this.mainInventoryCSVDir)
       .then(this.archiveExistingInventoryCSV)
       .then(this.beginSavingDataStream)
    }

    private beginSavingDataStream = async ( ) => {
        return https.get(this.url,this.processNewInventoryFile)
    }

    private processNewInventoryFile = (res: IncomingMessage ) => {
        const { statusCode } = res;
        res.on("data", (chunk)=>{
            fs.appendFileSync(
                this.mainInventoryCSVDir + this.fileName,
                chunk
            );
        })
        res.on("end", (data: any)=>{
            //TODO :: CORRECT extraneous " in field 4408 column 300
            const db = CSVImporter();
        })
    }

    private checkForAndCreateDir = (dir: string) => {
        const check = access(dir).catch((err)=>{
           return mkdir(dir,{recursive:true})
        })
        return check
    }

    private archiveExistingInventoryCSV = async ( ) => {
       return this.checkForAndCreateDir(this.archiveInventoryCSVDir).then(()=>{
            fs.copyFileSync(
                this.mainInventoryCSVDir + this.fileName,
                this.archiveInventoryCSVDir + `inv_${Date.now()}.csv`
            )
            fs.unlinkSync(this.mainInventoryCSVDir + this.fileName)
        })
    }
    
    private static createQuery = ( data: {[key:string]: any} )  => {
        let query = {}
        for ( const key in  data) {
            console.log(key)
            if (routeQueryCreator[key]) {
               query = (Object.assign(query,routeQueryCreator[key](data[key])))
            }else{}
        }
        return query;

    }
    
    static  getInventory =  async( data : any ) => {
       return await mongoClient()?.then((MongoClient) =>{
        let query = Inventory.createQuery(data);
        console.log(query)
        return MongoClient.db("Inventory")
                .collection("main").aggregate([
                    {
                      $geoNear: {
                         near: { type: "Point", coordinates: [ -73.99279 , 40.719296 ] },
                         distanceField: "dist.calculated",
                         maxDistance: 2,
                         query: { category: "Parks" },
                         includeLocs: "dist.location",
                         spherical: true
                      },
                      ...query
                    }
                 ])
                .toArray().then((element)=>{
                    return element
                })
        })
    }


}
