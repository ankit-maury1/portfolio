// types/mongodb.ts
import { ObjectId } from 'mongodb';

export interface MongoUser {
  _id: ObjectId;
  id?: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  password?: string;
  image?: string;
  role: 'USER' | 'ADMIN';
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoSkillCategory {
  _id: ObjectId;
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoSkill {
  _id: ObjectId;
  id?: string;
  name: string;
  proficiency: number;
  icon?: string;
  color?: string;
  featured: boolean;
  categoryId: ObjectId;
  projectIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoProject {
  _id: ObjectId;
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  featured: boolean;
  publishedAt: Date;
  githubUrl?: string;
  liveUrl?: string;
  coverImage?: string;
  order: number;
  userId: ObjectId;
  skillIds: ObjectId[];
  gallery?: string[];
  status?: 'planned' | 'in-progress' | 'completed';
  category?: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'design';
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoExperience {
  _id: ObjectId;
  id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  logo?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoEducation {
  _id: ObjectId;
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  description: string;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  logo?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoBlogTag {
  _id: ObjectId;
  id?: string;
  name: string;
  slug: string;
  postIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoBlogPost {
  _id: ObjectId;
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string;
  published: boolean;
  publishedAt?: Date;
  featured: boolean;
  userId: ObjectId;
  tagIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
