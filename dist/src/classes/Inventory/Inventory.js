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
const MainImporter_1 = __importDefault(require("../DataImporters/MainImporter"));
const path_1 = require("path");
const csv_parse_1 = __importDefault(require("csv-parse"));
const stream_transform_1 = __importDefault(require("stream-transform"));
const zipInfo_1 = require("../../data/location/zipInfo"); // fix type definitions
const access = util_1.default.promisify(fs_1.default.access);
const mkdir = util_1.default.promisify(fs_1.default.mkdir);
class Inventory {
    constructor(url) {
        this.url = "";
        this.mainInventoryCSVDir = `${path_1.sep}src${path_1.sep}data${path_1.sep}inventory${path_1.sep}`;
        this.archiveInventoryCSVDir = `${path_1.sep}src${path_1.sep}data${path_1.sep}inventory${path_1.sep}archive${path_1.sep}`;
        this.fileName = `inv.csv`;
        this.download = () => {
            const i = new MainImporter_1.default(this.url, this.mainInventoryCSVDir, this.archiveInventoryCSVDir, this.fileName);
            i.download().then((res) => {
                console.log("Hello");
                this.parseCSV();
            });
        };
        this.parseCSV = () => {
            const output = [];
            const parser = csv_parse_1.default({
                delimiter: ',',
                skip_lines_with_error: true,
                columns: true
            });
            const transformCSV = stream_transform_1.default((data) => {
                const geoJSON = {
                    type: "Point",
                    coordinates: [0, 0]
                };
                console.log(zipInfo_1.zipCodes[data["Location ZIP"]]); // @todo : fix any types
                if (zipInfo_1.zipCodes[data["Location ZIP"]]) {
                    geoJSON.coordinates[0] = zipInfo_1.zipCodes[data["Location ZIP"]].latitude;
                    geoJSON.coordinates[1] = zipInfo_1.zipCodes[data["Location ZIP"]].longitude;
                    data.geoLocation = geoJSON;
                }
                // this is invoked first
                return JSON.stringify(data);
            });
            transformCSV.on("data", (chunk) => {
                //console.log({chunk})
            });
            transformCSV.on("error", (error) => {
                // this is invoked on error
                console.log({ error });
            });
            parser.on("close", () => { });
            parser.on("data", (chunk) => { return chunk; });
            parser.on("end", () => { console.log("ended"); });
            parser.on("error", (error) => { console.log(error); });
            parser.on("readable", () => {
                const output = [];
                //console.log("READABLE")
                while (parser.read()) {
                    //console.log(parser.read())
                    output.push(parser.read());
                }
                return output;
            });
            const src = fs_1.default.createReadStream(app_root_path_1.default + path_1.sep + this.mainInventoryCSVDir +
                path_1.sep + this.fileName, { encoding: "utf8" });
            const dest = fs_1.default.createWriteStream(app_root_path_1.default + path_1.sep +
                this.mainInventoryCSVDir + path_1.sep + "inv.json");
            src.pipe(parser).pipe(transformCSV).pipe(dest);
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
