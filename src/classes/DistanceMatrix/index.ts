
//const code = zip.codes? console.log(zip.codes) : console.log("there are no codes");
import Client from "../../database/mongoClient";
interface IPoint{longitude: string, latitude: string}

const distanceFromArrays = (startingPoint: IPoint) => {

}

const getZipCoordinates = async (startingPoint: string) => {
   return await Client()?.then((client)=>{

        const query = client.db("Inventory").collection("locationServices");
        const findStartingPoint = query.findOne({zip: parseInt(startingPoint)});
        findStartingPoint.then(()=>{
           // query.fi
        })
    })
    
}   
export default {distanceFromArrays,getZipCoordinates}

