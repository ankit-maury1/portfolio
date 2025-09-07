"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useProfileData } from "@/lib/client/profile-data";
import Link from "next/link";

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

// Animation variants for project cards
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
    }
  }
};

// Types
interface Project {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  featured: boolean;
  liveUrl?: string;
  githubUrl?: string;
  skills?: {
    id: string;
    name: string;
  }[];
  status?: string;
  category?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Use the shared profile data hook that handles global updates
  const { profile } = useProfileData();
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, amount: 0.1 });
  
  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Filter projects based on selected filter
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'featured') return project.featured;
    return project.category === filter || project.status === filter;
  });
  
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
          <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
            My Projects
          </h1>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center mb-12 gap-2">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all 
              ${filter === 'all' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setFilter('all')}
            >
              All Projects
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all 
              ${filter === 'featured' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setFilter('featured')}
            >
              Featured
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all 
              ${filter === 'web' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setFilter('web')}
            >
              Web
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all 
              ${filter === 'mobile' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setFilter('mobile')}
            >
              Mobile
            </button>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <motion.div 
                    key={project.id}
                    className="rounded-xl overflow-hidden border border-cyan-500/30 bg-black/50 backdrop-blur-sm group hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1"
                    variants={cardVariants}
                    initial="hidden"
                    animate={sectionInView ? "visible" : "hidden"}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-900 to-purple-900 relative overflow-hidden">
                      {project.coverImage ? (
                        <img 
                          src={project.coverImage} 
                          alt={project.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-50 text-xl">
                          Project Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        {project.liveUrl && (
                          <a 
                            href={project.liveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-cyan-500 rounded-full text-sm font-medium mx-2 hover:bg-cyan-600 transition-colors"
                          >
                            Live Demo
                          </a>
                        )}
                        {project.githubUrl && (
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-800 rounded-full text-sm font-medium mx-2 hover:bg-gray-700 transition-colors"
                          >
                            GitHub
                          </a>
                        )}
                      </div>
                      {project.featured && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-white">{project.title}</h3>
                      <p className="text-gray-400 mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills && project.skills.slice(0, 3).map((skill) => (
                          <span 
                            key={skill.id} 
                            className="text-xs px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {project.skills && project.skills.length > 3 && (
                          <span className="text-xs px-3 py-1 bg-gray-800 text-gray-400 rounded-full">
                            +{project.skills.length - 3}
                          </span>
                        )}
                      </div>
                      {project.status && (
                        <div className="flex justify-between items-center">
                          <span 
                            className={`text-xs px-3 py-1 rounded-full ${
                              project.status === 'completed' ? 'bg-green-900/50 text-green-400' : 
                              project.status === 'in-progress' ? 'bg-amber-900/50 text-amber-400' : 
                              'bg-blue-900/50 text-blue-400'
                            }`}
                          >
                            {project.status === 'completed' ? 'Completed' : 
                             project.status === 'in-progress' ? 'In Progress' : 
                             'Planned'}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-400">No projects found with the selected filter.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-16 rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white text-center">Interested in working together?</h2>
            <p className="text-gray-300 text-center mb-6">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>
            <div className="flex justify-center">
              <Link 
                href="/contact" 
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-medium hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:-translate-y-1"
              >
                Let's Talk
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
