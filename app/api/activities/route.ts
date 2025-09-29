import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity, insertActivity } from '@/lib/activity-tracking';
import { auth } from '@/auth';
import { getDatabase, findMany } from '@/lib/mongodb-helpers';

// Ensure this route is always dynamic so recent activity isn't statically cached
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const typeParam = searchParams.get('type');
    const includeViews = searchParams.get('includeViews') === 'true';

    // Backwards compatibility: if no page param, just return recent limited list (array)
    if (!pageParam) {
      const limit = limitParam ? parseInt(limitParam, 10) : 10;
      const activities = await getRecentActivity(limit);
      // If exclude views by default like analytics helper does
      return NextResponse.json(includeViews ? activities : activities.filter(a => a.action !== 'view'));
    }

    // Paginated mode
    const page = Math.max(1, parseInt(pageParam, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeParam || '20', 10)));
    const skip = (page - 1) * pageSize;

    // Build query
    const query: any = {};
    if (typeParam) query.type = typeParam;
    if (!includeViews) query.action = { $ne: 'view' };

    const db = await getDatabase();
    const collection = db.collection('activities');
    const total = await collection.countDocuments(query);

    const activities = await collection.find(query, {
      sort: { timestamp: -1 },
      skip,
      limit: pageSize
    }).toArray();

    const formatted = activities.map(a => ({ ...a, _id: a._id.toString() }));

    return NextResponse.json({
      activities: formatted,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
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
