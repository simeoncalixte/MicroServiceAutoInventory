"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zipInfo_json_1 = __importDefault(require("../data/location/zipInfo.json"));
const zipObjects = zipInfo_json_1.default;
exports.default = (zip) => {
    let geoJSON;
    if (zipObjects && zipObjects[zip]) {
        const { latitude, longitude } = zipObjects[zip];
        geoJSON = {
            type: "Point",
            coordinates: [0, 0]
        };
        geoJSON.coordinates[1] = latitude;
        geoJSON.coordinates[0] = longitude;
    }
    // this is invoked first
    return geoJSON;
};
