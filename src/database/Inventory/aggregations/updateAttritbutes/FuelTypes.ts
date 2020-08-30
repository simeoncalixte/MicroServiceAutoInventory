const groupFuelTypes = {
  '$group': { 
    '_id': '$FuelType',
 } 
}

const FuelTypeOutPut =  { '$out': 'FuelType' };

const aggFuelTypes = [
  groupFuelTypes,
  FuelTypeOutPut,
];

export default aggFuelTypes
