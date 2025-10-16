"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";

// Type definitions
interface AdminOverviewStats {
  projectsCount: number;
  skillsCount: number;
  blogPostsCount: number;
  experiencesCount: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminOverviewStats>({
    projectsCount: 0,
    skillsCount: 0,
    blogPostsCount: 0,
    experiencesCount: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Array<{
    _id?: string;
    type: string;
    title?: string;
    description?: string;
    timestamp: string;
    detailedTime?: string;
    user?: string;
    metadata?: Record<string, unknown>;
  }>>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  
  // Fetch dashboard stats with auto-refresh
  useEffect(() => {
    // Define the fetch functions
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
    
    // Fetch recent activities from API
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await fetch('/api/activities?limit=10');
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setActivitiesLoading(false);
      }
    };
    
    // Initial data fetching
    fetchStats();
    fetchActivities();
    
    // Set up auto-refresh for activities (every 30 seconds)
    const activityRefreshInterval = setInterval(() => {
      console.log("Auto-refreshing activities data...");
      fetchActivities();
    }, 30000); // 30 seconds
    
    // Clean up on unmount
    return () => {
      clearInterval(activityRefreshInterval);
    };
  }, []);
  
  // Function to format date and time for display
  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      // Format as date with time
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} at ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}`;
    }
  };
  
  const quickActions = [
    { name: "Add New Project", path: "/admin/projects" },
    { name: "Create Blog Post", path: "/admin/blog" },
    { name: "Update Skills", path: "/admin/skills" },
    { name: "Add Experience", path: "/admin/experience" }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
          Dashboard Overview
        </h1>
        <p className="text-gray-400 mt-2">
          Welcome back, {session?.user?.name || "Admin"}
        </p>
      </motion.div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-t-cyan-500 border-r-cyan-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <motion.div
            className="rounded-lg bg-gray-800/50 border border-cyan-500/20 p-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Projects</p>
                <p className="text-3xl font-bold text-cyan-400">{stats.projectsCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-cyan-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="rounded-lg bg-gray-800/50 border border-purple-500/20 p-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Skills</p>
                <p className="text-3xl font-bold text-purple-400">{stats.skillsCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="rounded-lg bg-gray-800/50 border border-pink-500/20 p-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Blog Posts</p>
                <p className="text-3xl font-bold text-pink-400">{stats.blogPostsCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-pink-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="rounded-lg bg-gray-800/50 border border-green-500/20 p-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Experiences</p>
                <p className="text-3xl font-bold text-green-400">{stats.experiencesCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Activity */}
        <motion.div
          className="rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            {activitiesLoading ? (
              // Show loading skeletons for activities
              Array(4).fill(0).map((_, idx) => (
                <div key={idx} className="flex items-center p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-gray-700 mr-3"></div>
                  <div className="w-full">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : activities.length === 0 ? (
              <div className="text-center p-6 text-gray-400">No recent activities found</div>
            ) : (
              activities.map((activity, idx) => {
                // Define activity icon based on type
                let iconColor = "from-cyan-500 to-blue-500";
                if (activity.type === 'blog') iconColor = "from-pink-500 to-rose-500";
                if (activity.type === 'project') iconColor = "from-cyan-500 to-blue-500";
                if (activity.type === 'skill') iconColor = "from-purple-500 to-indigo-500";
                if (activity.type === 'experience') iconColor = "from-green-500 to-emerald-500";
                if (activity.type === 'contact') iconColor = "from-amber-500 to-yellow-500";
                
                return (
                  <div key={activity._id} className="flex items-center p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:border-cyan-500/30 transition-all">
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${iconColor} flex items-center justify-center text-white font-bold mr-3`}>
                      {activity.type.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-white">{activity.description}</p>
                        {activity.detailedTime && (
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded ml-2">
                            {activity.detailedTime}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400">{formatActivityTime(activity.timestamp)}</p>
                        {activity.user && (
                          <span className="text-xs text-gray-400">by {activity.user}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div
          className="rounded-xl border border-purple-500/30 bg-black/50 backdrop-blur-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <Link 
                key={idx} 
                href={action.path}
                className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-center">
                  <span className="text-white group-hover:text-purple-400 transition-colors">{action.name}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 ml-2 text-purple-400 transition-transform transform group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-lg font-medium text-white mb-2">Content Status</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Projects</span>
                  <span>{isLoading ? "Loading..." : `${stats.projectsCount}/10`}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{ width: isLoading ? "0%" : `${Math.min(stats.projectsCount / 10 * 100, 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Skills</span>
                  <span>{isLoading ? "Loading..." : `${stats.skillsCount}/20`}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: isLoading ? "0%" : `${Math.min(stats.skillsCount / 20 * 100, 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Blog Posts</span>
                  <span>{isLoading ? "Loading..." : `${stats.blogPostsCount}/15`}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full" style={{ width: isLoading ? "0%" : `${Math.min(stats.blogPostsCount / 15 * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* System Status */}
      <motion.div
        className="mt-8 rounded-xl border border-green-500/30 bg-black/50 backdrop-blur-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          System Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-green-400 font-medium">MongoDB Database</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Connected & Running</p>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-green-400 font-medium">Next.js API</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">All Routes Operational</p>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-green-400 font-medium">Authentication</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Active & Secured</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
