import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/mongodb-helpers';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Try to fetch tags from MongoDB
    let tags: any[] = [];
    try {
      tags = await db.collection('BlogTag')
        .aggregate([
          { $sort: { name: 1 } },
          {
            $lookup: {
              from: 'BlogPost',
              let: { tagId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ['$$tagId', '$tagIds'] },
                    published: true,
                    status: 'PUBLISHED'
                  }
                }
              ],
              as: 'posts'
            }
          },
          {
            $match: {
              'posts.0': { $exists: true } // Only include tags that have at least one published post
            }
          },
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
              postIds: 1,
              createdAt: 1,
              updatedAt: 1,
              _count: {
                posts: { $size: '$posts' }
              }
              // Don't include the posts field
            }
          }
        ])
        .toArray();
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with dummy data if MongoDB fails
    }
    
    // If no tags found in database, return empty array
    if (!tags || tags.length === 0) {
      console.log('No blog tags found in database');
      return NextResponse.json([]);
    }
    
    // Transform _id to id for client-side compatibility
    const transformedTags = tags.map(tag => {
      return {
        id: tag._id.toString(),
        ...tag,
        _id: undefined
      };
    });
    
    return NextResponse.json(transformedTags);
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  // Check if user is authenticated and has admin role
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const db = await getDatabase();
    const body = await request.json();
    
    // Create slug from tag name
    const slug = body.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Check if tag already exists
    const existingTag = await db.collection('BlogTag').findOne({
      $or: [{ name: body.name }, { slug }]
    });
    
    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 400 }
      );
    }
    
    // Create new tag
    const newTag = {
      name: body.name,
      slug,
      postIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('BlogTag').insertOne(newTag);
    
    // Return the created tag with id
    const createdTag = {
      id: result.insertedId.toString(),
      ...newTag,
      _count: { posts: 0 }
    };
    
    return NextResponse.json(createdTag);
  } catch (error) {
    console.error('Error creating blog tag:', error);
    return NextResponse.json(
      { error: 'Failed to create blog tag' },
      { status: 500 }
    );
  }
}
