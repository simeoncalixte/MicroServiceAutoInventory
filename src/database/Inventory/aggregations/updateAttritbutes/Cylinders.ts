const groupCylinders = {
  '$group': { 
    '_id': '$Cylinders',
 } 
}

const CylindersOutPut =  { '$out': 'Cylinders' };

const aggCylinders = [
  groupCylinders,
  CylindersOutPut,
];

export default aggCylinders
