import { findMany, findOne, updateOne } from '@/lib/mongodb-helpers';
import { ObjectId } from 'mongodb';
import { ActivityItem } from './activity-tracking';

// Get recent activities
export async function getRecentActivities(limit: number = 10, includePageViews: boolean = false) {
  try {
    // Default query excludes page views unless explicitly requested
    const query = includePageViews ? {} : { action: { $ne: 'view' } };
    
    const activities = await findMany(
      'activities',
      query,
      { 
        sort: { timestamp: -1 }, 
        limit 
      }
    );
    
    return activities.map(activity => ({
      ...activity,
      _id: activity._id.toString(),
      timestamp: new Date(activity.timestamp),
    }));
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

// Get activities by type
export async function getActivitiesByType(type: ActivityItem['type'], limit: number = 20) {
  try {
    const activities = await findMany(
      'activities',
      { type },
      { 
        sort: { timestamp: -1 }, 
        limit 
      }
    );
    
    return activities.map(activity => ({
      ...activity,
      _id: activity._id.toString(),
      timestamp: new Date(activity.timestamp),
    }));
  } catch (error) {
    console.error(`Error fetching ${type} activities:`, error);
    return [];
  }
}

// Get activities by item ID
export async function getActivitiesByItemId(itemId: string, limit: number = 20) {
  try {
    const activities = await findMany(
      'activities',
      { itemId },
      { 
        sort: { timestamp: -1 }, 
        limit 
      }
    );
    
    return activities.map(activity => ({
      ...activity,
      _id: activity._id.toString(),
      timestamp: new Date(activity.timestamp),
    }));
  } catch (error) {
    console.error(`Error fetching activities for item ${itemId}:`, error);
    return [];
  }
}

// Get all activities for admin view
export async function getAllActivitiesForAdmin(
  page: number = 1, 
  pageSize: number = 50,
  type?: ActivityItem['type']
) {
  try {
    // Create query based on whether type filter is provided
    const query = type ? { type } : {};
    
    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;
    
    // Get activities with pagination
    const activities = await findMany(
      'activities',
      query,
      { 
        sort: { timestamp: -1 }, 
        skip,
        limit: pageSize 
      }
    );
    
    // Get total count for pagination
    const totalCount = await findMany('activities', query);
    
    return {
      activities: activities.map(activity => ({
        ...activity,
        _id: activity._id.toString(),
        timestamp: new Date(activity.timestamp),
      })),
      pagination: {
        total: totalCount.length,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount.length / pageSize)
      }
    };
  } catch (error) {
    console.error('Error fetching activities for admin:', error);
    return {
      activities: [],
      pagination: {
        total: 0,
        page,
        pageSize,
        totalPages: 0
      }
    };
  }
}

// Get activity statistics
export async function getActivityStatistics() {
  try {
    // Get all activities
    const activities = await findMany('activities', {});
    
    // Current date for calculations
    const now = new Date();
    
    // Get activities from last 24 hours
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last24HoursActivities = activities.filter(
      activity => new Date(activity.timestamp) >= last24Hours
    );
    
    // Get activities from last 7 days
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last7DaysActivities = activities.filter(
      activity => new Date(activity.timestamp) >= last7Days
    );
    
    // Get activities from last 30 days
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last30DaysActivities = activities.filter(
      activity => new Date(activity.timestamp) >= last30Days
    );
    
    // Count by type
    const countByType: Record<string, number> = {};
    activities.forEach(activity => {
      if (!countByType[activity.type]) {
        countByType[activity.type] = 0;
      }
      countByType[activity.type]++;
    });
    
    // Count by action
    const countByAction: Record<string, number> = {};
    activities.forEach(activity => {
      if (!countByAction[activity.action]) {
        countByAction[activity.action] = 0;
      }
      countByAction[activity.action]++;
    });
    
    return {
      total: activities.length,
      today: last24HoursActivities.length,
      last7Days: last7DaysActivities.length,
      last30Days: last30DaysActivities.length,
      byType: countByType,
      byAction: countByAction
    };
  } catch (error) {
    console.error('Error getting activity statistics:', error);
    return {
      total: 0,
      today: 0,
      last7Days: 0,
      last30Days: 0,
      byType: {},
      byAction: {}
    };
  }
}
