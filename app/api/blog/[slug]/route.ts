import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-helpers';

// Fetch a single blog post by slug
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;

	if (!slug) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	try {
		const db = await getDatabase();

		const post = await db.collection('BlogPost').findOne({ 
			slug,
			published: true,
			status: 'PUBLISHED'
		});

		if (!post) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 });
		}

		const transformed = {
			id: post._id?.toString(),
			title: post.title,
			slug: post.slug,
			excerpt: post.summary || post.content || '',
			content: post.content,
			coverImage: post.coverImage,
			publishedAt: post.publishedAt || post.createdAt,
			tags: (post.tagIds || []).map((t: any) => (t.name ? t.name : t)),
		};

		return NextResponse.json(transformed);
	} catch (error) {
		console.error('Error fetching post by slug:', error);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

// For other methods, return 405
export async function POST() {
	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
