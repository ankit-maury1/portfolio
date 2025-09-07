// Test script to check blog functionality
import { getDatabase } from './lib/mongodb-helpers';

async function testBlogSystem() {
  try {
    console.log('Testing blog system...');

    const db = await getDatabase();

    // Check if BlogPost collection exists and has data
    const blogPostsCount = await db.collection('BlogPost').countDocuments();
    console.log(`Found ${blogPostsCount} blog posts in database`);

    // Check if BlogTag collection exists and has data
    const blogTagsCount = await db.collection('BlogTag').countDocuments();
    console.log(`Found ${blogTagsCount} blog tags in database`);

    // Get a sample of blog posts
    const samplePosts = await db.collection('BlogPost').find({}).limit(3).toArray();
    console.log('Sample blog posts:', samplePosts.map(p => ({
      id: p._id.toString(),
      title: p.title,
      published: p.published,
      createdAt: p.createdAt
    })));

    // Get a sample of tags
    const sampleTags = await db.collection('BlogTag').find({}).limit(3).toArray();
    console.log('Sample blog tags:', sampleTags.map(t => ({
      id: t._id.toString(),
      name: t.name,
      slug: t.slug
    })));

  } catch (error) {
    console.error('Error testing blog system:', error);
  }
}

testBlogSystem();
