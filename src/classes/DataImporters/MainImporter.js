"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const csvImporter_1 = __importDefault(require("../DataImporters/csvImporter"));
const fs_1 = __importDefault(require("fs"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const util_1 = __importDefault(require("util"));
const path_1 = __importStar(require("path"));
const access = util_1.default.promisify(fs_1.default.access);
const mkdir = util_1.default.promisify(fs_1.default.mkdir);
class Inventory {
    constructor(url, dir, archiveDir, fileName) {
        this.url = "";
        this.mainDir = `${app_root_path_1.default}${path_1.sep}data${path_1.sep}inventory${path_1.sep}`;
        this.archiveDir = `${app_root_path_1.default}${path_1.sep}data${path_1.sep}inventory${path_1.sep}archive${path_1.sep}`;
        this.fileName = ``;
        this.download = async () => {
            return await this.checkForAndCreateDir(this.mainDir)
                .then(this.archiveExisting)
                .then(this.beginSavingDataStream);
        };
        this.beginSavingDataStream = async () => {
            return https_1.default.get(this.url, this.processFile).on("close", () => console.log("connection closed"));
        };
        this.processFile = (res) => {
            const { statusCode } = res;
            res.on("data", (chunk) => {
                fs_1.default.appendFileSync(this.mainDir + this.fileName, chunk);
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
        this.archiveExisting = async () => {
            return await this.checkForAndCreateDir(this.archiveDir).then(async () => {
                const fileNameInfo = path_1.default.parse(this.fileName);
                const mainFile = this.mainDir + this.fileName;
                const archivedFile = this.archiveDir + `${fileNameInfo.name}_${Date.now()}${fileNameInfo.ext}`;
                console.log(mainFile);
                fs_1.default.exists(mainFile, (exist) => {
                    if (exist) {
                        fs_1.default.copyFileSync(mainFile, archivedFile);
                        fs_1.default.unlinkSync(this.mainDir + this.fileName);
                    }
                });
            });
        };
        this.url = url;
        this.mainDir = `${app_root_path_1.default}${dir}`;
        this.archiveDir = `${app_root_path_1.default}${archiveDir}`;
        this.fileName = fileName;
        return this;
    }
}
exports.default = Inventory;
