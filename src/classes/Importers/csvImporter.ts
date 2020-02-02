import {MongoClient} from "mongodb";
import childProcess from "child_process";
import root from "app-root-path"


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



export default mongoimport