const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const db = client.db('messaging-app');
client.connect();

module.exports = { db, ObjectId };
