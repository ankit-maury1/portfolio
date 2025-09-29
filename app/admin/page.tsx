"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

interface AdminOverviewStats {
  projectsCount: number;
  skillsCount: number;
  blogPostsCount: number;
  experiencesCount: number;
}

interface ActivityItem {
  _id: string;
  type: 'blog' | 'project' | 'skill' | 'experience' | 'education' | 'profile' | 'contact';
  title: string;
  description: string;
  action: 'create' | 'update' | 'delete';
  timestamp: string;
  user?: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminOverviewStats>({
    projectsCount: 0,
    skillsCount: 0,
    blogPostsCount: 0,
    experiencesCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  
  // Format date for display
  const formatDate = (date: Date): string => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Fetch recent activities
  const fetchActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const response = await fetch('/api/activities?limit=5', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        // Support both legacy array and new paginated format
        const list = Array.isArray(data) ? data : data.activities || [];
        setActivities(list);
      } else {
        console.error("Error fetching activities:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Projects count
        const projectsResponse = await fetch('/api/projects');
        const projectsData = await projectsResponse.json();
        
        // Skills count
        const skillsResponse = await fetch('/api/skills');
        const skillsData = await skillsResponse.json();
        
        // Blog posts count (if API exists)
        let blogData = [];
        try {
          const blogResponse = await fetch('/api/blog-posts');
          if (blogResponse.ok) {
            blogData = await blogResponse.json();
          }
        } catch (error) {
          console.warn('Blog API may not be implemented yet');
        }
        
        // Experiences count
        const experiencesResponse = await fetch('/api/experiences');
        const experiencesData = await experiencesResponse.json();
        
        setStats({
          projectsCount: projectsData.length,
          skillsCount: skillsData.length,
          blogPostsCount: blogData.length || 0,
          experiencesCount: experiencesData.length
        });
        
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
    fetchActivities();
  }, []);
  
  return (
    <div>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session?.user?.name || "Admin"}
        </p>
      </motion.div>
      
      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
            <div className="rounded-xl border border-border bg-card text-card-foreground p-6 backdrop-blur-sm">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="w-12 h-12 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="rounded-lg bg-muted/50 border border-primary/20 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-primary">{stats.projectsCount}</div>
                            <div className="text-sm text-muted-foreground">Total Projects</div>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-lg bg-muted/50 border border-secondary/20 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-secondary">{stats.skillsCount}</div>
                            <div className="text-sm text-muted-foreground">Skills</div>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-lg bg-muted/50 border border-accent/20 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-accent">{stats.blogPostsCount}</div>
                            <div className="text-sm text-muted-foreground">Blog Posts</div>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-lg bg-muted/50 border border-lime-500/20 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-lime-500">{stats.experiencesCount}</div>
                            <div className="text-sm text-muted-foreground">Experiences</div>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-lime-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-medium">Recent Activity</h3>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={fetchActivities} 
                          className="text-sm text-primary hover:text-primary/80"
                        >
                          Refresh
                        </button>
                        <Link href="/admin/activities" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
                          View all
                        </Link>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {activities.length === 0 && !isLoading ? (
                        <div className="p-4 bg-muted/30 border border-border rounded-lg text-center">
                          <p className="text-muted-foreground">No recent activity found</p>
                        </div>
                      ) : isLoadingActivities ? (
                        <div className="flex justify-center p-4">
                          <div className="w-8 h-8 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        activities.map((activity, idx) => (
                          <div key={activity._id} className="flex items-center p-3 rounded-lg bg-card/50 border border-border">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground font-bold mr-3
                              ${activity.type === 'blog' ? 'bg-accent' : 
                                activity.type === 'project' ? 'bg-primary' : 
                                activity.type === 'skill' ? 'bg-secondary' :
                                activity.type === 'experience' ? 'bg-lime-500' :
                                activity.type === 'contact' ? 'bg-amber-500' : 'bg-blue-500'}
                            `}>
                              {activity.type.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-card-foreground">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {activity.description} • {formatDate(new Date(activity.timestamp))}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-card/50 rounded-lg p-4 border border-border">
                    <h3 className="text-lg font-medium mb-2">Quick Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Link 
                        href="/admin/projects" 
                        className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-all flex items-center group"
                      >
                        <span className="group-hover:text-primary transition-colors">Manage Projects</span>
                        <svg className="h-4 w-4 ml-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link 
                        href="/admin/skills" 
                        className="p-3 rounded-lg bg-muted/30 border border-border hover:border-secondary/30 transition-all flex items-center group"
                      >
                        <span className="group-hover:text-secondary transition-colors">Manage Skills</span>
                        <svg className="h-4 w-4 ml-auto text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link 
                        href="/admin/blog" 
                        className="p-3 rounded-lg bg-muted/30 border border-border hover:border-accent/30 transition-all flex items-center group"
                      >
                        <span className="group-hover:text-accent transition-colors">Manage Blog</span>
                        <svg className="h-4 w-4 ml-auto text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link 
                        href="/admin/content" 
                        className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-all flex items-center group"
                      >
                        <span className="group-hover:text-primary transition-colors">Site Content</span>
                        <svg className="h-4 w-4 ml-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link 
                        href="/admin/activities" 
                        className="p-3 rounded-lg bg-muted/30 border border-border hover:border-blue-500/40 transition-all flex items-center group"
                      >
                        <span className="group-hover:text-blue-500 transition-colors">Activity History</span>
                        <svg className="h-4 w-4 ml-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link 
                        href="/admin/contact" 
                        className="p-3 rounded-lg bg-muted/30 border border-border hover:border-amber-500/30 transition-all flex items-center group"
                      >
                        <span className="group-hover:text-amber-500 transition-colors">Contact Messages</span>
                        <svg className="h-4 w-4 ml-auto text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link 
                        href="/admin/experience" 
                        className="p-3 rounded-lg bg-muted/30 border border-border hover:border-lime-500/30 transition-all flex items-center group"
                      >
                        <span className="group-hover:text-lime-500 transition-colors">Manage Experience</span>
                        <svg className="h-4 w-4 ml-auto text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
            </div>
          </motion.div>
      </div>
  );
}
