"use client";

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ActivityItem {
  _id: string;
  type: string;
  title: string;
  description: string;
  action: string;
  timestamp: string;
  user?: string;
  path?: string;
  details?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function ActivitiesHistoryPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [includeViews, setIncludeViews] = useState<boolean>(false);

  const fetchActivities = async (page = 1, type = typeFilter) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', pagination.pageSize.toString());
      if (type) params.set('type', type);
      if (includeViews) params.set('includeViews', 'true');

      const res = await fetch(`/api/activities?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        setPagination(data.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 1 });
      } else {
        console.error('Failed to load activities', await res.text());
      }
    } catch (err) {
      console.error('Error loading activities', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, includeViews]);

  // Centralized style mapping
  const { getActivityStyle } = require('@/lib/activity-style');

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Activity History</h1>
          <p className="text-muted-foreground mt-2">Full audit trail of site changes and interactions.</p>
        </div>
        <Link href="/admin" className="text-sm text-primary hover:underline">Back to Dashboard</Link>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Type:</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            >
              <option value="">All</option>
              <option value="blog">Blog</option>
              <option value="project">Project</option>
              <option value="skill">Skill</option>
              <option value="experience">Experience</option>
              <option value="education">Education</option>
              <option value="profile">Profile</option>
              <option value="contact">Contact</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeViews}
              onChange={e => setIncludeViews(e.target.checked)}
              className="h-4 w-4"
            />
            Include views
          </label>
          <button
            onClick={() => fetchActivities(pagination.page)}
            className="text-sm px-3 py-1 rounded bg-primary text-primary-foreground hover:opacity-90"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
          <div className="col-span-2">Time</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2">Action</div>
            <div className="col-span-4">Title / Description</div>
            <div className="col-span-2">User</div>
            <div className="col-span-1 text-right">Link</div>
        </div>
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No activities found</div>
        ) : (
          <ul className="divide-y divide-border">
            {activities.map(activity => (
              <li key={activity._id} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm">
                <div className="col-span-2 text-muted-foreground">{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</div>
                <div className="col-span-1">
                  {(() => { const style = getActivityStyle(activity.type); return (
                    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold ${style.text} ${style.badgeBg}`}>{activity.type?.charAt(0)?.toUpperCase()}</span>
                  ); })()}
                </div>
                <div className="col-span-2 capitalize">
                  <span className="inline-block px-2 py-0.5 rounded bg-muted text-xs border border-border">{activity.action}</span>
                </div>
                <div className="col-span-4">
                  <div className="font-medium truncate" title={activity.title}>{activity.title}</div>
                  <div className="text-xs text-muted-foreground truncate" title={activity.description}>{activity.description}</div>
                </div>
                <div className="col-span-2 text-muted-foreground truncate" title={activity.user}>{activity.user || 'System'}</div>
                <div className="col-span-1 text-right">
                  {activity.path ? (
                    <Link href={activity.path} className="text-xs text-primary hover:underline" target={activity.path.startsWith('/admin') ? '_self' : '_blank'}>
                      View
                    </Link>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-muted-foreground">Showing {activities.length} of {pagination.total} activities</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => pagination.page > 1 && fetchActivities(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 text-sm rounded border border-border disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs text-muted-foreground">Page {pagination.page} / {pagination.totalPages}</span>
          <button
            onClick={() => pagination.page < pagination.totalPages && fetchActivities(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 text-sm rounded border border-border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
