"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

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

export default function AboutPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, amount: 0.3 });
  
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
            About Me
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-8">
              <div className="rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur-sm p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">My Journey</h2>
                {isLoadingProfile ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-t-cyan-500 border-r-cyan-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt={profile.name || "Profile"} 
                          className="w-20 h-20 rounded-full object-cover border-2 border-cyan-500 mr-4"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-800 to-cyan-600 flex items-center justify-center text-white text-xl font-bold mr-4">
                          {profile.name ? profile.name.charAt(0) : "A"}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-medium text-white">{profile.name || "Developer"}</h3>
                        <p className="text-cyan-400">{profile.role || "Full Stack Developer"}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4">
                      {profile.bio || "I'm a passionate full-stack developer with expertise in modern web technologies. My journey in tech began over 5 years ago, and since then, I've been dedicated to creating elegant solutions to complex problems."}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-gray-300">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Experience</span>
                          <p>{profile.yearOfExperience || "5+"} years</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Location</span>
                          <p>{profile.location || "Remote"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Email</span>
                          <p>{profile.email || "contact@example.com"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Website</span>
                          <p>{profile.website || "portfolio.dev"}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-black/50 backdrop-blur-sm p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">My Approach</h2>
                <p className="text-gray-300">
                  I approach each project with a focus on three core principles:
                </p>
                <ul className="list-disc list-inside text-gray-300 mt-2 space-y-2">
                  <li><span className="text-cyan-400 font-medium">User-Centered Design</span> - Creating intuitive and accessible interfaces that users love</li>
                  <li><span className="text-purple-400 font-medium">Technical Excellence</span> - Writing clean, efficient, and maintainable code</li>
                  <li><span className="text-blue-400 font-medium">Business Impact</span> - Focusing on solutions that drive real value</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="rounded-xl border border-blue-500/30 bg-black/50 backdrop-blur-sm p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">Tech Stack</h2>
                <p className="text-gray-300 mb-4">
                  My primary toolkit includes:
                </p>
                {isLoadingProfile ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                ) : profile.technologies ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.technologies.split(',').map((tech, index) => (
                      <span 
                        key={index}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          index % 4 === 0 ? 'bg-cyan-900/50 text-cyan-300' : 
                          index % 4 === 1 ? 'bg-purple-900/50 text-purple-300' : 
                          index % 4 === 2 ? 'bg-blue-900/50 text-blue-300' : 
                          'bg-pink-900/50 text-pink-300'
                        }`}
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gray-900/70 p-4">
                      <h3 className="text-lg font-medium text-cyan-400 mb-2">Frontend</h3>
                      <ul className="text-gray-300 space-y-1">
                        <li>React & Next.js</li>
                        <li>TypeScript</li>
                        <li>Tailwind CSS</li>
                        <li>Framer Motion</li>
                      </ul>
                    </div>
                    <div className="rounded-lg bg-gray-900/70 p-4">
                      <h3 className="text-lg font-medium text-purple-400 mb-2">Backend</h3>
                      <ul className="text-gray-300 space-y-1">
                        <li>Node.js</li>
                        <li>Express</li>
                        <li>MongoDB</li>
                        <li>PostgreSQL</li>
                      </ul>
                    </div>
                    <div className="rounded-lg bg-gray-900/70 p-4">
                      <h3 className="text-lg font-medium text-blue-400 mb-2">Tools</h3>
                      <ul className="text-gray-300 space-y-1">
                        <li>Git & GitHub</li>
                        <li>Docker</li>
                        <li>VS Code</li>
                        <li>Figma</li>
                      </ul>
                    </div>
                    <div className="rounded-lg bg-gray-900/70 p-4">
                      <h3 className="text-lg font-medium text-pink-400 mb-2">Other</h3>
                      <ul className="text-gray-300 space-y-1">
                        <li>CI/CD</li>
                        <li>Serverless</li>
                        <li>AWS & Vercel</li>
                        <li>Testing (Jest, Cypress)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-pink-500/30 bg-black/50 backdrop-blur-sm p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">When I'm Not Coding</h2>
                <p className="text-gray-300 mb-4">
                  Outside of tech, I enjoy a variety of activities that help me stay creative and refreshed:
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>📚 Reading books on technology, design, and science fiction</li>
                  <li>🎮 Gaming - both for fun and to stay current with UI/UX trends</li>
                  <li>🏃‍♂️ Running and hiking to stay active</li>
                  <li>🎧 Listening to tech podcasts and music</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-16 rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-semibold mb-6 text-white text-center">Let's Connect</h2>
            <p className="text-gray-300 text-center mb-6">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>
            <div className="flex justify-center">
              <a 
                href="/contact" 
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-medium hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:-translate-y-1"
              >
                Get In Touch
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
