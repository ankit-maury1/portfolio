import { getMongoClient } from './mongodb';

/**
 * Check if the MongoDB connection is working
 * @returns An object with connection status and error message if applicable
 */
export async function checkDatabaseConnection(): Promise<{ success: boolean; status: 'connected' | 'error'; version?: string; message: string; error?: unknown } > {
  try {
    // Test connecting to MongoDB
    const client = await getMongoClient();
    
    // Get server info to verify connection is working
    const admin = client.db().admin();
    const serverInfo = await admin.serverInfo();
    
    return {
      success: true,
      status: 'connected',
      version: serverInfo.version,
      message: 'MongoDB connection successful'
    };
  } catch (error: unknown) {
    console.error('MongoDB connection error:', error);
    let message = 'Failed to connect to MongoDB';
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      status: 'error',
      message,
      error
    };
  }
}
