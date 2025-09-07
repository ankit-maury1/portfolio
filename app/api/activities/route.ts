import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity, insertActivity } from '@/lib/activity-tracking';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const page = searchParams.get('page');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    // No more page view handling in this route
    if (page) {
      return NextResponse.json({
        error: "Page view functionality moved to /api/page-views"
      }, { status: 301 });
    }
    
    // Otherwise get activities
    const activities = await getRecentActivity(limit);
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get activity data
    const body = await request.json();
    const { type, title, description, action, details, path } = body;
    
    // Check if this is an admin view - if so, don't record it
    if (action === 'view' && path?.toLowerCase().includes('/admin/')) {
      return NextResponse.json({ skipped: true, message: 'Admin page views are not tracked' });
    }
    
    // Validate required fields
    if (!type || !title || !action) {
      return NextResponse.json(
        { error: 'Type, title and action are required' },
        { status: 400 }
      );
    }
    
    // Check if this is admin or system action
    const session = await auth();
    const isUserAction = action !== 'view' && action !== 'create';
    
    // For update/delete actions, require admin authentication
    if (isUserAction && (!session?.user || session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized for this action type' }, { status: 401 });
    }
    
    // Create activity with detailed tracking
    const activityData: any = {
      type,
      title,
      description: description || '',
      action,
      timestamp: new Date(),
      details: details || '',
      path: path || ''
    };
    
    // Add user info if authenticated
    if (session?.user) {
      activityData.user = session.user.name || 'Admin';
    } else {
      activityData.user = 'Visitor';
    }
    
    const activity = await insertActivity(activityData);
    
    if (!activity) {
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
