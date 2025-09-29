import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/mongodb-helpers';
import { trackDetailedActivity } from '@/lib/activity-tracking';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // Try to get blog posts from the database
    try {
      // Get all blog posts with aggregation to include tags and user details
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
              userId: 1,
              tags: 1,
              user: {
                name: '$userDetails.name',
                image: '$userDetails.image'
              }
            }
          }
        ])
        .toArray();

      // If no posts are found in database, return empty array
      if (!blogPosts || blogPosts.length === 0) {
        console.log("No blog posts found in database");
        return NextResponse.json([]);
      }

      // Transform _id to id for client-side compatibility
      const transformedPosts = blogPosts.map(post => {
        const tags = post.tags?.map((tag: any) => tag.name || tag) || [];
        return {
          id: post._id.toString(),
          title: post.title,
          slug: post.slug,
          excerpt: post.summary || "",
          content: post.content,
          coverImage: post.coverImage,
          publishedAt: post.publishedAt || post.createdAt,
          tags: tags,
          _id: undefined
        };
      });

      return NextResponse.json(transformedPosts);
    } catch (error) {
      console.error('Error fetching blog posts from database:', error);
      // Return empty array on database error
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
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
    const body = await request.json();

    // Create unique slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');

    // Get database connection
    const db = await getDatabase();

    // Process tags
    const tagIds: ObjectId[] = [];
    if (body.tags && Array.isArray(body.tags)) {
      for (const tagName of body.tags) {
        // Try to find the tag first
        let tag = await db.collection('BlogTag').findOne({ name: tagName });

        // If tag doesn't exist, create it
        if (!tag) {
          const tagSlug = tagName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
          const result = await db.collection('BlogTag').insertOne({
            name: tagName,
            slug: tagSlug,
            postIds: [],
            createdAt: new Date(),
            updatedAt: new Date()
          });
          tag = { _id: result.insertedId };
        }

        tagIds.push(tag._id);
      }
    }

    // Create the blog post
    const blogPost = {
      title: body.title,
      slug,
      summary: body.summary || null,
      content: body.content,
      published: body.published || false,
      publishedAt: body.published ? new Date() : null,
      featured: body.featured || false,
      coverImage: body.coverImage || null,
      userId: new ObjectId(session.user.id),
      tagIds: tagIds,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the blog post
    const result = await db.collection('BlogPost').insertOne(blogPost);
    const insertedId = result.insertedId;

    // Update each tag to include this blog post
    for (const tagId of tagIds) {
      await db.collection('BlogTag').updateOne(
        { _id: tagId },
        { $addToSet: { postIds: insertedId } }
      );
    }

    // Fetch the complete blog post with tags
    const completeBlogPost = await db.collection('BlogPost')
      .aggregate([
        { $match: { _id: insertedId } },
        {
          $lookup: {
            from: 'BlogTag',
            localField: 'tagIds',
            foreignField: '_id',
            as: 'tags'
          }
        }
      ])
      .next();

    if (!completeBlogPost) {
      throw new Error('Failed to retrieve created blog post');
    }

    // Transform the response for client-side compatibility
    const transformedPost = {
      id: completeBlogPost._id.toString(),
      ...completeBlogPost,
      _id: undefined
    };

    try {
      await trackDetailedActivity(
        'blog',
        body.title,
        'create',
        `Created blog post: ${body.title}`,
        '/admin/blog',
        session.user.name || 'Admin'
      );
    } catch (err) {
      console.error('Failed to log blog create activity', err);
    }

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
