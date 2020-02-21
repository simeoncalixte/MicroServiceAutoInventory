"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const createMongoClient = () => {
    const URI = process.env.MONGO_DB_URI;
    const client = mongodb_1.MongoClient;
    if (URI) {
        return client.connect(URI, { useUnifiedTopology: true });
    }
};
exports.default = createMongoClient;
