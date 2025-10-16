"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from 'date-fns';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// @ts-expect-error - no type declarations available for 'react-syntax-highlighter'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-expect-error - no type declarations available for 'react-syntax-highlighter' styles
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from "framer-motion";

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

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const slug = params?.slug as string;

  console.log("Blog post slug:", slug);
  
  // Fetch the blog post by slug
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the new consolidated API route
        const response = await fetch(`/api/blog/${slug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }
        
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Unable to load blog post. It may not exist or there was a server error.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogPost();
  }, [slug]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-700 rounded w-3/4 mb-8"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded mb-2 w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded mb-8 w-4/5"></div>
            <div className="h-96 bg-gray-800 rounded-lg mb-8"></div>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded mb-2 w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="mb-8 text-gray-400">{error || "The requested blog post could not be found."}</p>
          <Link 
            href="/blog" 
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <article className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            href="/blog"
            className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 mb-8"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{post.title}</h1>
          
          <div className="flex items-center text-sm text-gray-400 mb-6">
            <span>{formatDate(post.publishedAt)}</span>
            <span className="mx-2">•</span>
            <span>5 min read</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, i) => (
              <Link 
                href={`/blog?tag=${tag}`}
                key={i} 
                className="text-xs px-3 py-1 bg-indigo-900/50 text-indigo-400 rounded-full hover:bg-indigo-800/50 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
          
          {post.coverImage && (
            <div className="rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-indigo-900 to-purple-900">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          <div className="prose prose-invert prose-indigo max-w-none">
              <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md my-6"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </motion.div>
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="text-xl font-semibold mb-6">Share this post</h3>
          <div className="flex space-x-4">
            <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 5.92l-3.37-.93-1.98 3-2.08-4.37C13.57 1.29 11.36 0 8.94 0 4.77 0 1.36 3.32 1.36 7.4c0 1.9.74 3.68 2.08 5.04L0 20.99l9.08-3.01c.4.09.82.14 1.24.14 4.15 0 7.54-3.32 7.54-7.4 0-2.24-1.06-4.34-2.82-5.71L22 5.92z" />
              </svg>
            </button>
            <button className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </button>
            <button className="p-2 bg-blue-800 hover:bg-blue-900 rounded-full">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}
