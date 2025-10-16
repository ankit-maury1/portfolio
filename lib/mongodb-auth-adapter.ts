import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/mongodb";
import { getDatabase } from "@/lib/mongodb-helpers";

/**
 * Custom MongoDB adapter for NextAuth
 * This provides the necessary methods for NextAuth to work with MongoDB
 */
export function createMongoDBAdapter() {
  return {
    ...MongoDBAdapter(getMongoClient()),
    
    // Override methods to handle ObjectId properly
    async getUser(id: string) {
      const db = await getDatabase();
      const user = await db.collection('User').findOne({ _id: new ObjectId(id) });
      if (!user) return null;
      return {
        ...user,
        id: user._id.toString(),
        _id: undefined
      };
    },
    
    async getUserByEmail(email: string) {
      const db = await getDatabase();
      const user = await db.collection('User').findOne({ email });
      if (!user) return null;
      return {
        ...user,
        id: user._id.toString(),
        _id: undefined
      };
    },
    
    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      const db = await getDatabase();
      const account = await db.collection('Account').findOne({
        provider,
        providerAccountId
      });
      if (!account) return null;
      
      const user = await db.collection('User').findOne({
        _id: account.userId
      });
      if (!user) return null;
      
      return {
        ...user,
        id: user._id.toString(),
        _id: undefined
      };
    },
    
    async createUser(user: any) {
      const db = await getDatabase();
      
      const newUser = {
        ...user,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('User').insertOne(newUser);
      return {
        ...newUser,
        id: result.insertedId.toString(),
        _id: undefined
      };
    },
    
    async updateUser(user: any) {
      const db = await getDatabase();
      const { id, ...userData } = user;
      
      userData.updatedAt = new Date();
      
      const result = await db.collection('User').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: userData },
        { returnDocument: 'after' }
      );
      
      if (!result) return null;
      
      return {
        ...result,
        id: result._id.toString(),
        _id: undefined
      };
    }
  };
}
