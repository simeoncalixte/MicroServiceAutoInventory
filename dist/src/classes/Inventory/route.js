"use strict";
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("./"));
let url = `/Inventory/?Year:/?make:/?model:/?modelDetail:/?bodyStyle:`;
url += `/?color:/?odometer:/?hasKeys:/?retailValue:/?repairCost:/?buyItNowPrice:`;
url += `/?engine:/?drive:/?transmission:/?fuelType:/?cylinder:/?runAndDrive:`;
url += `/?makeAnOffer:/?damages:/?locationProximity:`;
exports.default = (server) => {
  server.get(url, (req, res) => {
    _1.default.getInventory(req);
  });
};
