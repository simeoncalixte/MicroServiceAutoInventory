"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Inventory_1 = __importDefault(require("../classes/Inventory"));
new Inventory_1.default("https://inventory.copart.io/FTPLSTDM/salesdata.cgi").download();
