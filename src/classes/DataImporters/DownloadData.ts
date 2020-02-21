import https from "https"
import { IncomingMessage } from "http";
import CSVImporter from "./csvImporter";
import fs from "fs";
import rootPath from "app-root-path";
import utils from "util";
import mongoClient from "../../database/mongoClient";
import path , {sep} from "path";

const access = utils.promisify(fs.access);
const mkdir = utils.promisify(fs.mkdir);

export default class Inventory {
    private url: string = ""
    private mainDir = `${rootPath+sep}`
    private archiveDir = `${rootPath+sep}archive${sep}`
    private fileName = ``;
    
    constructor (url: string, dir: string, archiveDir: string, fileName: string){
        this.url = url;
        this.mainDir = `${rootPath+sep}${dir}`;
        this.archiveDir = `${rootPath+sep}${archiveDir}`;
        this.fileName = fileName;
    }

    public  download = async ( ) => {
       return await this.checkForAndCreateDir(this.mainDir)
       .then(this.archiveExisting)
       .then(this.beginSavingDataStream)
    }

    private beginSavingDataStream = async ( ) => {
        return https.get(this.url,this.processFile);
    }

    private processFile = (res: IncomingMessage ) => {
        const { statusCode } = res;
        res.on("data", (chunk)=>{
            console.log(chunk)
            fs.appendFileSync(
                this.mainDir + this.fileName,
                chunk
            );
        })
        res.on("end", (data: any)=>{
            //TODO :: CORRECT extraneous " in field 4408 column 300
           // const db = CSVImporter();
        })
    }

    private checkForAndCreateDir = (dir: string) => {
        console.log(dir)
        const check = access(dir).catch((err)=>{
            console.log("Making Dir", dir)
           return mkdir(dir,{recursive:true})
        })
        return check
    }

    private archiveExisting = async ( ) => {
       return await this.checkForAndCreateDir(this.archiveDir).then(async ()=>{
            const fileNameInfo = path.parse(this.fileName);
            const mainFile = this.mainDir + this.fileName;
            const archivedFile =  this.archiveDir + `${fileNameInfo.name}_${Date.now()}${fileNameInfo.ext}`
             fs.exists(mainFile,(exist)=>{
                 if(exist){
                     fs.copyFileSync(mainFile,archivedFile)
                     fs.unlinkSync(this.mainDir + this.fileName)
                 }
             })

        })
    }



}