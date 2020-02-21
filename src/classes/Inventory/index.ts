
import fs, { write } from "fs";
import rootPath from "app-root-path";
import utils from "util";
import mongoClient from "../../database/mongoClient";
import {routeQueryCreator} from "./queryCreator";
import DataImporter from "../DataImporters/DownloadData";
import { sep } from "path";
import csvParser from "csv-parse";
import transformer from "stream-transform"
import mongoImporter from "../DataImporters/csvImporter"
import findZipData from "../../utils/location"

const access = utils.promisify(fs.access);
const mkdir = utils.promisify(fs.mkdir);

export default class Inventory {
    private url?: string = "";
    private mainInventoryCSVDir = `${sep}data${sep}inventory${sep}`;
    private archiveInventoryCSVDir = `${sep}data${sep}inventory${sep}archive${sep}`;
    private fileName = `inv.csv`;
    static responseLimit = 1000;
    
    constructor (url?: string){
        this.url = url;
    }

    public  download = ( ) => {
        if(this.url){
            const i = new DataImporter(this.url,this.mainInventoryCSVDir,this.archiveInventoryCSVDir,this.fileName)
            //i.download().then(
                this.parseCSV()
            //);
        }
    }
    
    private parseCSV = ( ) => {
        const output: {}[] = [];
        const parser = csvParser({
            delimiter: ',',
            skip_lines_with_error: true,
            columns: true,
            quote: '"',
            cast: true,
            cast_date: true,
        });
        const src =  fs.createReadStream( 
            rootPath+sep+this.mainInventoryCSVDir+
            sep+this.fileName,{encoding: "utf8"}
        );
        const dest = fs.createWriteStream(
            rootPath+sep+
            this.mainInventoryCSVDir+sep+"inv.json",         
        );

        const transformCSV = transformer((data: {[key: string]: any})=>{
           // find corresponding lon and lat from zip code and assign a
           // geoJSON object to the data
           if (data["Location ZIP"]) {
               const zipData  = findZipData(data["Location ZIP"]);
               zipData?  data.geoLocation = zipData : null
           }
           // this is invoked first
           return (data);
        });
        
        transformCSV.on("data",(chunk)=>{
            output.push(chunk);
        });

        transformCSV.on("error",(error)=>{
            // this is invoked on error
        });
        parser.on("error",(error)=>{console.log(error)});
        
        src.pipe(parser).pipe(transformCSV).on("end",()=>{
            dest.write(JSON.stringify(output), (error)=>{
                if (error) return
                else this.importInvenotry()
            })
        });
    }

    private static createQuery = ( data: {[key:string]: any} )  => {
        let query = {}
        for ( const key in  data) {
            if (data[key] && routeQueryCreator[key]) {
               query = (Object.assign(query,routeQueryCreator[key](data[key])))
            }else{}
        }
        return query;

    }

    private importInvenotry = ( ) => {
        const path = rootPath+this.mainInventoryCSVDir+"inv.json"
        const args = `--uri mongodb://localhost:27017/Inventory -c main --drop --type json --jsonArray --file ${path}`
        const mongoImport = mongoImporter(args)
        mongoImport.on("message", (message)=> console.log({message}))
        mongoImport.on("error", (error)=> console.log({error}))
        mongoImport.on("exit", (exit)=> console.log({exit}))
        mongoImport.on("close", (close)=> console.log({close}))
    }
    
    static  getInventory =  async( queryObject : {[key : string]: any} ) => {
       return mongoClient()?.then((MongoClient) =>{
        let query = Inventory.createQuery(queryObject);
        const page = queryObject.page? queryObject.page-1 : 0;
        const limit: number = queryObject.limit && (queryObject.limit  <= Inventory.responseLimit)? 
                        queryObject.limit 
                        : Inventory.responseLimit as number
        let cursor = MongoClient.db("Inventory")
                .collection("main")
                .find(query);

        return cursor.count().then((count)=>{
            return cursor
                .skip(page*limit)
                .limit(limit)
                .toArray().then((data)=>{
                    return {
                        Inventory: {
                            totalRecords: count,
                            paginationInfo : {
                                currentPage: page+1,
                                limit,
                                lastPage: Math.ceil(count/Inventory.responseLimit),
                            },
                            data,
                        }
                    }
                })
            });
        })
    }

}

