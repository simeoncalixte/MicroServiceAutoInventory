const groupDrives = {
  '$group': { 
    '_id': '$Drive',
 } 
}

const DriveOutPut =  { '$out': 'Drive' };

const aggDrives = [
  groupDrives,
  DriveOutPut,
];

export default aggDrives
