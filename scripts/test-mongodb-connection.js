import { MongoClient } from 'mongodb';

// Connection URI
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    // Get reference to the database
    const db = client.db();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count documents in some collections
    if (collections.length > 0) {
      const userCount = await db.collection('User').countDocuments();
      console.log(`User collection has ${userCount} documents`);
      
      const blogPostCount = await db.collection('BlogPost').countDocuments();
      console.log(`BlogPost collection has ${blogPostCount} documents`);
    }
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

// Run the test
testConnection()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
