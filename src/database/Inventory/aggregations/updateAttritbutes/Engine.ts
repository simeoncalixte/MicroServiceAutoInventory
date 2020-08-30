const groupEngines = {
  '$group': { 
    '_id': '$Engine',
 } 
}

const EngineOutPut =  { '$out': 'Engine' };

const aggEngines = [
  groupEngines,
  EngineOutPut,
];

export default aggEngines
