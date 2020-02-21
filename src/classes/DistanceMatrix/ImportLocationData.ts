import Importer from "../DataImporters/MainImporter"
import {mongoImport2} from "../DataImporters/csvImporter"
import {sep} from "path";
import rootPath from "app-root-path";
import Mongo from "../../database/mongoClient"
/**
 * @todo : Have a document for each file 
 */
//const url = "https://raw.githubusercontent.com/davglass/zipcodes/master/lib/codes.js";
const fileLocation = `${sep}data${sep}location${sep}`;
const fileArciveLocation = `${sep}data${sep}location${sep}archive${sep}`;
const fileName = `zipInfo.csv`;
const location = rootPath+fileLocation+fileName;

try{
    const args = `--uri mongodb://localhost:27017/Inventory -c locationServices --type csv --headerline --file ${location}`
    const mongoImport = mongoImport2(args)
    mongoImport.on("message", (message)=> console.log(message))
    mongoImport.on("error", (error)=> console.log(error))
    mongoImport.on("exit", (exit)=> console.log(exit))
    mongoImport.on("close", (close)=> console.log(close))
}catch(e){
    console.log(e)
}
//const Import = new Importer(url,fileLocation,fileArciveLocation,fileName);
//Import.download().then((value)=>{
//    console.log(
//    )
//});
//export default Import