'use server';

import { MongoClient } from 'mongodb';

// This is a direct connection to MongoDB that doesn't use the shared client
// It's used specifically for API routes that need to access MongoDB

let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI as string);
  const db = client.db();
  
  cachedDb = db;
  return db;
}
