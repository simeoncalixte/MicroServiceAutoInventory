import mongodb from "mongodb";
import ModelDetailAgg from "./ModelDetailAgg";
import ModelAgg from "./ModelAgg";
import VendorAgg from "./VendorAgg";
import DamagesAgg from "./Damages";

export default  (collection: mongodb.Collection) => {
  const aggregatedVendors =  collection.aggregate(VendorAgg).next((error,results) => console.log(error))
  const aggregatedModels =  collection.aggregate(ModelAgg).next((error,results) => console.log(error))
  const aggregatedModelDetail =  collection.aggregate(ModelDetailAgg).next((error,results) => console.log(error))
  const aggregatedDamages =  collection.aggregate(DamagesAgg).next((error,results) => console.log(error))
  return {aggregatedVendors,aggregatedModels,aggregatedModelDetail,aggregatedDamages};
};
