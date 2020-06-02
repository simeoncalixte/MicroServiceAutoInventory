"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
const zipInfo_1 = require("../../data/location/zipInfo");
=======
<<<<<<< HEAD
const zipInfo_json_1 = __importDefault(require("../data/location/zipInfo.json"));
const zipObjects = zipInfo_json_1.default;
=======
const zipInfo_1 = require("../../data/location/zipInfo");
>>>>>>> ade0c72b72f996c5dda189d5e146fafc0f6ca087
>>>>>>> 4af5c824a749598486502382637c5ba42d22ce08
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
