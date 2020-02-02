"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const csvImporter_1 = __importDefault(require("./Importers/csvImporter"));
const fs_1 = __importDefault(require("fs"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const util_1 = __importDefault(require("util"));
const mongoClient_1 = __importDefault(require("../database/mongoClient"));
const access = util_1.default.promisify(fs_1.default.access);
const mkdir = util_1.default.promisify(fs_1.default.mkdir);
const parseCSVValues = (str) => {
    var _a;
    return (_a = str) === null || _a === void 0 ? void 0 : _a.split(",").map(str => str.toUpperCase());
};
const parseRange = (str) => {
    var _a;
    const indiArgs = (_a = str) === null || _a === void 0 ? void 0 : _a.match(/\d+(-\d+)/gi);
    let rangeQuery;
    if (indiArgs) {
        const range = indiArgs[0].split("-").sort();
        rangeQuery = { $gt: parseInt(range[0]), $lt: parseInt(range[1]) };
        return rangeQuery;
    }
};
const routeQueryCreator = {
    "Year": (yearArgs) => {
        var _a, _b;
        let rangeQuery;
        let indiQuery = [];
        const indiArgs = (_a = yearArgs) === null || _a === void 0 ? void 0 : _a.match(/\d+(-\d+)?/gi);
        (_b = indiArgs) === null || _b === void 0 ? void 0 : _b.forEach((args) => {
            if (args.search("-") > 0) {
                const range = (args.split("-"));
                rangeQuery = { $gt: parseInt(range[0]), $lt: parseInt(range[1]) };
            }
            else {
                const number = parseInt(args);
                indiQuery.push(number);
            }
            ;
        });
        if (indiQuery && rangeQuery) {
            return {
                $or: [
                    { Year: { $in: indiQuery } },
                    { Year: { ...rangeQuery } }
                ]
            };
        }
        else if (indiQuery) {
            return { Year: { $in: indiQuery } };
        }
        else if (rangeQuery) {
            return { Year: { ...rangeQuery } };
        }
    },
    "make": (make) => {
        let makes = parseCSVValues(make);
        return makes ? { "Make": { $in: makes } } : null;
    },
    "model": (model) => {
        let models = parseCSVValues(model);
        return models ? { "Model Group": { $in: models } } : null;
    },
    "modelGroup": (modelGroup) => {
        let modelGroups = parseCSVValues(modelGroup);
        return modelGroups ? { "Model Detail": { $in: modelGroups } } : null;
    },
    "bodyStyle": (bodyStyle) => {
        let bodyStyles = parseCSVValues(bodyStyle);
        return bodyStyles ? { "Body Style": { $in: bodyStyles } } : null;
    },
    "color": (color) => {
        let colors = parseCSVValues(color);
        return colors ? { "Color": { $in: colors } } : null;
    },
    "odometer": (odometer) => {
        console.log("ODOMETER", parseRange(odometer));
        return !!odometer ? { "Odometer": parseRange(odometer) } : null;
    },
    "hasKeys": (hasKeys) => {
        if (!!hasKeys) {
            return { "Has Keys-Yes or No": hasKeys.toUpperCase() };
        }
    },
    "damage": () => { },
    "bodyType": () => { },
    "subModel": () => { },
};
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
        if (routeQueryCreator[key]) {
            query = (Object.assign(query, routeQueryCreator[key](data[key])));
        }
        else { }
    }
    console.log(query);
    return query;
};
Inventory.getInventory = async (data) => {
    var _a;
    return await ((_a = mongoClient_1.default()) === null || _a === void 0 ? void 0 : _a.then((MongoClient) => {
        let query = Inventory.createQuery(data);
        return MongoClient.db("Inventory")
            .collection("main")
            .find(query)
            .toArray().then((element) => {
            return element;
        });
    }));
};
