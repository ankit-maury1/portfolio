"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { format } from 'date-fns';

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
interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  logo?: string;
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, amount: 0.1 });
  
  // Fetch experiences
  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/experiences');
        if (!response.ok) {
          throw new Error('Failed to fetch experiences');
        }
        const data = await response.json();
        setExperiences(data);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExperiences();
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch (error) {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
            My Experience
          </h1>
          
          <div className="max-w-3xl mx-auto">
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
            ) : experiences.length > 0 ? (
              <div className="relative border-l border-gray-700 ml-4 md:ml-6 pl-6 md:pl-8">
                {experiences.map((experience, index) => (
                  <motion.div 
                    key={experience.id}
                    className="mb-12 last:mb-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={sectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    {/* Timeline dot */}
                    <div className="absolute w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full -left-2 md:-left-2.5 mt-1.5 border border-gray-900"></div>
                    
                    <div className="rounded-xl border border-emerald-500/30 bg-black/50 backdrop-blur-sm p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold text-white">{experience.title}</h2>
                          <h3 className="text-lg text-emerald-400">{experience.company}</h3>
                        </div>
                        <div className="mt-2 md:mt-0 text-sm text-gray-400 bg-gray-900/70 px-3 py-1 rounded-full">
                          {formatDate(experience.startDate)} - {experience.current ? 'Present' : formatDate(experience.endDate || '')}
                        </div>
                      </div>
                      
                      {experience.location && (
                        <div className="flex items-center mb-4 text-sm text-gray-400">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 mr-2 text-gray-500" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                          </svg>
                          {experience.location}
                        </div>
                      )}
                      
                      <div className="text-gray-300 prose prose-sm prose-invert max-w-none">
                        {experience.description.split('\\n').map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400">No experience data available.</p>
              </div>
            )}
          </div>
          
          <div className="mt-16 max-w-3xl mx-auto rounded-xl border border-emerald-500/30 bg-black/50 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white text-center">Education</h2>
            <p className="text-gray-300 text-center mb-6">
              Check out my educational background and certifications.
            </p>
            <div className="flex justify-center">
              <a 
                href="/education" 
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:-translate-y-1"
              >
                View Education
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
