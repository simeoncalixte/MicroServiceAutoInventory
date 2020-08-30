const groupSaleStatus = {
  '$group': { 
    '_id': '$Sale Status',
 } 
}

const SaleStatusOutPut =  { '$out': 'SaleStatus' };

const aggSaleStatus = [
  groupSaleStatus,
  SaleStatusOutPut,
];

export default aggSaleStatus

