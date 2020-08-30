import mongodb from "mongodb";
import ModelDetailAgg from "./ModelDetailAgg";
import ModelAgg from "./ModelAgg";
import VendorAgg from "./VendorAgg";
import DamagesAgg from "./Damages";
import Colors from "./ColorsAgg";
import Transmission from "./Transmission";
import Engine from "./Engine";
import FuelTypes from "./FuelTypes";
import States from "./States";
import Drive from "./Drive";
import BodyStyle from "./BodyStyle";
import Cylinders from "./Cylinders";
import TitleType from "./TitleTypes";
import SaleStatus from "./SaleStatus";

export default  (collection: mongodb.Collection) => {
  const aggregatedVendors =  collection.aggregate(VendorAgg).next((error,results) => console.log(error))
  const aggregatedModels =  collection.aggregate(ModelAgg).next((error,results) => console.log(error))
  const aggregatedModelDetail =  collection.aggregate(ModelDetailAgg).next((error,results) => console.log(error))
  const aggregatedDamages =  collection.aggregate(DamagesAgg).next((error,results) => console.log(error))
  const aggregatedColors =  collection.aggregate(Colors).next((error,results) => console.log(error))
  const aggregatedEngine =  collection.aggregate(Engine).next((error,results) => console.log(error))
  const aggregatedFuelTypes =  collection.aggregate(FuelTypes).next((error,results) => console.log(error))
  const aggregatedStates =  collection.aggregate(States).next((error,results) => console.log(error))
  const aggregatedDrive =  collection.aggregate(Drive).next((error,results) => console.log(error))
  const aggregatedTransmission =  collection.aggregate(Transmission).next((error,results) => console.log(error))
  const aggregatedSaleStatus =  collection.aggregate(SaleStatus).next((error,results) => console.log(error))
  const aggregatedBodyStyle =  collection.aggregate(BodyStyle).next((error,results) => console.log(error))
  const aggregatedCylinders =  collection.aggregate(Cylinders).next((error,results) => console.log(error))
  const aggregatedTitleType =  collection.aggregate(TitleType).next((error,results) => console.log(error))
  return {
    aggregatedVendors,
    aggregatedModels,
    aggregatedModelDetail,
    aggregatedDamages,
    aggregatedColors,
    aggregatedEngine,
    aggregatedFuelTypes,
    aggregatedStates,
    aggregatedDrive,
    aggregatedTransmission,
    aggregatedSaleStatus};
};
