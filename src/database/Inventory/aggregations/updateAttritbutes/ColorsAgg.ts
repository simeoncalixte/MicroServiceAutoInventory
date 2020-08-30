const groupColors = {
  '$group': { 
    '_id': '$Color',
 } 
}

const ColorOutPut =  { '$out': 'Colors' };

const aggColors = [
  groupColors,
  ColorOutPut,
];

export default aggColors
