import zipCodes from "../../data/location/zipInfo.json";
import { Point } from "geojson";

const zipObjects = zipCodes as { [codes: string]: any };
export default (zip: string) => {
  let geoJSON: Point | undefined;
  if (zipObjects && zipObjects[zip]) {
    const { latitude, longitude } = zipObjects[zip];
    geoJSON = {
      type: "Point",
      coordinates: [0, 0],
    };
    geoJSON.coordinates[1] = latitude;
    geoJSON.coordinates[0] = longitude;
  }

  // this is invoked first
  return geoJSON;
};
