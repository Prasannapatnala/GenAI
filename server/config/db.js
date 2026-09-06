const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'shopmate';

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('MongoDB Connected Successfully');
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

module.exports = { connectDB, getDB };
