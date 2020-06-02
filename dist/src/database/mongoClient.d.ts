import { MongoClient } from "mongodb";
declare const createMongoClient: () => Promise<MongoClient> | undefined;
export default createMongoClient;
