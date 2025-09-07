'use server';

import { getMongoClient } from './mongodb';
import { ObjectId } from 'mongodb';

// Helper function to get a database instance
export async function getDatabase() {
  const client = await getMongoClient();
  return client.db();
}

// Generic CRUD operations for any collection
export async function findMany(collection: string, query = {}, options = {}) {
  const db = await getDatabase();
  return db.collection(collection).find(query, options).toArray();
}

export async function findOne(collection: string, query = {}, options = {}) {
  const db = await getDatabase();
  return db.collection(collection).findOne(query, options);
}

export async function findById(collection: string, id: string) {
  const db = await getDatabase();
  return db.collection(collection).findOne({ _id: new ObjectId(id) });
}

export async function insertOne(collection: string, document: any) {
  const db = await getDatabase();
  return db.collection(collection).insertOne(document);
}

export async function updateOne(collection: string, filter: any, update: any) {
  const db = await getDatabase();
  return db.collection(collection).updateOne(filter, { $set: update });
}

export async function updateById(collection: string, id: string, update: any) {
  const db = await getDatabase();
  return db.collection(collection).updateOne(
    { _id: new ObjectId(id) }, 
    { $set: update }
  );
}

export async function deleteOne(collection: string, filter: any) {
  const db = await getDatabase();
  return db.collection(collection).deleteOne(filter);
}

export async function deleteById(collection: string, id: string) {
  const db = await getDatabase();
  return db.collection(collection).deleteOne({ _id: new ObjectId(id) });
}

// Additional operations for working with arrays and relations
export async function addToArray(collection: string, id: string, field: string, value: any) {
  const db = await getDatabase();
  return db.collection(collection).updateOne(
    { _id: new ObjectId(id) },
    { $addToSet: { [field]: value } }
  );
}

export async function removeFromArray(collection: string, id: string, field: string, value: any) {
  const db = await getDatabase();
  return db.collection(collection).updateOne(
    { _id: new ObjectId(id) },
    { $pull: { [field]: value } }
  );
}

// Special helper for blog post tags (many-to-many relation)
export async function addTagToPost(postId: string, tagId: string) {
  const db = await getDatabase();
  
  // Add tag to post
  await db.collection('BlogPost').updateOne(
    { _id: new ObjectId(postId) },
    { $addToSet: { tagIds: new ObjectId(tagId) } }
  );
  
  // Add post to tag
  await db.collection('BlogTag').updateOne(
    { _id: new ObjectId(tagId) },
    { $addToSet: { postIds: new ObjectId(postId) } }
  );
}

export async function removeTagFromPost(postId: string, tagId: string) {
  const db = await getDatabase();
  const objectIdTagId = new ObjectId(tagId);
  const objectIdPostId = new ObjectId(postId);
  
  // Remove tag from post
  await db.collection('BlogPost').updateOne(
    { _id: objectIdPostId },
    { $pull: { tagIds: objectIdTagId } as any }
  );
  
  // Remove post from tag
  await db.collection('BlogTag').updateOne(
    { _id: objectIdTagId },
    { $pull: { postIds: objectIdPostId } as any }
  );
}

// Special helper for project skills (many-to-many relation)
export async function addSkillToProject(projectId: string, skillId: string) {
  const db = await getDatabase();
  const objectIdSkillId = new ObjectId(skillId);
  const objectIdProjectId = new ObjectId(projectId);
  
  // Add skill to project
  await db.collection('Project').updateOne(
    { _id: objectIdProjectId },
    { $addToSet: { skillIds: objectIdSkillId } }
  );
  
  // Add project to skill
  await db.collection('Skill').updateOne(
    { _id: objectIdSkillId },
    { $addToSet: { projectIds: objectIdProjectId } }
  );
}

export async function removeSkillFromProject(projectId: string, skillId: string) {
  const db = await getDatabase();
  const objectIdSkillId = new ObjectId(skillId);
  const objectIdProjectId = new ObjectId(projectId);
  
  // Remove skill from project
  await db.collection('Project').updateOne(
    { _id: objectIdProjectId },
    { $pull: { skillIds: objectIdSkillId } as any }
  );
  
  // Remove project from skill
  await db.collection('Skill').updateOne(
    { _id: objectIdSkillId },
    { $pull: { projectIds: objectIdProjectId } as any }
  );
}
