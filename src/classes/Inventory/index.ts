import fs from "fs";
import rootPath from "app-root-path";
import mongoClient from "../../database/mongoClient";
import { routeQueryCreator, attributeQueryCreator } from "./queryCreator";
import queryTable from "./queryTable";
import DataImporter from "../DataImporters/DownloadData";
import { sep } from "path";
import csvParser from "csv-parse";
import transformer from "stream-transform";
import mongoImporter from "../DataImporters/csvImporter";
import findZipData from "../../utils/location";
import { Request, Response } from "express";
import aggregateAttributes from "../../database/Inventory/aggregations/updateAttritbutes";
import axios from "axios";
import getAttribute, {AttributeMap} from "./collectionTable";
import getCollectionName from "./collectionTable";

interface IAttribute {
  [key: string] : string
}

export default class Inventory {
  private url?: string = "";
  private mainInventoryCSVDir = `${sep}data${sep}inventory${sep}`;
  private archiveCSVDir = `${sep}data${sep}inventory${sep}archive${sep}`;
  private fileName = `inv.csv`;
  static responseLimit = 1000;

  constructor(url?: string) {
    this.url = url;
  }

  public download = async () => {
    if (this.url) {
      const i = new DataImporter(
        this.url,
        this.mainInventoryCSVDir,
        this.archiveCSVDir,
        this.fileName
      );
      i.download().then(() => {
        this.parseCSV();
        Inventory.updateAttributes;
      });
    }
  };

  private parseCSV = async () => {
    const output: {}[] = [];
    const parser = csvParser({
      delimiter: ",",
      skip_lines_with_error: true,
      columns: true,
      quote: '"',
      cast: true,
      cast_date: true,
    });

    const src = fs.createReadStream(
      rootPath + sep + this.mainInventoryCSVDir + sep + this.fileName,
      { encoding: "utf8" }
    );
    const dest = fs.createWriteStream(
      rootPath + sep + this.mainInventoryCSVDir + sep + "inv.json"
    );

    const transformCSV = transformer((data: { [key: string]: any }) => {
      // find corresponding lon and lat from zip code and assign a
      // geoJSON object to the data
      if (data["Location ZIP"]) {
        const zipData = findZipData(data["Location ZIP"]);
        zipData ? (data.geoLocation = zipData) : null;
      }
      // this is invoked first
      return data;
    });

    transformCSV.on("data", (chunk) => {
      output.push(chunk);
    });

    transformCSV.on("error", (error) => {
      // this is invoked on error
    });
    parser.on("error", (error) => {
      console.log(error);
    });

    src
      .pipe(parser)
      .pipe(transformCSV)
      .on("end", () => {
        dest.write(JSON.stringify(output), (error) => {
          if (error) return;
          else this.importInventory();
        });
      });
  };

  private static createQuery =  (data: { [key: string]: any }) => {
    let query = {};
    for (const key in data) {
        if(typeof queryTable(key) !== "function") {
          console.log(`${key} is not a query function`);
          continue;
        };

        let createdQuery = queryTable(key)(data[key]);
        console.debug({createdQuery})
        query = Object.assign(query, createdQuery);
      }
    console.log({query})
    return query;
  };

  
  static getInventory = async (req: Request, res: Response) => {
    const data = { ...req.params, ...req.query };
    console.log({data})
    return mongoClient()?.then((MongoClient) => {
      
      const query =   Inventory.createQuery(data);
      console.log(query);
      // convert page string to number
      const collection = MongoClient.db("Inventory").collection("main");
      const page = data && data.page && !Number.isNaN(data.page)
      ? (Number(data.page) - 1)*-1
      : 0;
      const limit = data.limit &&
      !Number.isNaN(data.limit) &&
      Number(data.limit) <= Inventory.responseLimit
          ? Number(data.limit): (Inventory.responseLimit as number);
          const find = collection.find(query);
      find.count((error, count) => {
        find
          .skip(page * limit)
          .limit(limit * 1)
          .toArray()
          .then((data) => {
            res.json({
              Inventory: {
                totalRecords: count,
                paginationInfo: {
                  currentPage: page + 1,
                  limit,
                  lastPage: Math.ceil(count / Inventory.responseLimit),
                },
                data,
              },
            });
          })
          .finally(() => [res.end()]);
        });
    }).catch(e=> console.error(e));
  };
  
