
export const AttributeMap = new Map();

const arrayOfType = [
  {
    key: /(make(s)*|vendor(s)*)/gi,
    value: 'Makes'
  },
  {
    key: /model(s)*/gi,
    value: 'Models'
  },
  {
    key: /fuelType(s)*/gi,
    value: 'FuelType'
  },
  {
    key: /transmission(s)*/,
    value: 'Transmission'
  },
  {
    key: /damage(s)*/gi,
    value: 'Damages'
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
    value: 'BodyStyle'
  },
  {
    key: /Cylinder(s)*/gi,
    value: 'Cylinders'
  },
  {
    key: /Color(s)*/gi,
    value: 'Colors'
  },
  {
    key: /SaleStatus(es)*/gi,
    value: 'SaleStatus'
  },
  {
    key: /Drive(s)*/gi,
    value: 'Drive'
  },
  {
    key: /Engine(s)*/gi,
    value: 'Engine'
  },
];


arrayOfType.forEach(collection=> {
  const {key,value} = collection;
  AttributeMap.set(key,value);
})

const getAttribute = (testCase: string) => {
  for (let [key,value] of AttributeMap) {
      console.log({testCase})
      if(testCase.match(key)){
        return AttributeMap.get(key);
      }
  }
  return undefined
}

export default getAttribute;