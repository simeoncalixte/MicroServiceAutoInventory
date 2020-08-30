const groupStates = {
  '$group': { 
    '_id': '$Sale Title State',
 } 
}

const StateOutPut =  { '$out': 'SaleTitleStates' };

const aggStates = [
  groupStates,
  StateOutPut,
];

export default aggStates
