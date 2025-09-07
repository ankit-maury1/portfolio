import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-helpers';
import { ObjectId } from 'mongodb';

// This API route handles blog post operations with ID parameter
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = await getDatabase();

    // Try to find the blog post by ID in MongoDB
    const blogPost = await db.collection('BlogPost')
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
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
      .next();

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Transform for client-side compatibility
    const transformedPost = {
      id: blogPost._id.toString(),
      title: blogPost.title,
      slug: blogPost.slug,
      summary: blogPost.summary || "",
      content: blogPost.content,
      coverImage: blogPost.coverImage,
      published: blogPost.published,
      publishedAt: blogPost.publishedAt,
      featured: blogPost.featured,
      createdAt: blogPost.createdAt,
      updatedAt: blogPost.updatedAt,
      status: blogPost.status || (blogPost.published ? 'PUBLISHED' : 'DRAFT'),
      tags: blogPost.tags?.map((tag: any) => ({
        id: tag._id.toString(),
        name: tag.name,
        slug: tag.slug
      })) || [],
      user: blogPost.user
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error fetching blog post by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// Update blog post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await request.json();
    const db = await getDatabase();

    // Add updated timestamp
    data.updatedAt = new Date();

    // Convert status to published boolean and handle different status types
    if (data.status) {
      // Convert status string to published boolean
      data.published = data.status === 'PUBLISHED';

      // For published posts, set publishedAt if not already set
      if (data.published && !data.publishedAt) {
        data.publishedAt = new Date();
      }

      // Store the status as well for admin panel filtering
      data.status = data.status;
    } else if (data.published !== undefined && !data.status) {
      // Only convert published boolean to status if status is not already set
      data.status = data.published ? 'PUBLISHED' : 'DRAFT';
      if (data.published && !data.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    // Process tags if they exist
    if (data.tags && Array.isArray(data.tags)) {
      try {
        // Check if we need to convert tag names to IDs
        if (typeof data.tags[0] === 'string' || typeof data.tags[0] === 'object' && data.tags[0].name) {
          const tagDocs = await Promise.all(data.tags.map(async (tag: string | any) => {
            const tagName = typeof tag === 'string' ? tag : tag.name;

            // Find or create tag
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
          delete data.tags; // Remove tags array as we now have tagIds
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
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// Delete blog post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = await getDatabase();

    // Delete the blog post
    const result = await db.collection('BlogPost').deleteOne(
      { _id: new ObjectId(id) }
    );

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}