'use server';

import { ObjectId } from 'mongodb';
import { findMany, findOne, updateOne } from '@/lib/mongodb-helpers';
import { getDefaultSettingValue } from '@/lib/site-settings';

export interface ActivityItem {
  _id?: string | ObjectId;
  type: 'blog' | 'project' | 'skill' | 'experience' | 'education' | 'profile' | 'contact' | 'system';
  title: string;
  description: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'reply' | 'mark_read' | 'archive';
  timestamp: Date;
  detailedTime?: string;
  details?: string;
  path?: string;
  user?: string;
  itemId?: string;
  changes?: {
    field: string;
    oldValue?: string;
    newValue?: string;
  }[];
}

export interface PageView {
  _id?: string | ObjectId;
  path: string;
  count: number;
  lastUpdated: Date;
}

// Get recent activity across all collections
export async function getRecentActivity(limit: number = 10) {
  try {
    // Get recent activities from the activities collection
    const activities = await findMany('activities', {}, {
      sort: { timestamp: -1 },
      limit
    });
    
    if (!activities || activities.length === 0) {
      // If no activities found, create some default activities
      await createDefaultActivities();
      // Try fetching again
      const defaultActivities = await findMany('activities', {}, {
        sort: { timestamp: -1 },
        limit
      });
      
      return (defaultActivities as ActivityItem[]).map((activity: ActivityItem) => ({
        ...activity,
        _id: activity._id?.toString ? activity._id.toString() : String(activity._id),
      }));
    }
    
    return (activities as ActivityItem[]).map((activity: ActivityItem) => ({
      ...activity,
      _id: activity._id?.toString ? activity._id.toString() : String(activity._id),
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

/**
 * Track a detailed activity with more information
 * @param type The type of activity (blog, project, etc.)
 * @param title Title of the related item
 * @param action The action performed (create, update, delete, view)
 * @param details Additional details about the activity
 * @param path Optional path/URL related to the activity
 * @param user Optional user who performed the action
 */
export async function trackDetailedActivity(
  type: ActivityItem['type'],
  title: string,
  action: ActivityItem['action'],
  details: string,
  path?: string,
  user?: string,
  itemId?: string,
  changes?: ActivityItem['changes']
) {
  try {
    // Skip recording admin page views
    if (action === 'view' && user === 'admin') {
      // Don't track admin views in activity log
      return null;
    }
    
    // Format current date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    const activityData: Omit<ActivityItem, '_id'> = {
      type,
      title,
      description: `${details} on ${formattedDate} at ${formattedTime}`,
      action,
      timestamp: now,
      detailedTime: formattedTime,
      details,
      path,
      user: user || 'System',
      itemId,
      changes
    };
    
    return await insertActivity(activityData);
  } catch (error) {
    console.error('Error tracking detailed activity:', error);
    return null;
  }
}

// Track page views and return the updated count
export async function trackPageView(path: string): Promise<number> {
  try {
    // Normalize the path
    path = path.toLowerCase();
    
    // Check if we already have a record for this page
    const existingView = await findOne('page_views', { path });
    
    if (existingView) {
      // Update existing record
      await updateOne(
        'page_views',
        { path },
        { 
          count: existingView.count + 1,
          lastUpdated: new Date()
        }
      );
      
      return existingView.count + 1;
    } else {
      // Create new record
      const newView = {
        path,
        count: 1,
        lastUpdated: new Date()
      };
      
      // Insert the new document directly using mongodb-helpers
  const db = await getDatabase();
  await db.collection('page_views').insertOne(newView);
      
      return 1;
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
    return 0;
  }
}

// Get the database
async function getDatabase() {
  const { getDatabase: getDb } = await import('./mongodb-helpers');
  return getDb();
}

// Create default activities when no real ones exist yet
async function createDefaultActivities() {
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const userName = await getDefaultSettingValue('profile_name', 'Admin User');
    
    const defaultActivities: Omit<ActivityItem, '_id'>[] = [
      {
        type: 'blog',
        title: 'How to Build a Portfolio with Next.js',
        description: 'Published a new blog post',
        action: 'create',
        timestamp: now,
        user: userName
      },
      {
        type: 'project',
        title: 'Portfolio Website',
        description: 'Updated project details',
        action: 'update',
        timestamp: yesterday,
        user: userName
      },
      {
        type: 'skill',
        title: 'React',
        description: 'Added a new skill',
        action: 'create',
        timestamp: yesterday,
        user: userName
      },
      {
        type: 'experience',
        title: 'Senior Developer at Tech Corp',
        description: 'Updated job experience',
        action: 'update',
        timestamp: twoDaysAgo,
        user: userName
      },
      {
        type: 'contact',
        title: 'New Contact Message',
        description: 'Received a new contact inquiry',
        action: 'create',
        timestamp: threeDaysAgo,
        user: 'System'
      }
    ];
    
    // Insert default activities
    for (const activity of defaultActivities) {
      await insertActivity(activity);
    }
  } catch (error) {
    console.error('Error creating default activities:', error);
  }
}

// Add a new activity entry
export async function insertActivity(activity: Omit<ActivityItem, '_id'>) {
  try {
    const { insertOne } = await import('@/lib/mongodb-helpers');
    
    // Add detailed time information
    const now = new Date();
    const detailedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    // Create a complete activity record with all details
    const completeActivity = {
      ...activity,
      timestamp: now,
      detailedTime
    };
    
    const result = await insertOne('activities', completeActivity);
    
    if (result.insertedId) {
      return {
        _id: result.insertedId.toString(),
        ...completeActivity
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error inserting activity:', error);
    return null;
  }
}
