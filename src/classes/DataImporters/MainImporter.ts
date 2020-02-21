import https from "https"
import { IncomingMessage } from "http";
import CSVImporter from "../DataImporters/csvImporter";
import fs from "fs";
import rootPath from "app-root-path";
import utils from "util";
import mongoClient from "../../database/mongoClient";
import {routeQueryCreator} from "../Inventory/queryCreator"
import path , {sep} from "path";

const access = utils.promisify(fs.access);
const mkdir = utils.promisify(fs.mkdir);

export default class Inventory {
    private url: string = ""
    private mainDir = `${rootPath}${sep}data${sep}inventory${sep}`
    private archiveDir = `${rootPath}${sep}data${sep}inventory${sep}archive${sep}`
    private fileName = ``;
    
    constructor (url: string, dir: string, archiveDir: string, fileName: string){
        this.url = url;
        this.mainDir = `${rootPath}${dir}`;
        this.archiveDir = `${rootPath}${archiveDir}`;
        this.fileName = fileName;
        return this;
    }

    public  download = async ( ) => {
       return await this.checkForAndCreateDir(this.mainDir)
       .then(this.archiveExisting)
       .then(this.beginSavingDataStream)
    }

    private beginSavingDataStream = async ( ) => {
        return https.get(this.url,this.processFile).on("close", ()=> console.log("connection closed"))
    }

    private processFile = (res: IncomingMessage ) => {
        const { statusCode } = res;
        res.on("data", (chunk)=>{
            fs.appendFileSync(
                this.mainDir + this.fileName,
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

    private archiveExisting = async ( ) => {
       return await this.checkForAndCreateDir(this.archiveDir).then(async ()=>{
            const fileNameInfo = path.parse(this.fileName);
            const mainFile = this.mainDir + this.fileName;
            const archivedFile =  this.archiveDir + `${fileNameInfo.name}_${Date.now()}${fileNameInfo.ext}`
            console.log(mainFile)
            fs.exists(mainFile,(exist)=>{
                if(exist){
                    fs.copyFileSync(mainFile,archivedFile)
                    fs.unlinkSync(this.mainDir + this.fileName)
                }
            })
        })
    }



}
