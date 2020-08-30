const groupTitles = {
  '$group': { 
    '_id': '$Sale Title Type',
 } 
}

const TitleOutPut =  { '$out': 'SaleTitles' };

const aggTitles = [
  groupTitles,
  TitleOutPut,
];

export default aggTitles
