// Mark this file as a server component
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-direct';

// Direct database operations for page views
async function getPageViewCount(path: string) {
  try {
    const db = await connectToDatabase();
    const normalizedPath = path.toLowerCase();
    const pageView = await db.collection('page_views').findOne({ path: normalizedPath });
    return pageView ? pageView.count : 0;
  } catch (error) {
    console.error('Error getting page view count:', error);
    return 0;
  }
}

async function incrementPageView(path: string) {
  try {
    const db = await connectToDatabase();
    const normalizedPath = path.toLowerCase();
    
    // Try to update first (if document exists)
    const result = await db.collection('page_views').updateOne(
      { path: normalizedPath },
      { $inc: { count: 1 }, $set: { lastUpdated: new Date() } },
      { upsert: true }
    );
    
    // Get the updated count
    const pageView = await db.collection('page_views').findOne({ path: normalizedPath });
    return pageView ? pageView.count : 1;
  } catch (error) {
    console.error('Error incrementing page view:', error);
    return 0;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      );
    }
    
    const count = await getPageViewCount(path);
    
    return NextResponse.json({
      count,
      path: path.toLowerCase()
    });
  } catch (error) {
    console.error('Error fetching page view count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page view count' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      );
    }
    
    const count = await incrementPageView(path);
    
    return NextResponse.json({
      success: true,
      count,
      path: path.toLowerCase()
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}
