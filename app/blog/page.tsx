"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { useSearchParams } from "next/navigation";

const NewsletterSignupClient = dynamic(() => import('@/components/newsletter-signup'), { ssr: false });

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: "easeInOut" as const
    }
  }
};

// Types
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
  tags: string[];
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, amount: 0.1 });
  
  // Handle URL parameters for tag filtering
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    console.log('URL tag param:', tagParam);
    console.log('Available tags:', tags.length, tags.map((t: any) => ({ name: t.name, slug: t.slug })));

    if (tagParam && tags.length > 0) {
      // Find the tag by name (case-insensitive), then by slug
      const tagByName = tags.find((tag: any) =>
        tag.name.toLowerCase().trim() === tagParam.toLowerCase().trim()
      );
      const tagBySlug = tags.find((tag: any) => tag.slug === tagParam);

      console.log('Tag by name:', tagByName);
      console.log('Tag by slug:', tagBySlug);

      const foundTag = tagByName || tagBySlug;
      if (foundTag) {
        console.log('Setting active tag to:', foundTag.slug);
        setActiveTag(foundTag.slug);
      } else {
        // If tag not found, reset to show all posts
        console.log('Tag not found, resetting to all posts');
        setActiveTag(null);
      }
    } else if (!tagParam) {
      setActiveTag(null);
    }
  }, [searchParams, tags]);

  // Fetch blog posts and tags
  useEffect(() => {
    // Track page view with detailed activity
    const trackActivity = async () => {
      try {
        // Import the client-side tracking function
        const { trackPageView } = await import('@/lib/client/activity-tracking');
        await trackPageView('/blog', 'Blog Posts');
      } catch (error) {
        console.error('Failed to track activity:', error);
      }
    };
    
    trackActivity();
    
    const fetchBlogData = async () => {
      setIsLoading(true);
      try {
        // Fetch posts
        const postsResponse = await fetch('/api/blog');
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const postsData = await postsResponse.json();
        setPosts(postsData);
        console.log('Loaded posts:', postsData.length, postsData.map((p: any) => ({ title: p.title, tags: p.tags })));
        
        // Fetch tags
        const tagsResponse = await fetch('/api/blog-tags');
        if (!tagsResponse.ok) {
          throw new Error('Failed to fetch blog tags');
        }
        const tagsData = await tagsResponse.json();
        setTags(tagsData);
        console.log('Loaded tags:', tagsData.length, tagsData.map((t: any) => ({ name: t.name, slug: t.slug })));
      } catch (error) {
        console.error('Error fetching blog data:', error);
        // Use empty arrays as fallback if there's an error
        if (posts.length === 0) setPosts([]);
        if (tags.length === 0) setTags([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogData();
  }, []);
  
  // Filter posts by active tag
  const filteredPosts = activeTag
    ? posts.filter(post => {
        console.log('Filtering post:', post.title, 'with activeTag:', activeTag);
        console.log('Post tags:', post.tags);

        // Find the tag object by slug to get the name
        const tagObj = tags.find(tag => tag.slug === activeTag);
        if (!tagObj) {
          console.log('Tag object not found for slug:', activeTag);
          console.log('Available tags:', tags.map(t => ({ slug: t.slug, name: t.name })));
          return false;
        }

        console.log('Found tag object:', tagObj);

        // Check if post has this tag (case-insensitive comparison)
        const hasTag = post.tags.some(postTag =>
          postTag.toLowerCase().trim() === tagObj.name.toLowerCase().trim()
        );

        if (!hasTag) {
          console.log('Post', post.title, 'does not have tag', tagObj.name, 'Tags:', post.tags);
        } else {
          console.log('Post', post.title, 'HAS tag', tagObj.name);
        }

        return hasTag;
      })
    : posts;

  console.log('Final filtered posts count:', filteredPosts.length, 'from', posts.length, 'total posts');
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };
  
  return (
    <main className="relative min-h-screen pt-16 pb-24">
      <motion.section
        ref={sectionRef}
        className="py-16 bg-gradient-to-b from-black to-gray-900"
        initial="hidden"
        animate={sectionInView ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            Blog
          </h1>
          
          {/* Tag Filters */}
          <div className="flex flex-wrap justify-center mb-12 gap-2">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all 
              ${!activeTag 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => {
                console.log('All Posts button clicked, setting activeTag to null');
                setActiveTag(null);
              }}
            >
              All Posts
            </button>
            
            {tags.map(tag => (
              <button
                key={tag.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all 
                ${activeTag === tag.slug 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                onClick={() => {
                  console.log('Tag button clicked:', tag.name, 'slug:', tag.slug);
                  setActiveTag(tag.slug);
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-pulse flex space-x-4">
                <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
                <div className="space-y-4 flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div 
                  key={post.id}
                  className="rounded-xl overflow-hidden border border-indigo-500/30 bg-black/50 backdrop-blur-sm group hover:border-indigo-500 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="h-48 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-50 text-xl">
                        Blog Image
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-xs text-gray-400 mb-3">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span className="mx-2">•</span>
                      <span>5 min read</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-indigo-400 transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <span 
                          key={i} 
                          className="text-xs px-3 py-1 bg-indigo-900/50 text-indigo-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center"
                      prefetch={false}
                    >
                      Read more
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 ml-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400">No blog posts found with the selected tag.</p>
            </div>
          )}
          
          <div className="mt-16 rounded-xl border border-indigo-500/30 bg-black/50 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white text-center">Subscribe to my newsletter</h2>
            <p className="text-gray-300 text-center mb-6">
              Get notified when I publish new articles and tutorials.
            </p>
            <div>
              {/* client-side newsletter signup component */}
              <NewsletterSignupClient />
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
