"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
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

// Animation variants for education items
const cardVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    }
  }
};

// Types
interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  current: boolean;
  logo?: string;
  order: number;
}

export default function EducationPage() {
  // Education state
  const [education, setEducation] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    role: '',
    email: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    yearOfExperience: '',
    avatar: '',
    projectsCompleted: '',
    happyClients: '',
    technologies: ''
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Refs for animations
  const sectionRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, amount: 0.1 });
  
  // Format date function
  const formatDate = (dateString: string | undefined, current: boolean) => {
    if (!dateString && !current) return "Present";
    if (current) return "Present";
    
    try {
      const date = new Date(dateString as string);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch (error) {
      return dateString;
    }
  };
  
  // Fetch education data
  useEffect(() => {
    const fetchEducation = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/education');
        if (!response.ok) throw new Error('Failed to fetch education data');
        
        const data = await response.json();
        setEducation(data);
      } catch (error) {
        console.error('Error fetching education data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEducation();
  }, []);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await fetch('/api/site-settings');
        if (!response.ok) throw new Error('Failed to fetch profile data');
        
        const settings = await response.json();
        // Map settings to profile data
        const profileData: any = {};
        settings.forEach((setting: any) => {
          if (setting.key === 'profile_name') profileData.name = setting.value;
          if (setting.key === 'profile_bio') profileData.bio = setting.value;
          if (setting.key === 'profile_role') profileData.role = setting.value;
          if (setting.key === 'profile_email') profileData.email = setting.value;
          if (setting.key === 'profile_location') profileData.location = setting.value;
          if (setting.key === 'profile_website') profileData.website = setting.value;
          if (setting.key === 'profile_github') profileData.github = setting.value;
          if (setting.key === 'profile_linkedin') profileData.linkedin = setting.value;
          if (setting.key === 'profile_twitter') profileData.twitter = setting.value;
          if (setting.key === 'profile_years_experience') profileData.yearOfExperience = setting.value;
          if (setting.key === 'profile_avatar') profileData.avatar = setting.value;
          if (setting.key === 'profile_projects_completed') profileData.projectsCompleted = setting.value;
          if (setting.key === 'profile_happy_clients') profileData.happyClients = setting.value;
          if (setting.key === 'profile_technologies') profileData.technologies = setting.value;
        });
        
        setProfile({
          name: profileData.name || '',
          bio: profileData.bio || '',
          role: profileData.role || '',
          email: profileData.email || '',
          location: profileData.location || '',
          website: profileData.website || '',
          github: profileData.github || '',
          linkedin: profileData.linkedin || '',
          twitter: profileData.twitter || '',
          yearOfExperience: profileData.yearOfExperience || '',
          avatar: profileData.avatar || '',
          projectsCompleted: profileData.projectsCompleted || '',
          happyClients: profileData.happyClients || '',
          technologies: profileData.technologies || ''
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, []);
  
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
          <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
            Education & Qualifications
          </h1>
          
          {/* Education Introduction */}
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <p className="text-xl text-gray-300">
              {!isLoadingProfile && profile.name ? 
                `${profile.name} has built a strong educational foundation to support ${profile.role || 'professional'} expertise.` : 
                'My educational journey has provided me with the knowledge and skills needed for success in the tech industry.'
              }
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="w-10 h-10 border-4 border-t-cyan-500 border-r-cyan-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          ) : education.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-2xl font-semibold text-gray-400">No education records found</h3>
              <p className="text-gray-500 mt-2">Education details will be added soon.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Education Timeline */}
              <div className="relative pl-8 md:pl-16">
                {/* Timeline Line */}
                <div className="absolute left-0 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 to-blue-500"></div>
                
                {education.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    className="mb-12 relative"
                    variants={cardVariants}
                    initial="hidden"
                    animate={sectionInView ? "visible" : "hidden"}
                    transition={{ delay: index * 0.2 }}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-0 md:left-8 transform -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                    
                    {/* Education Card */}
                    <div className="rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur-sm p-6 ml-4 md:ml-12">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-semibold text-white">{item.institution}</h3>
                          <p className="text-cyan-400 mt-1">{item.degree} {item.field && `• ${item.field}`}</p>
                        </div>
                        <div className="mt-2 md:mt-0 text-gray-400 text-sm md:text-right">
                          <span className="bg-cyan-900/50 px-3 py-1 rounded-full">
                            {formatDate(item.startDate, false)} - {formatDate(item.endDate, item.current)}
                          </span>
                        </div>
                      </div>
                      
                      {item.location && (
                        <div className="flex items-center mb-4 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.location}
                        </div>
                      )}
                      
                      {item.description && (
                        <p className="text-gray-300">{item.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Link href="/contact" className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:from-cyan-700 hover:to-blue-700 transition-all">
              Get in Touch
            </Link>
            <p className="mt-3 text-gray-400">
              Interested in discussing my qualifications? Let's connect.
            </p>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
