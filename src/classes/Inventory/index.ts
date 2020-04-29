
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
import { Request, Response, json } from "express";
import aggregateAttributes from "../../processes/updateAttributes";

const access = utils.promisify(fs.access);
const mkdir = utils.promisify(fs.mkdir);

declare function emit ( k:any , v?:any) : void;
declare function print (message: any) : void;
export default class Inventory {
    private url?: string = "";
    private mainInventoryCSVDir = `${sep}data${sep}inventory${sep}`;
    private archiveInventoryCSVDir = `${sep}data${sep}inventory${sep}archive${sep}`;
    private fileName = `inv.csv`;
    static responseLimit = 1000;
    
    constructor (url?: string){
        this.url = url;
    }

    public  download = async ( ) => {
        if(this.url){
            const i = new DataImporter(this.url,this.mainInventoryCSVDir,this.archiveInventoryCSVDir,this.fileName)
            i.download().then(()=>{
                this.parseCSV()
                Inventory.updateAttributes
            });
        }
    }
    
    private parseCSV = async ( ) => {
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
                else this.importInventory()
            })
        });
    }

    private static createQuery = async ( data: {[key:string]: any} )  => {
        let query = {}
        for ( const key in  data) {
            if (data[key] && routeQueryCreator[key]) {
               query = (Object.assign(query,routeQueryCreator[key](data[key])))
            }else{}
        }
        return query;

    }

    private importInventory = async ( ) => {
        const path = rootPath+this.mainInventoryCSVDir+"inv.json"
        const args = `--uri mongodb://localhost:27017/Inventory -c main --drop --type json --jsonArray --file ${path}`
        const mongoImport = mongoImporter(args)
        mongoImport.on("message", (message)=> console.log({message}))
        mongoImport.on("error", (error)=> console.log({error}))
        mongoImport.on("exit", (exit)=> console.log({exit}))
        mongoImport.on("close", (close)=> console.log({close}))
    }
    
    static  getInventory =  async( req: Request, res: Response ) => {
        console.log(req.params,req.query);
        const data = {...req.params,...req.query};
        
        return mongoClient()?.then((MongoClient) =>{
          let query = Inventory.createQuery(data);
          const page = data.page? data.page-1 : 0;
          const limit: number = data.limit && (data.limit  <= Inventory.responseLimit)? 
                          data.limit 
                          : Inventory.responseLimit as number
          let cursor = MongoClient.db("Inventory")
                        .collection("main");

          const find =  cursor.find(query);   
          find.count((error,count)=>{
              find.skip(page*limit)
              .limit(limit*1)
              .toArray().then((data)=>{
                  res.json(
                    {
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
                  )
              }).finally(()=>[
                  res.end()
              ])
              
          })
                  

        })
    }

    static updateAttributes = async () => {
        return mongoClient()?.
        then((MongoClient) =>{
            const collection = MongoClient.db("Inventory")
                .collection("main");
            aggregateAttributes(collection);
        }).catch(error => {
            console.error(error)
        })
    }

    static attributes = async(req: Request,res: Response) => {
       return mongoClient()?.
        then((MongoClient) =>{
            return MongoClient.db("Inventory")
                .collection("test").find().toArray((error,results)=>{
                    if (error) console.error(error);
                    res.json(results[0])
                    res.end();
                })
        })

    }
}
