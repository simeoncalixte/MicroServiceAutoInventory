"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const util_1 = __importDefault(require("util"));
const mongoClient_1 = __importDefault(require("../../database/mongoClient"));
const queryCreator_1 = require("../Inventory/queryCreator");
const DownloadData_1 = __importDefault(require("../DataImporters/DownloadData"));
const path_1 = require("path");
const csv_parse_1 = __importDefault(require("csv-parse"));
const stream_transform_1 = __importDefault(require("stream-transform"));
const csvImporter_1 = __importDefault(require("../DataImporters/csvImporter"));
const location_1 = __importDefault(require("../../utils/location"));
const access = util_1.default.promisify(fs_1.default.access);
const mkdir = util_1.default.promisify(fs_1.default.mkdir);
class Inventory {
    constructor(url) {
        this.url = "";
        this.mainInventoryCSVDir = `${path_1.sep}src${path_1.sep}data${path_1.sep}inventory${path_1.sep}`;
        this.archiveInventoryCSVDir = `${path_1.sep}src${path_1.sep}data${path_1.sep}inventory${path_1.sep}archive${path_1.sep}`;
        this.fileName = `inv.csv`;
        this.download = () => {
            const i = new DownloadData_1.default(this.url, this.mainInventoryCSVDir, this.archiveInventoryCSVDir, this.fileName);
            //i.download().then((res)=>{
            //    
            //});
            this.parseCSV();
        };
        this.parseCSV = () => {
            const output = [];
            const parser = csv_parse_1.default({
                delimiter: ',',
                skip_lines_with_error: true,
                columns: true
            });
            const src = fs_1.default.createReadStream(app_root_path_1.default + path_1.sep + this.mainInventoryCSVDir +
                path_1.sep + this.fileName, { encoding: "utf8" });
            const dest = fs_1.default.createWriteStream(app_root_path_1.default + path_1.sep +
                this.mainInventoryCSVDir + path_1.sep + "inv.json");
            const transformCSV = stream_transform_1.default((data) => {
                // find corresponding lon and lat from zip code and assign a
                // geoJSON object to the data 
                if (data["Location ZIP"]) {
                    const zipData = location_1.default(data["Location ZIP"]);
                    zipData ? data.geoLocation = zipData : null;
                }
                // this is invoked first
                return (data);
            });
            transformCSV.on("data", (chunk) => {
                output.push(chunk);
            });
            transformCSV.on("error", (error) => {
                // this is invoked on error
                console.log({ error });
            });
            parser.on("error", (error) => { console.log(error); });
            src.pipe(parser).pipe(transformCSV).on("end", () => {
                dest.write(JSON.stringify(output), (error) => {
                    if (error)
                        return;
                    else
                        this.importInvenotry();
                });
            });
            //.pipe(dest).on("close",this.importInvenotry);
        };
        this.importInvenotry = () => {
            const path = app_root_path_1.default + this.mainInventoryCSVDir + "inv.json";
            const args = `--uri mongodb://localhost:27017/Inventory -c main --drop --type json --jsonArray --file ${path}`;
            const mongoImport = csvImporter_1.default(args);
            mongoImport.on("message", (message) => console.log({ message }));
            mongoImport.on("error", (error) => console.log({ error }));
            mongoImport.on("exit", (exit) => console.log({ exit }));
            mongoImport.on("close", (close) => console.log({ close }));
        };
        this.url = url;
    }
}
exports.default = Inventory;
Inventory.createQuery = (data) => {
    let query = {};
    for (const key in data) {
        console.log(key);
        if (queryCreator_1.routeQueryCreator[key]) {
            query = (Object.assign(query, queryCreator_1.routeQueryCreator[key](data[key])));
        }
        else { }
    }
    return query;
};
Inventory.getInventory = async (data) => {
    var _a;
    return await ((_a = mongoClient_1.default()) === null || _a === void 0 ? void 0 : _a.then((MongoClient) => {
        let query = Inventory.createQuery(data);
        console.log(query);
        return MongoClient.db("Inventory")
            .collection("main").aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [-73.99279, 40.719296] },
                    distanceField: "dist.calculated",
                    maxDistance: 2,
                    query: { category: "Parks" },
                    includeLocs: "dist.location",
                    spherical: true
                },
                ...query
            }
        ])
            .toArray().then((element) => {
            return element;
        });
    }));
};
new Inventory('https://inventory.copart.io/FTPLSTDM/salesdata.cgi').download();
console.log("the power of async");
