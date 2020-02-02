import { MongoClient } from "mongodb";

const createMongoClient = ( ) => {
     const URI = process.env.MONGO_DB_URI
     const client = MongoClient
     if (URI) {
          return client.connect(URI,{ useUnifiedTopology: true })
     }
}
export default createMongoClient



