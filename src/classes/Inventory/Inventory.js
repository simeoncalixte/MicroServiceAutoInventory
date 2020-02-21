"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const csvImporter_1 = __importDefault(require("../DataImporters/csvImporter"));
const fs_1 = __importDefault(require("fs"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const util_1 = __importDefault(require("util"));
const mongoClient_1 = __importDefault(require("../../database/mongoClient"));
const queryCreator_1 = require("../Inventory/queryCreator");
const access = util_1.default.promisify(fs_1.default.access);
const mkdir = util_1.default.promisify(fs_1.default.mkdir);
class Inventory {
    constructor(url) {
        this.url = "";
        this.mainInventoryCSVDir = `${app_root_path_1.default}\\data\\inventory\\`;
        this.archiveInventoryCSVDir = `${app_root_path_1.default}\\data\\inventory\\archive\\`;
        this.fileName = `inv.csv`;
        this.download = () => {
            this.checkForAndCreateDir(this.mainInventoryCSVDir)
                .then(this.archiveExistingInventoryCSV)
                .then(this.beginSavingDataStream);
        };
        this.beginSavingDataStream = async () => {
            return https_1.default.get(this.url, this.processNewInventoryFile);
        };
        this.processNewInventoryFile = (res) => {
            const { statusCode } = res;
            res.on("data", (chunk) => {
                fs_1.default.appendFileSync(this.mainInventoryCSVDir + this.fileName, chunk);
            });
            res.on("end", (data) => {
                //TODO :: CORRECT extraneous " in field 4408 column 300
                const db = csvImporter_1.default();
            });
        };
        this.checkForAndCreateDir = (dir) => {
            const check = access(dir).catch((err) => {
                return mkdir(dir, { recursive: true });
            });
            return check;
        };
        this.archiveExistingInventoryCSV = async () => {
            return this.checkForAndCreateDir(this.archiveInventoryCSVDir).then(() => {
                fs_1.default.copyFileSync(this.mainInventoryCSVDir + this.fileName, this.archiveInventoryCSVDir + `inv_${Date.now()}.csv`);
                fs_1.default.unlinkSync(this.mainInventoryCSVDir + this.fileName);
            });
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
