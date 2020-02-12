import {MongoClient} from "mongodb";
import childProcess from "child_process";
import root from "app-root-path"
import path from "path"

const mongoimport = ( ) =>  childProcess.spawn(
  `mongoimport`,
  [
   '--uri','mongodb://localhost:27017/Inventory',
   '-c',"main",
   "--type","csv",
   "--headerline",
   "--file",`${root + "\\data\\inventory\\inv.csv"}`,
  ]
  );



 export const mongoImport2 = (options: string ) =>{  
  console.log(options.split(/\s+/))
  return childProcess.spawn(
    `mongoimport`,
    options.split(/\s+/)

  );
}



export default mongoimport