"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const location_1 = __importDefault(require("../../utils/location"));
const convert_units_1 = __importDefault(require("convert-units"));
var IDistanceUnits;
(function (IDistanceUnits) {
    IDistanceUnits[IDistanceUnits["miles"] = 0] = "miles";
    IDistanceUnits[IDistanceUnits["kilometers"] = 1] = "kilometers";
})(IDistanceUnits || (IDistanceUnits = {}));
const parseCSVValues = (str) => {
    var _a;
    if (str != '') {
        let array = (_a = str) === null || _a === void 0 ? void 0 : _a.split(",");
        array = array.map(str => {
            return str.replace(/^"/, "").replace(/"$/, "").toUpperCase();
        });
        return array.length ? array : null;
    }
};
const parseCSV = (str) => {
    var _a;
    return (_a = str) === null || _a === void 0 ? void 0 : _a.split(",");
};
const parseNumberQueries = (str) => {
    var _a, _b;
    const indiQuery = { $in: [] }; //initilize independant query array
    const rangeQuery = [];
    const indiArgs = (_a = str) === null || _a === void 0 ? void 0 : _a.match(/\d+(-\d+)?/gi); //convert string to array
    (_b = indiArgs) === null || _b === void 0 ? void 0 : _b.forEach((element) => {
        //seperate to distinct categories 
        if (element.search(/\d+(-\d+)/) >= 0) {
            const range = element.split("-").sort();
            rangeQuery.push({ $gte: parseInt(range[0]), $lte: parseInt(range[1]) });
        }
        else {
            indiQuery.$in.push(parseInt(element));
        }
    });
    return { rangeQuery, indiQuery };
};
exports.routeQueryCreator = {
    "Year": (yearArgs) => {
        let query = parseNumberQueries(yearArgs);
        if ((query.indiQuery && query.indiQuery.$in.length) || query.rangeQuery.length) {
            return {
                $or: [
                    { Year: { ...query.indiQuery } },
                    { Year: { ...query.rangeQuery[0] } }
                ]
            };
        }
    },
    "make": (make) => {
        let makes = parseCSVValues(make);
        return makes ? { "Make": { $in: makes } } : null;
    },
    "model": (model) => {
        let models = parseCSVValues(model);
        return models && models.length ? { "Model Group": { $in: models } } : null;
    },
    "modelDetail": (modelGroup) => {
        let modelGroups = parseCSVValues(modelGroup);
        return modelGroups && modelGroups.length ? { "Model Detail": { $in: modelGroups } } : null;
    },
    "bodyStyle": (bodyStyle) => {
        let bodyStyles = parseCSVValues(bodyStyle);
        return bodyStyles ? { "Body Style": { $in: bodyStyles } } : null;
    },
    "color": (color) => {
        let colors = parseCSVValues(color);
        return colors ? { "Color": { $in: colors } } : null;
    },
    /**
     * @todo: correct odometer selection zero;
     */
    "odometer": (odometer) => {
        const query = parseNumberQueries(odometer).rangeQuery[0];
        if (query) {
            return { "Odometer": query };
        }
    },
    "hasKeys": (hasKeys) => {
        if (!!hasKeys) {
            return { "Has Keys-Yes or No": hasKeys.toUpperCase() };
        }
    },
    "retailValue": (retailValue) => {
        if (retailValue) {
            return { "Est. Retail Value": parseNumberQueries(retailValue).rangeQuery[0] };
        }
        ;
    },
    "repairCost": (repairCost) => {
        if (repairCost) {
            return { "Repair cost": parseNumberQueries(repairCost).rangeQuery[0] };
        }
        ;
    },
    "buyItNowPrice": (buyItNowPrice) => {
        if (buyItNowPrice) {
            return { "Buy-It-Now Price": parseNumberQueries(buyItNowPrice).rangeQuery[0] };
        }
        ;
    },
    "engine": (engine) => {
        if (engine) {
            return { "Engine": { $in: parseCSVValues(engine) } };
        }
        ;
    },
    "drive": (drive) => {
        if (drive) {
            return { Drive: { $in: parseCSV(drive) } };
        }
        ;
    },
    "transmission": (transmission) => {
        if (transmission) {
            return { Transmission: { $in: parseCSVValues(transmission) } };
        }
        ;
    },
    "fuelType": (fuelType) => {
        if (fuelType) {
            return { "Fuel Type": { $in: parseCSVValues(fuelType) } };
        }
        ;
    },
    "cylinder": (cylinder) => {
        const query = parseNumberQueries(cylinder);
        return query.indiQuery && query.indiQuery.$in && query.indiQuery.$in.length ? { Cylinders: query.indiQuery } : null;
    },
    "runAndDrive": (runAndDrive) => {
        if (runAndDrive) {
            return { "Runs/Drives": { $in: parseCSVValues(runAndDrive) } };
        }
        ;
    },
    "makeAnOffer": (makeAnOffer) => {
        if (makeAnOffer) {
            return { "Make-an-Offer Eligible": makeAnOffer };
        }
        ;
    },
    "damages": (damages) => {
        if (damages) {
            return {
                $or: [
                    { "Damage Description": { $in: parseCSVValues(damages) } },
                    { "Secondary Damage": { $in: parseCSVValues(damages) } },
                ]
            };
        }
        ;
    },
    "locationProximity": (location) => {
        if (location) {
            // @todo: correct unit types
            const match = location.match(/\d+(?=\s+(mi|miles|km|kilometers))|(mi|miles|km|kilometers)|(\d+){5}((-)(\d{4}))?(\s)?$/gi);
            if (match && match.length === 3) {
                let [maxDistance, , startingPoint] = match;
                const distanceUnit = match[1];
                const locationInfo = location_1.default(startingPoint);
                const dist = convert_units_1.default(parseInt(maxDistance)).from(distanceUnit).to("m");
                return locationInfo && {
                    geoLocation: {
                        $nearSphere: {
                            $geometry: locationInfo,
                            $maxDistance: dist
                        }
                    }
                };
            }
        }
    }
};
