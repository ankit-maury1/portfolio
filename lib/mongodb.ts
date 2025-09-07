'use server';

import { MongoClient } from 'mongodb';

// Extend the NodeJS global interface to include our MongoDB client
declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export an async function that returns the client promise
// This way, we can use the 'use server' directive
export async function getMongoClient() {
  return clientPromise;
}

// Keep the default export for compatibility with existing code
// but make it a function to comply with 'use server' directive
export default async function getClientPromise() {
  return clientPromise;
}
