const groupModelDetail = {
  '$group': { 
    '_id': '$Model Detail',
    'Model Group': {$first:"$Model Group"},
    'Engine': {$addToSet: "$Engine"},
    'Body Style': {$first: "$Body Style"},
    'Colors': {
      $addToSet : "$Color"
    }
 } 
}

const output =  { '$out': 'ModelDetail' };

 const aggModelDetail = [
  groupModelDetail,
  output,
];

export default aggModelDetail