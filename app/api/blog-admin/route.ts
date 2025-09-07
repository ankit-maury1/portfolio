import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-helpers';
import { ObjectId } from 'mongodb';

// API endpoint for managing blog posts (admin)
export async function GET() {
  try {
    const db = await getDatabase();
    
    // Get all blog posts (including drafts) for admin panel
    const blogPosts = await db.collection('BlogPost')
      .aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: 'User',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'BlogTag',
            localField: 'tagIds',
            foreignField: '_id',
            as: 'tags'
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            slug: 1,
            summary: 1,
            content: 1,
            coverImage: 1,
            published: 1,
            publishedAt: 1,
            featured: 1,
            createdAt: 1,
            updatedAt: 1,
            tagIds: 1,
            tags: 1,
            status: 1,
            user: {
              name: '$userDetails.name',
              image: '$userDetails.image'
            }
          }
        }
      ])
      .toArray();
    
    // Transform for client-side compatibility
    const transformedPosts = blogPosts.map((post: any) => {
      const tags = post.tags?.map((tag: any) => ({
        id: tag._id.toString(),
        name: tag.name,
        slug: tag.slug
      })) || [];
      
      return {
        id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        summary: post.summary || "",
        content: post.content,
        coverImage: post.coverImage,
        status: post.status || (post.published ? 'PUBLISHED' : 'DRAFT'),
        published: post.published || false,
        publishedAt: post.publishedAt,
        featured: post.featured || false,
        tags: tags,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user
      };
    });
    
    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching blog posts for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// API endpoint for creating new blog posts
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDatabase();
    
    // Generate a slug from the title if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
    }
    
    // Add timestamps
    const now = new Date();
    data.createdAt = now;
    data.updatedAt = now;
    
    // Convert status to published boolean
    if (data.status) {
      data.published = data.status === 'PUBLISHED';
      // Keep the status field for admin panel filtering
      data.status = data.status;
    } else {
      // Default to draft if no status provided
      data.published = false;
      data.status = 'DRAFT';
    }

    // If published, set publishedAt date
    if (data.published && !data.publishedAt) {
      data.publishedAt = now;
    }
    
    // Convert tag names to IDs if needed
    if (data.tags && Array.isArray(data.tags)) {
      try {
        // Check if tags are strings and need conversion
        if (typeof data.tags[0] === 'string') {
          const tagDocs = await Promise.all(data.tags.map(async (tagName: string) => {
            // Find or create tag
            const existingTag = await db.collection('BlogTag').findOne({ name: tagName });
            if (existingTag) {
              return existingTag._id;
            } else {
              const slug = tagName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
              const newTag = await db.collection('BlogTag').insertOne({
                name: tagName,
                slug,
                createdAt: now
              });
              return newTag.insertedId;
            }
          }));
          data.tagIds = tagDocs;
          delete data.tags; // Remove tags array as we now have tagIds
        }
      } catch (error) {
        console.error('Error processing tags:', error);
      }
    }
    
    // Insert the blog post
    const result = await db.collection('BlogPost').insertOne(data);
    
    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      slug: data.slug
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating blog post:', error);
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Blog post ID is required' }, { status: 400 });
    }
    
    const data = await request.json();
    const db = await getDatabase();
    
    // Convert status to published boolean
    if (data.status) {
      data.published = data.status === 'PUBLISHED';
      delete data.status;
    }
    
    // Update timestamps
    data.updatedAt = new Date();
    
    // If publishing for the first time, set publishedAt
    if (data.published && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    
    // Handle tags
    if (data.tags && Array.isArray(data.tags)) {
      try {
        if (typeof data.tags[0] === 'string') {
          const tagDocs = await Promise.all(data.tags.map(async (tagName: string) => {
            const existingTag = await db.collection('BlogTag').findOne({ name: tagName });
            if (existingTag) {
              return existingTag._id;
            } else {
              const slug = tagName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
              const newTag = await db.collection('BlogTag').insertOne({
                name: tagName,
                slug,
                createdAt: new Date()
              });
              return newTag.insertedId;
            }
          }));
          data.tagIds = tagDocs;
          delete data.tags;
        }
      } catch (error) {
        console.error('Error processing tags:', error);
      }
    }
    
    // Update the blog post
    const result = await db.collection('BlogPost').updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully'
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Blog post ID is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    // Delete the blog post
    const result = await db.collection('BlogPost').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
