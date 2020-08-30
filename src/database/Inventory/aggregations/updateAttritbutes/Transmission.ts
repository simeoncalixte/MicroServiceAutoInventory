const groupTransmissions = {
  '$group': { 
    '_id': '$Transmission',
 } 
}

const TransmissionOutPut =  { '$out': 'Transmission' };

const aggTransmissions = [
  groupTransmissions,
  TransmissionOutPut,
];

export default aggTransmissions
