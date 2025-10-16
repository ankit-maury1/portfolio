import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/mongodb-helpers';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Try to fetch tags and related post counts from MongoDB
    let tagDocs: Array<{
      _id: ObjectId;
      name: string;
      slug: string;
      postIds?: string[];
      createdAt?: Date;
      updatedAt?: Date;
    }> = [];
    try {
      tagDocs = await db.collection('BlogTag').find().sort({ name: 1 }).toArray();
    } catch (dbError) {
      console.error('Database error fetching blog tags:', dbError);
      return NextResponse.json([]);
    }

    if (!tagDocs || tagDocs.length === 0) {
      console.log('No blog tags found in database');
      return NextResponse.json([]);
    }

    let postDocs: Array<{ tagIds?: ObjectId | ObjectId[] }> = [];
    try {
      postDocs = await db.collection('BlogPost')
        .find(
          { published: true, status: 'PUBLISHED' },
          { projection: { tagIds: 1 } }
        )
        .toArray();
    } catch (dbError) {
      console.error('Database error fetching blog posts for tag counts:', dbError);
      // Continue with zeroed counts if posts query fails
    }

    const postCountMap = new Map<string, number>();

    postDocs.forEach((post: { tagIds?: ObjectId | ObjectId[] }) => {
      const rawTagIds = Array.isArray(post.tagIds)
        ? post.tagIds
        : post.tagIds
        ? [post.tagIds]
        : [];

      rawTagIds.forEach((tagId: ObjectId | string) => {
        if (!tagId) return;

        let normalizedId: string | null = null;
        if (tagId instanceof ObjectId) {
          normalizedId = tagId.toHexString();
        } else if (typeof tagId === 'string') {
          if (ObjectId.isValid(tagId)) {
            normalizedId = new ObjectId(tagId).toHexString();
          } else {
            normalizedId = tagId;
          }
        }

        if (!normalizedId) return;
        postCountMap.set(normalizedId, (postCountMap.get(normalizedId) ?? 0) + 1);
      });
    });

    const transformedTags = tagDocs.map(tag => ({
      id: tag._id.toString(),
      name: tag.name,
      slug: tag.slug,
      postIds: tag.postIds ?? [],
      createdAt: tag.createdAt ?? null,
      updatedAt: tag.updatedAt ?? null,
      _count: {
        posts: postCountMap.get(tag._id.toString()) ?? 0
      }
    }));

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
