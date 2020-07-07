import findZipInfo from "../../utils/location";
import convertDistance, { unit } from "convert-units";

interface IRange {
  $gte: number;
  $lte: number;
}

interface IIndividualQuery {
  $in: number[];
}

interface IRangeAndIndividualQuery {
  rangeQuery: IRange[];
  indiQuery: IIndividualQuery;
}

const parseCSVValues = (str: string) => {
  if (str != "") {
    let array = str?.split(",");
    array = array.map((str) => {
      return str.replace(/^"/, "").replace(/"$/, "").toUpperCase();
    });
    return array.length ? array : null;
  }
};
const parseCSV = (str: string) => {
  return str?.split(",");
};

const parseNumberQueries = (str: string): IRangeAndIndividualQuery => {
  // initilize independant query array
  const indiQuery: IIndividualQuery = { $in: [] };

  const rangeQuery: IRange[] = [];
  const indiArgs = str?.match(/\d+(-\d+)?/gi); // convert string to array

  indiArgs?.forEach((element) => {
    // seperate to distinct categories
    if (element.search(/\d+(-\d+)/) >= 0) {
      const range = element.split("-").sort();
      rangeQuery.push({ $gte: parseInt(range[0]), $lte: parseInt(range[1]) });
    } else {
      indiQuery.$in.push(parseInt(element));
    }
  });

  return { rangeQuery, indiQuery };
};

export const routeQueryCreator: { [key: string]: Function } = {
  Year: (yearArgs: string) => {
    const query = parseNumberQueries(yearArgs);
    if (
      (query.indiQuery && query.indiQuery.$in.length) ||
      query.rangeQuery.length
    ) {
      return {
        $or: [
          { Year: { ...query.indiQuery } },
          { Year: { ...query.rangeQuery[0] } },
        ],
      };
    }
  },
  make: (make: string) => {
    const makes = parseCSVValues(make);
    return makes ? { Make: { $in: makes } } : null;
  },
  model: (model: string) => {
    const models = parseCSVValues(model);

    return models && models.length ? { "Model Group": { $in: models } } : null;
  },
  modelDetail: (modelGroup: string) => {
    const modelGroups = parseCSVValues(modelGroup);
    return modelGroups && modelGroups.length
      ? { "Model Detail": { $in: modelGroups } }
      : null;
  },
  bodyStyle: (bodyStyle: string) => {
    const bodyStyles = parseCSVValues(bodyStyle);
    return bodyStyles ? { "Body Style": { $in: bodyStyles } } : null;
  },
  color: (color: string) => {
    const colors = parseCSVValues(color);
    return colors ? { Color: { $in: colors } } : null;
  },

  odometer: (odometer: string) => {
    const query = parseNumberQueries(odometer).rangeQuery[0];
    if (query) {
      return { Odometer: query };
    }
  },
  hasKeys: (hasKeys: string) => {
    if (!!hasKeys) {
      return { "Has Keys-Yes or No": hasKeys.toUpperCase() };
    }
  },
  retailValue: (retailValue: string) => {
    if (retailValue) {
      return {
        "Est. Retail Value": parseNumberQueries(retailValue).rangeQuery[0],
      };
    }
  },
  repairCost: (repairCost: string) => {
    if (repairCost) {
      return { "Repair cost": parseNumberQueries(repairCost).rangeQuery[0] };
    }
  },
  buyItNowPrice: (buyItNowPrice: string) => {
    if (buyItNowPrice) {
      return {
        "Buy-It-Now Price": parseNumberQueries(buyItNowPrice).rangeQuery[0],
      };
    }
  },
  engine: (engine: string) => {
    if (engine) {
      return { Engine: { $in: parseCSVValues(engine) } };
    }
  },
  drive: (drive: string) => {
    if (drive) {
      return { Drive: { $in: parseCSV(drive) } };
    }
  },
  transmission: (transmission: string) => {
    if (transmission) {
      return { Transmission: { $in: parseCSVValues(transmission) } };
    }
  },
  fuelType: (fuelType: string) => {
    if (fuelType) {
      return { "Fuel Type": { $in: parseCSVValues(fuelType) } };
    }
  },
  cylinder: (cylinder: string) => {
    const query = parseNumberQueries(cylinder);
    return query.indiQuery && query.indiQuery.$in && query.indiQuery.$in.length
      ? { Cylinders: query.indiQuery }
      : null;
  },
  runAndDrive: (runAndDrive: string) => {
    if (runAndDrive) {
      return { "Runs/Drives": { $in: parseCSVValues(runAndDrive) } };
    }
  },
  makeAnOffer: (makeAnOffer: string) => {
    if (makeAnOffer) {
      return { "Make-an-Offer Eligible": makeAnOffer };
    }
  },
  damages: (damages: string) => {
    if (damages) {
      return {
        $or: [
          { "Damage Description": { $in: parseCSVValues(damages) } },
          { "Secondary Damage": { $in: parseCSVValues(damages) } },
        ],
      };
    }
  },

  locationProximity: (location: string) => {
    if (location) {
      // @todo: correct unit types
      const match = location.match(
        /\d+(?=\s+(mi|miles|km|kilometers))|(mi|miles|km|kilometers)|(\d+){5}((-)(\d{4}))?(\s)?$/gi
      );
      if (match && match.length === 3) {
        const [maxDistance, , startingPoint] = match;
        const distanceUnit = match[1] as unit;
        const locationInfo = findZipInfo(startingPoint);
        const dist = convertDistance(parseInt(maxDistance))
          .from(distanceUnit)
          .to("m");
        return (
          locationInfo && {
            geoLocation: {
              $nearSphere: {
                $geometry: locationInfo,
                $maxDistance: dist,
              },
            },
          }
        );
      }
    }
  },
};
