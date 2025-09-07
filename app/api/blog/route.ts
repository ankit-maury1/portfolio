import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-helpers';

// API route to fetch all blog posts
export async function GET() {
	try {
		const db = await getDatabase();
    
		// Query MongoDB for blog posts
		const blogPosts = await db.collection('BlogPost')
			.aggregate([
				{ 
					$match: { 
						published: true,
						status: 'PUBLISHED'
					} 
				},
				{ $sort: { publishedAt: -1 } },
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
						content: { $substr: ["$content", 0, 150] },
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
			.toArray();

		// If no blog posts found in MongoDB, return empty array
		if (!blogPosts || blogPosts.length === 0) {
			return NextResponse.json([]);
		}

		// Transform MongoDB documents for client-side compatibility
		const transformedPosts = blogPosts.map((post: any) => {
			const tags = post.tags?.map((tag: any) => tag.name || tag) || [];
      
			return {
				id: post._id.toString(),
				title: post.title,
				slug: post.slug,
				excerpt: post.summary || post.content || "",
				content: post.content,
				coverImage: post.coverImage,
				publishedAt: post.publishedAt || post.createdAt,
				tags: tags,
			};
		});

		return NextResponse.json(transformedPosts);
	} catch (error) {
		console.error('Error fetching blog posts:', error);
		// Return empty array on error
		return NextResponse.json([]);
	}
}
