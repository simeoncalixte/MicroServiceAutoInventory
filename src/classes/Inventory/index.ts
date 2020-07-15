import fs from "fs";
import rootPath from "app-root-path";
import mongoClient from "../../database/mongoClient";
import { routeQueryCreator } from "./queryCreator";
import DataImporter from "../DataImporters/DownloadData";
import { sep } from "path";
import csvParser from "csv-parse";
import transformer from "stream-transform";
import mongoImporter from "../DataImporters/csvImporter";
import findZipData from "../../utils/location";
import { Request, Response } from "express";
import aggregateAttributes from "../../database/Inventory/aggregations/updateAttritbutes";
import axios from "axios";

interface IAttribute {
  [key: string] : string
}


export default class Inventory {
  private url?: string = "";
  private mainInventoryCSVDir = `${sep}data${sep}inventory${sep}`;
  private archiveCSVDir = `${sep}data${sep}inventory${sep}archive${sep}`;
  private fileName = `inv.csv`;
  private static  attributeTable : IAttribute = {
    make : 'Makes',
    model: 'Models',
    modelDetail: 'ModelDetail',
    damages: 'Damages'
  }
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

  private static createQuery = async (data: { [key: string]: any }) => {
    let query = {};
    for (const key in data) {
      if (data[key] && routeQueryCreator[key]) {
        query = Object.assign(query, routeQueryCreator[key](data[key]));
      } else {
      }
    }
    return query;
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

  static getInventory = async (req: Request, res: Response) => {
    const data = { ...req.params, ...req.query };
    console.log({data})
    return mongoClient()?.then((MongoClient) => {

      const query = Inventory.createQuery(data);
      // convert page string to number
      const collection = MongoClient.db("Inventory").collection("main");
      const page = data && data.page && !Number.isNaN(data.page)
        ? Number(data.page) - 1
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
            console.log(data)
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

  static updateAttributes = async () => {
    console.log("updating attributes");
    console.log(mongoClient())
    return mongoClient()?.then( async(MongoClient) => { 
        console.log("mongoConnected");
        const collection = MongoClient.db("Inventory").collection("main");
        const aggregatedCollection = await aggregateAttributes(collection);
        return aggregatedCollection;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  static attributes = async (req: Request, res: Response) => {
    let promises = [];
    
    if (Object.keys(req.query).length > 0){
      for (const property in req.query) {
        console.log({property})
        const attribute = property.toLowerCase()
        const properCollectionName = Inventory.attributeTable[attribute];
        const value = req.query[property];
        console.log({properCollectionName})
  
        if(properCollectionName){
          promises.push(
            Inventory.attributeQuery(
              properCollectionName,
              value
            )
          )
        }
      }
    }else{
     promises = Inventory.getAllAttributes();
    }


    return Promise.all(promises).then((results)=>{
       console.log({results})
       res.json(results)
       res.end()
      })
  };

  static getAllAttributes = ( ) => {
      const promises = [];

      for (const property in Inventory.attributeTable) {
        console.log({property})
        const attribute = property.toLowerCase()
        const properCollectionName = Inventory.attributeTable[attribute];
        console.log({properCollectionName})
  
        if(properCollectionName){
          promises.push(
            Inventory.attributeQuery(
              properCollectionName            )
          )
        }
      }

      return promises;
  }

  static attributeQuery = (collectionName: string, query?: any ) => {
    console.log({collectionName,query})
    return new Promise ((resolve,reject)=>{
      mongoClient()?.then( (MongoClient) => {
        MongoClient.db("Inventory")
        .collection(collectionName)
        .find(query)
        .toArray((error, results) => {
        if (error) reject(error);
          console.log("results")
          resolve(results)
        });
      })
    })

  }
}
