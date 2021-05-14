const groupMake =  { 
  '$group': { 
    '_id': "$Make",
    'Models': {
      $addToSet : "$Model Group"
    }
 } 
};

const out =  { '$out': 'Makes' };

const aggVendor = [
  groupMake,
  out,
];


export default aggVendor;