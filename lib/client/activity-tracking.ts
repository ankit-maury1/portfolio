'use client';

/**
 * Client-side helper for tracking page views and activities
 * This is a simplified version that doesn't import MongoDB directly
 */

/**
 * Tracks a page view by sending a request to the page-views API
 * @param path The path to track
 * @param title Optional title of the page
 * @returns Promise that resolves when tracking is complete
 */
export async function trackPageView(path: string, title?: string, trackAsActivity: boolean = false): Promise<number> {
  try {
    // Check if this is an admin path
    const isAdminPath = path.toLowerCase().includes('/admin/');
    
    // Track the page view count regardless of path
    const response = await fetch('/api/page-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to track page view: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Only track as activity if explicitly requested AND not an admin path
    if (title && trackAsActivity && !isAdminPath) {
      await trackActivity({
        type: getActivityTypeFromPath(path),
        title,
        description: `Viewed ${title}`,
        action: 'view',
        details: `Page view at ${path}`,
        path
      });
    }
    
    return data.count || 0;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return 0;
  }
}

/**
 * Gets the view count for a specific page
 * @param path The path to get view count for
 * @returns Promise that resolves with the view count
 */
export async function getPageViewCount(path: string): Promise<number> {
  try {
    const response = await fetch(`/api/page-views?path=${encodeURIComponent(path)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get page view count: ${response.status}`);
    }
    
    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error getting page view count:', error);
    return 0;
  }
}

/**
 * Determine the activity type from the URL path
 */
function getActivityTypeFromPath(path: string): 'blog' | 'project' | 'skill' | 'experience' | 'education' | 'profile' | 'contact' {
  path = path.toLowerCase();
  if (path.includes('/blog')) return 'blog';
  if (path.includes('/project')) return 'project';
  if (path.includes('/skill')) return 'skill';
  if (path.includes('/experience')) return 'experience';
  if (path.includes('/education')) return 'education';
  if (path.includes('/profile')) return 'profile';
  if (path.includes('/contact')) return 'contact';
  return 'profile'; // Default
}

/**
 * Track a detailed activity from the client-side
 */
interface ClientActivityData {
  type: 'blog' | 'project' | 'skill' | 'experience' | 'education' | 'profile' | 'contact';
  title: string;
  description: string;
  action: 'create' | 'update' | 'delete' | 'view';
  details?: string;
  path?: string;
}

export async function trackActivity(data: ClientActivityData): Promise<void> {
  try {
    // Skip tracking admin views
    if (data.action === 'view' && data.path?.toLowerCase().includes('/admin/')) {
      return; // Don't record admin page views
    }
    
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      console.warn('Activity tracking not authorized or failed:', await response.text());
    }
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
}
