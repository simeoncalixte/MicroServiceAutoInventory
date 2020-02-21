"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DownloadData_1 = __importDefault(require("../DataImporters/DownloadData"));
const csvImporter_1 = __importDefault(require("../DataImporters/csvImporter"));
const path_1 = require("path");
const app_root_path_1 = __importDefault(require("app-root-path"));
/**
 * @todo : Have a document for each file
 */
const url = "https://raw.githubusercontent.com/davglass/zipcodes/master/lib/codes.js";
const fileLocation = `${path_1.sep}data${path_1.sep}location${path_1.sep}`;
const fileArciveLocation = `${path_1.sep}data${path_1.sep}location${path_1.sep}archive${path_1.sep}`;
const fileName = `zipInfo.csv`;
const location = app_root_path_1.default + fileLocation + fileName;
const Import = new DownloadData_1.default(url, fileLocation, fileArciveLocation, fileName);
exports.default = Import.download().then((value) => {
    try {
        const args = `--uri mongodb://localhost:27017/Inventory -c locationServices --type csv --headerline --file ${location}`;
        const mongoImport = csvImporter_1.default(args);
        mongoImport.on("message", (message) => console.log(message));
        mongoImport.on("error", (error) => console.log(error));
        mongoImport.on("exit", (exit) => console.log(exit));
        mongoImport.on("close", (close) => console.log(close));
    }
    catch (e) {
        console.log(e);
    }
});
