"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zipInfo_1 = require("../../data/location/zipInfo");
exports.default = (zip) => {
    let geoJSON;
    if (zipInfo_1.zipCodes[zip]) {
        const { latitude, longitude } = zipInfo_1.zipCodes[zip];
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
