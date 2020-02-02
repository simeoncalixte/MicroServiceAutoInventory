import https from "https"
import { IncomingMessage } from "http";
import CSVImporter from "./Importers/csvImporter";
import fs from "fs";
import rootPath from "app-root-path";
import utils from "util";
import mongoClient from "../database/mongoClient";
import { MongoClient } from "mongodb";


const access = utils.promisify(fs.access);
const mkdir = utils.promisify(fs.mkdir);

interface IRange{
    $gt : number,
    $lt : number

}

const parseCSVValues = ( str: string) => {
    return   str?.split(",").map(str => str.toUpperCase());
}

const parseRange = ( str : string ) => {
    const indiArgs = str?.match(/\d+(-\d+)/gi);
    let rangeQuery;
    
    if (indiArgs){
        const range = indiArgs[0].split("-").sort();
        rangeQuery = {$gt: parseInt(range[0]), $lt: parseInt(range[1])}
        return rangeQuery; 
    }

}

const routeQueryCreator : {[key:string]: Function} =  {

    "Year" : (yearArgs: string) => {
        let rangeQuery : IRange | undefined;
        let indiQuery : number[] = [];
        const indiArgs = yearArgs?.match(/\d+(-\d+)?/gi);
        
        indiArgs?.forEach( (args) => {
            if(args.search("-") > 0){
                const range = (args.split("-"));
                rangeQuery = {$gt: parseInt(range[0]), $lt: parseInt(range[1])}
            }else{
                const number = parseInt(args);
                indiQuery.push(number);
            };
        });

        if(indiQuery && rangeQuery){
            return {
               $or: [
                   {Year:{$in:indiQuery}},
                   {Year: {...rangeQuery}}
                ]
            }
        }else if (indiQuery){
            return {Year:{$in:indiQuery}}

        }else if (rangeQuery){
            return {Year: {...rangeQuery}}
                
        }

    

    },
    "make" : (make: string ) => {
        let makes = parseCSVValues(make);
        return makes ? {"Make": {$in: makes}} : null;
    },
    "model" : (model: string) => {
        let models = parseCSVValues(model);
        return models ? {"Model Group": {$in: models}} : null;
    },
    "modelGroup" : (modelGroup : string ) => {
        let modelGroups = parseCSVValues(modelGroup);
        return modelGroups ? {"Model Detail": {$in: modelGroups}} : null;
    },
    "bodyStyle" : (bodyStyle : string ) => {
        let bodyStyles = parseCSVValues(bodyStyle);
        return bodyStyles ? {"Body Style": {$in: bodyStyles}} : null;
    },
    "color" : (color : string ) => {
        let colors = parseCSVValues(color);
        return colors ? {"Color": {$in: colors}} : null;
    },
    "odometer" : (odometer : string ) => {
        console.log("ODOMETER",parseRange(odometer));
        return !!odometer ? {"Odometer": parseRange(odometer)} : null;
    },
    "hasKeys" : (hasKeys: string) => {
        if (!!hasKeys){
         return {"Has Keys-Yes or No":  hasKeys.toUpperCase()};
        }
        
    },
    "damage" : ( ) => {},
    "bodyType" : ( ) => {},
    "subModel" : ( ) => {},
}

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
        console.log(query)
        return query;

    }
    
    static  getInventory =  async( data : any ) => {
       return await mongoClient()?.then((MongoClient) =>{
        let query = Inventory.createQuery(data) as Object;
        return MongoClient.db("Inventory")
                .collection("main")
                .find(query)
                .toArray().then((element)=>{
                    return element
                })
        })
    }


}
