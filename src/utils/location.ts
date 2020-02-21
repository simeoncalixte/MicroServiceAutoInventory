import {zipCodes} from "../../data/location/zipInfo"
import { Point } from "geojson";

export default (zip: string )=>{
    let geoJSON: Point | undefined 
    if (zipCodes[zip]){  
        const {latitude,longitude} = zipCodes[zip]
        geoJSON = {
            type: "Point",
            coordinates: [0,0]
        }
        geoJSON.coordinates[1] = latitude
        geoJSON.coordinates[0] = longitude
    }

    // this is invoked first
    return geoJSON
}