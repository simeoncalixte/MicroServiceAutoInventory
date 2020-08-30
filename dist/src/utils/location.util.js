"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zipInfo_1 = require("../data/locations/zipInfo");
exports.default = (data) => {
  console.log("adding geolocation");
  const geoJSON = {
    type: "Point",
    coordinates: [0, 0],
  };
  // console.log(zipCodes[data["Location ZIP"]]) // @todo : fix any types
  if (zipInfo_1.zipCodes[data["Location ZIP"]]) {
    geoJSON.coordinates[1] = zipInfo_1.zipCodes[data["Location ZIP"]].latitude;
    geoJSON.coordinates[0] = zipInfo_1.zipCodes[data["Location ZIP"]].longitude;
    data.geoLocation = geoJSON;
  }
  // this is invoked first
  return data;
};
