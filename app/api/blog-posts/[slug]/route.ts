import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-helpers';

// This is a custom API route to fetch blog posts by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json(
      { error: 'Slug parameter is required' },
      { status: 400 }
    );
  }

  try {
    const db = await getDatabase();

    // Try to find the blog post by slug in MongoDB
    const blogPost = await db.collection('BlogPost')
      .aggregate([
        { $match: { slug } },
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
            createdAt: 1,
            tags: 1,
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
    const tags = blogPost.tags?.map((tag: any) => tag.name || tag) || [];

    const transformedPost = {
      id: blogPost._id.toString(),
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.summary || "",
      content: blogPost.content,
      coverImage: blogPost.coverImage,
      publishedAt: blogPost.publishedAt || blogPost.createdAt,
      tags: tags,
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
