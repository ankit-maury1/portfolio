import { getMongoClient } from './mongodb';

/**
 * Check if the MongoDB connection is working
 * @returns An object with connection status and error message if applicable
 */
export async function checkDatabaseConnection() {
  try {
    // Test connecting to MongoDB
    const client = await getMongoClient();
    const isConnected = !!client;
    
    // Get server info to verify connection is working
    const admin = client.db().admin();
    const serverInfo = await admin.serverInfo();
    
    return {
      success: true,
      status: 'connected',
      version: serverInfo.version,
      message: 'MongoDB connection successful'
    };
  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    return {
      success: false,
      status: 'error',
      message: error.message || 'Failed to connect to MongoDB',
      error: error
    };
  }
}
