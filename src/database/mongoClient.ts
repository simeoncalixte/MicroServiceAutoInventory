import { MongoClient } from "mongodb";
const minutesToMS = (min: number) => {
  return min * 60 * 1000;
};
const createMongoClient = () => {
  const URI = process.env.MONGO_DB_URI;
  const client = MongoClient;

  if (URI) {
    return client.connect(URI, {
      useUnifiedTopology: true,
      connectTimeoutMS: minutesToMS(10),
      keepAlive: true,
      keepAliveInitialDelay: minutesToMS(10),
      socketTimeoutMS: minutesToMS(10),
    }).then(MongoClient => {
      MongoClient.on("error", (e)=>{
        console.log(e)
      })
      return MongoClient
    });
  }
};
export default createMongoClient;
