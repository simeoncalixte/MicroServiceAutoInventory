"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const mongoimport = () => child_process_1.default.spawn(`mongoimport`, [
    '--uri', 'mongodb://localhost:27017/Inventory',
    '-c', "main",
    "--type", "csv",
    "--headerline",
    "--file", `${app_root_path_1.default + "\\data\\inventory\\inv.csv"}`,
]);
exports.default = mongoimport;
