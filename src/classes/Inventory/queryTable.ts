
export const AttributeMap = new Map();
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
  if (str) {
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

const arrayOfType = [
  {
    key: /(year(s)?)/gi,
    value: (yearRange: string) => {
      console.log({yearRange});
      const query = parseNumberQueries(yearRange);
      if (
        (query.indiQuery && query.indiQuery.$in.length) ||
        query.rangeQuery.length
      ) {
        console.log(query.rangeQuery);
        console.log(query.indiQuery);
        return {
          $or: [
            { Year: query.indiQuery },
            { Year: query.rangeQuery[0]  },
          ],
        };
      }
    }
  },
  {
    key: /price/gi,
    value: (price: string) => {
      const priceRange = parseCSVValues(price);
      return priceRange ? { "Buy-It-Now Price": parseNumberQueries(price).rangeQuery[0]} : null;
    }
  },
  {
    key: /odometer/gi,
    value: (odometer: string) => {
      const odometerRange = parseCSVValues(odometer);
      return odometerRange ? { "Odometer": parseNumberQueries(odometer).rangeQuery[0]} : null;
    }
  },
  {
    key: /(make(s)*|vendor(s)*)/gi,
    value: (make: string) => {
      const makes = parseCSVValues(make);
      return makes ? { Make: { $in: makes } } : null;
    }
  },
  {
    key: /model(s)*/gi,
    value: (model: string) => {
      const models = parseCSVValues(model);
  
      return models && models.length ? { "Model Group": { $in: models } } : null;
    }
  },
  {
    key: /fuelType(s)*/gi,
    value: (fuelType: string) => {
      if (fuelType) {
        return { "Fuel Type": { $in: parseCSVValues(fuelType) } };
      }
    }
  },
  {
    key: /transmission(s)*/,
    value: (transmission: string) => {
      if (transmission) {
        return { Transmission: { $in: parseCSVValues(transmission) } };
      }
    }
  },
  {
    key: /damage(s)*/gi,
    value: (damages: string) => {
      if (damages) {
        return {
          $or: [
            { "Damage Description": { $in: parseCSVValues(damages) } },
            { "Secondary Damage": { $in: parseCSVValues(damages) } },
          ],
        };
      }
    }
  },
  {
    key: /SaleTitle(s)*/gi,
    value: 'SaleTitles'
  },
  {
    key: /SaleTitleState(s)*/gi,
    value: 'SaleTitleStates'
  },
  {
    key: /BodyStyle(s)*/gi,
    value: (bodyStyle: string) => {
      const bodyStyles = parseCSVValues(bodyStyle);
      return bodyStyles ? { "Body Style": { $in: bodyStyles } } : null;
    }
  },
  {
    key: /Cylinder(s)*/gi,
    value: (cylinder: string) => {
      const query = parseNumberQueries(cylinder);
      return query.indiQuery && query.indiQuery.$in && query.indiQuery.$in.length
        ? { Cylinders: query.indiQuery }
        : null;
    }
  },
  {
    key: /Color(s)*/gi,
    value: (color: string) => {
      const colors = parseCSVValues(color);
      return colors ? { Color: { $in: colors } } : null;
    }
  },
  {
    key: /SaleStatus(es)*/gi,
    value: 'SaleStatus'
  },
  {
    key: /Drive(s)*/gi,
    value: (drive: string) => {
      if (drive) {
        return { Drive: { $in: parseCSV(drive) } };
      }
    }
  },
  {
    key: /Engine(s)*/gi,
    value: (engine: string) => {
      if (engine) {
        return { Engine: { $in: parseCSVValues(engine) } };
      }
    }
  },
  {
    key: /page(s)*/gi,
    value: (page: any) =>  page && !Number.isNaN(page) ? Number(page) - 1: 0

  },
  {
    key: /limit(s)*/gi,
    value: (limit: any) => limit &&
    !Number.isNaN(limit) &&
    Number(limit) <= 1000
        ? Number(limit) : 1000

  },
];


arrayOfType.forEach(collection=> {
  const {key,value} = collection;
  AttributeMap.set(key,value);
})

const getAttribute = (testCase: string)  => {
  for (let [key,value] of AttributeMap) {
      if(testCase.match(key)){
        return AttributeMap.get(key);
      }
  }
  return undefined
}

export default getAttribute;