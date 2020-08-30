const groupModels = {
  '$group': { 
    '_id': '$Model Group',
    'vendor_id': {$first:"$Make"},
    'Model Detail': {
      $addToSet : "$Model Detail",
    },
    'Colors': {
      $addToSet : "$Color"
    }
 } 
}

const ModelOutPut =  { '$out': 'Models' };

const aggModels = [
  groupModels,
  ModelOutPut,
];

export default aggModels
