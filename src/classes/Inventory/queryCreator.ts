import distanceMatrix from "../DistanceMatrix";

enum IDistanceUnits {
    miles, kilometers
}

interface IRange{
    $gte : number,
    $lte : number
}

interface IIndividualQuery {
    $in : number[]
}

interface IRangeAndIndividualQuery {
    rangeQuery : IRange[],
    indiQuery : IIndividualQuery
}

const parseCSVValues = ( str: string) => {
    if(str != ''){
        let array =  str?.split(",");
        array = array.map(str => {
                return str.replace(/^"/,"").replace(/"$/,"").toUpperCase();
        });
        return array.length?  array : null
    }
}
const parseCSV = ( str: string) => {
    return   str?.split(",");
}

const parseNumberQueries = ( str : string ) : IRangeAndIndividualQuery => {
    const indiQuery : IIndividualQuery = {$in:[]} //initilize independant query array
    const rangeQuery: IRange[]  = [] ;
    const indiArgs = str?.match(/\d+(-\d+)?/gi); //convert string to array

    indiArgs?.forEach((element)=>{
        //seperate to distinct categories 
        if (element.search(/\d+(-\d+)/) >= 0) {
            const range = element.split("-").sort();
            rangeQuery.push({$gte: parseInt(range[0]), $lte: parseInt(range[1])})
        }else{
            indiQuery.$in.push(parseInt(element))
        }  
    });

    return { rangeQuery, indiQuery};
}


export const routeQueryCreator : {[key:string]: Function} =  {

    "Year" : (yearArgs: string) => {
        let query = parseNumberQueries(yearArgs);
        if( (query.indiQuery && query.indiQuery.$in.length) || query.rangeQuery.length){
            return {
                $or: [
                    {Year: {...query.indiQuery}},
                    {Year: {...query.rangeQuery[0]}}
                ]
            }
        }
    },
    "make" : (make: string ) => {
            let makes = parseCSVValues(make);
            return makes ? {"Make": {$in: makes}} : null;
    },
    "model" : (model: string) => {
        let models = parseCSVValues(model);
        console.log(!!models);
        return models && models.length ? {"Model Group": {$in: models}} : null;
    },
    "modelDetail" : (modelGroup : string ) => {
        let modelGroups = parseCSVValues(modelGroup);
        return modelGroups && modelGroups.length ? {"Model Detail": {$in: modelGroups}} : null;
    },
    "bodyStyle" : (bodyStyle : string ) => {
        let bodyStyles = parseCSVValues(bodyStyle);
        return bodyStyles ? {"Body Style": {$in: bodyStyles}} : null;
    },
    "color" : (color : string ) => {
        let colors = parseCSVValues(color);
        return colors ? {"Color": {$in: colors}} : null;
    },
    /**
     * @todo: correct odometer selection zero;
     */
    "odometer" : (odometer : string ) => {
        console.log({
            typeof: typeof odometer,
            parseInt: parseInt(odometer),
            boolean: odometer != ''

        })
        const query = parseNumberQueries(odometer).rangeQuery[0];
        if (query){
            return  {"Odometer": query };
        }
    },
    "hasKeys" : (hasKeys: string) => {
        if (!!hasKeys){
         return {"Has Keys-Yes or No":  hasKeys.toUpperCase()};
        }
    },
    "retailValue" : (retailValue: string ) => {   
       if (retailValue){        
           return  {"Est. Retail Value": parseNumberQueries(retailValue).rangeQuery[0]}
       };
    },
    "repairCost" : (repairCost: string ) => {   
       if (repairCost){
           return  {"Repair cost": parseNumberQueries(repairCost).rangeQuery[0]}
       };
    },
    "buyItNowPrice" : (buyItNowPrice: string ) => {   
       if (buyItNowPrice){
           return  {"Buy-It-Now Price": parseNumberQueries(buyItNowPrice).rangeQuery[0]}
       };
    },
    "engine" : (engine: string ) => {
        console.log({engine});
        if (engine){
           return  {"Engine":{$in: parseCSVValues(engine)}}
       };
    },
    "drive" : (drive: string ) => {   
        console.log({drive});

       if (drive){
           return  {Drive: {$in: parseCSV(drive)}}
       };
    },
    "transmission" : (transmission: string ) => {   
        console.log({transmission});
       if (transmission){
           return  {Transmission: {$in: parseCSVValues(transmission)}}
       };
    },
    "fuelType" : (fuelType: string ) => {   
       if (fuelType){
           return  {"Fuel Type": {$in: parseCSVValues(fuelType)}}
       };
    },
    "cylinder" : (cylinder: string ) => {   
        const query = parseNumberQueries(cylinder);
        return  query.indiQuery && query.indiQuery.$in && query.indiQuery.$in.length? {Cylinders: query.indiQuery} : null;
    
    }, 
    "runAndDrive" : (runAndDrive: string ) => {   
       if (runAndDrive){
           return  {"Runs/Drives": {$in: parseCSVValues(runAndDrive)}}
       };
    },
    "makeAnOffer" : (makeAnOffer: string ) => {  
        if (makeAnOffer){
            return  {"Make-an-Offer Eligible":  makeAnOffer}
        };
     },
    "damages" : (damages: string ) => {  
        if (damages){
            return  {
                $or: [
                    {"Damage Description":  {$in: parseCSVValues(damages)}},
                    {"Secondary Damage":  {$in: parseCSVValues(damages)}},
                ]
             }
        };
     },

     "locationProximity": (location: string ) => {
         if(location){
             const match = location.match(/\d+(?=\s+(mi|miles|km|kilometers))|(mi|miles|km|kilometers)|(\d+){5}((-)(\d{4}))?(\s)?$/gi);
             if(match && match.length === 3){
                const [distance,unit, startingPoint] = match
                distanceMatrix.getZipCoordinates(startingPoint);
                
            }
        }
     }
  
}