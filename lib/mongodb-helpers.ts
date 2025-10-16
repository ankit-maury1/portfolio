'use server';

import { getMongoClient } from './mongodb';
import {
  ObjectId,
  Db,
  Document,
  Filter,
  FindOptions,
  WithId,
  InsertOneResult,
  UpdateFilter,
  UpdateResult,
  DeleteResult,
  OptionalUnlessRequiredId
} from 'mongodb';

// Helper function to get a database instance
export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db();
}

// Generic CRUD operations for collections with proper types
export async function findMany<T extends Document = Document>(
  collection: string,
  query: Filter<T> = {} as Filter<T>,
  options: FindOptions<T> = {}
): Promise<Array<WithId<T>>> {
  const db = await getDatabase();
  return db.collection<T>(collection).find(query, options).toArray() as Promise<Array<WithId<T>>>;
}

export async function findOne<T extends Document = Document>(
  collection: string,
  query: Filter<T> = {} as Filter<T>,
  options: FindOptions<T> = {}
): Promise<WithId<T> | null> {
  const db = await getDatabase();
  return db.collection<T>(collection).findOne(query, options) as Promise<WithId<T> | null>;
}

export async function findById<T extends Document = Document>(collection: string, id: string): Promise<WithId<T> | null> {
  const db = await getDatabase();
  return db.collection<T>(collection).findOne({ _id: new ObjectId(id) } as Filter<T>) as Promise<WithId<T> | null>;
}

export async function insertOne<T extends Document = Document>(collection: string, document: OptionalUnlessRequiredId<T>): Promise<InsertOneResult<WithId<T>>> {
  const db = await getDatabase();
  return db.collection<T>(collection).insertOne(document as OptionalUnlessRequiredId<T>) as Promise<InsertOneResult<WithId<T>>>;
}

export async function updateOne<T extends Document = Document>(collection: string, filter: Filter<T>, update: UpdateFilter<T> | Partial<T>): Promise<UpdateResult> {
  const db = await getDatabase();
  // cast through unknown to satisfy strict UpdateFilter typing when using dynamic keys
  return db.collection<T>(collection).updateOne(filter, { $set: update } as unknown as UpdateFilter<T>);
}

export async function updateById<T extends Document = Document>(collection: string, id: string, update: UpdateFilter<T> | Partial<T>): Promise<UpdateResult> {
  const db = await getDatabase();
  return db.collection<T>(collection).updateOne(
    { _id: new ObjectId(id) } as Filter<T>,
    { $set: update } as unknown as UpdateFilter<T>
  );
}

export async function deleteOne<T extends Document = Document>(collection: string, filter: Filter<T>): Promise<DeleteResult> {
  const db = await getDatabase();
  return db.collection<T>(collection).deleteOne(filter);
}

export async function deleteById(collection: string, id: string): Promise<DeleteResult> {
  const db = await getDatabase();
  return db.collection(collection).deleteOne({ _id: new ObjectId(id) });
}

// Additional operations for working with arrays and relations
export async function addToArray<T extends Document = Document>(collection: string, id: string, field: string, value: unknown): Promise<UpdateResult> {
  const db = await getDatabase();
  return db.collection<T>(collection).updateOne(
    { _id: new ObjectId(id) } as Filter<T>,
    { $addToSet: { [field]: value } } as unknown as UpdateFilter<T>
  );
}

export async function removeFromArray<T extends Document = Document>(collection: string, id: string, field: string, value: unknown): Promise<UpdateResult> {
  const db = await getDatabase();
  return db.collection<T>(collection).updateOne(
    { _id: new ObjectId(id) } as Filter<T>,
    { $pull: { [field]: value } } as unknown as UpdateFilter<T>
  );
}

// Special helper for blog post tags (many-to-many relation)
export async function addTagToPost(postId: string, tagId: string): Promise<void> {
  const db = await getDatabase();
  // Add tag to post
  await db.collection('BlogPost').updateOne(
    { _id: new ObjectId(postId) },
    { $addToSet: { tagIds: new ObjectId(tagId) } } as unknown as UpdateFilter<Document>
  );
  // Add post to tag
  await db.collection('BlogTag').updateOne(
    { _id: new ObjectId(tagId) },
    { $addToSet: { postIds: new ObjectId(postId) } } as unknown as UpdateFilter<Document>
  );
}

export async function removeTagFromPost(postId: string, tagId: string): Promise<void> {
  const db = await getDatabase();
  const objectIdTagId = new ObjectId(tagId);
  const objectIdPostId = new ObjectId(postId);
  // Remove tag from post
  await db.collection('BlogPost').updateOne(
    { _id: objectIdPostId },
    { $pull: { tagIds: objectIdTagId } } as unknown as UpdateFilter<Document>
  );
  // Remove post from tag
  await db.collection('BlogTag').updateOne(
    { _id: objectIdTagId },
    { $pull: { postIds: objectIdPostId } } as unknown as UpdateFilter<Document>
  );
}

// Special helper for project skills (many-to-many relation)
export async function addSkillToProject(projectId: string, skillId: string): Promise<void> {
  const db = await getDatabase();
  const objectIdSkillId = new ObjectId(skillId);
  const objectIdProjectId = new ObjectId(projectId);
  // Add skill to project
  await db.collection('Project').updateOne(
    { _id: objectIdProjectId },
    { $addToSet: { skillIds: objectIdSkillId } } as unknown as UpdateFilter<Document>
  );
  // Add project to skill
  await db.collection('Skill').updateOne(
    { _id: objectIdSkillId },
    { $addToSet: { projectIds: objectIdProjectId } } as unknown as UpdateFilter<Document>
  );
}

export async function removeSkillFromProject(projectId: string, skillId: string): Promise<void> {
  const db = await getDatabase();
  const objectIdSkillId = new ObjectId(skillId);
  const objectIdProjectId = new ObjectId(projectId);
  // Remove skill from project
  await db.collection('Project').updateOne(
    { _id: objectIdProjectId },
    { $pull: { skillIds: objectIdSkillId } } as unknown as UpdateFilter<Document>
  );
  // Remove project from skill
  await db.collection('Skill').updateOne(
    { _id: objectIdSkillId },
    { $pull: { projectIds: objectIdProjectId } } as unknown as UpdateFilter<Document>
  );
}
