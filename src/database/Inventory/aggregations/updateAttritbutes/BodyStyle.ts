const groupBodyStyles = {
  '$group': { 
    '_id': '$Body Style',
 } 
}

const BodyStyleOutPut =  { '$out': 'BodyStyle' };

const aggBodyStyles = [
  groupBodyStyles,
  BodyStyleOutPut,
];

export default aggBodyStyles