  static getImages = async (req: Request, res: Response) => {
    const data = { ...req.params, ...req.query };
    const url = data && data.url ? String(data.url) : "";
    
    try {
      let images;
      await axios.get(url).then((res) => {
        images = res.data;
      });
      res.json(images);
      res.end();
    } catch (e) {
      console.log(e);
    }
  };

  static getAttributes = async (req: Request, res: Response) => {
    let promises = [];
    // if there is properties within the query with or without values
    if (Object.keys(req.query).length > 0){
      // for each property within query
      for (const property in req.query) {
        /// for uniformity make the key lowercase if possible
        const attribute = property.toLowerCase();
        // retrieve the proper collection name to be queried. 
        const properCollectionName = getCollectionName(attribute);
        // assign the values of the current property to memory
        const queryValues = req.query[property];
        console.log({queryValues});
        let parsedValue = "";
        if(queryValues){
          const isArray = Array.isArray(queryValues);
          //@ts-ignore //array is being parsed but ts doesn't not recognize this
          parsedValue = isArray ? queryValues.map((element)=>JSON.parse(element)) : JSON.parse(queryValues);
        }
        if(properCollectionName){
            //lookup query creator for the collection 
            const queryFunction = attributeQueryCreator[properCollectionName];
            const executed = queryFunction ? queryFunction(parsedValue) : null;
            console.log({properCollectionName, queryValues,parsedValue,executed});
            promises.push(
              Inventory.fetchAttributes(
                properCollectionName,
                executed
              )
            )
          }
          //return a one dimensional array if there is only one promise in @var promises
          const promiseResolver = promises.length > 1 ? Promise.all(promises) : promises[0];
          return promiseResolver.then((results)=>{
            res.json(results)
            res.end()
          })
        }
      }else{
        const attributes = Inventory.fetchAllAttributes();
        const keys = Object.keys(attributes);
        promises = Object.values(attributes);
        Promise.all(promises).then(results =>{
          const newObject : {[key:string]: any} = {}
          results.forEach((result,index) =>{
            newObject[keys[index]] = result;
          })
          console.log("the results",{results})
          res.json(newObject);
          res.end()
        })
    }
    


  };

  private importInventory = async () => {
    const path = rootPath + this.mainInventoryCSVDir + "inv.json";
    const args = `--uri mongodb://localhost:27017/Inventory -c main --drop --type json --jsonArray --file ${path}`;
    const mongoImport = mongoImporter(args);
    mongoImport.on("message", (message) => console.log({ message }));
    mongoImport.on("error", (error) => console.log({ error }));
    mongoImport.on("exit", (exit) => console.log({ exit }));
    mongoImport.on("close", (close) => console.log({ close }));
  };

  static updateAttributes = async () => {
    console.log("updating attributes");
    console.log(mongoClient());
    return mongoClient()?.then( async(MongoClient) => { 
      console.log("mongoConnected");
      const collection = MongoClient.db("Inventory").collection("main");
    const aggregatedCollection = aggregateAttributes(collection);
      return aggregatedCollection;
    })
    .catch((error) => {
      console.error(error);
    });
  };

  static fetchAllAttributes = ( ) => {
      const object: {[key:string] : any}= {};

      for (const [key,collectionName] of AttributeMap) {
          object[collectionName] = Inventory.fetchAttributes(collectionName);
      }

      return object;
  }

  /**
   * @param collectionName the name of the mongodb attribute collection to fetch
   * @param query the mongodb query object that will be executed on the collection
   */
  static fetchAttributes = (collectionName: string, query?: any ) => {
    return new Promise ((resolve,reject)=>{
      mongoClient()?.then( (MongoClient) => {
        MongoClient.db("Inventory")
        .collection(collectionName)
        .find(!query ? undefined : query)
        .toArray((error, results) => {
        if (error) reject(error);
          console.log({results})
          resolve(results)
        });
      })
    })

  }
}
