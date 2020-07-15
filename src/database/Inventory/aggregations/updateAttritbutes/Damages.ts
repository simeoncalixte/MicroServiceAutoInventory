const groupDamages = {
  '$group': { 
    '_id': '$Damage Description',
    'lots': {$addToSet: '$_id'}
}
}

const DamageOutPut =  { '$out': 'Damages' };

const aggDamages = [
  groupDamages,
  DamageOutPut,
];

export default aggDamages
