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

// Types
interface Skill {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  featured: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
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
  
  // Fetch skills and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch skills
        const skillsResponse = await fetch('/api/skills');
        if (!skillsResponse.ok) {
          throw new Error('Failed to fetch skills');
        }
        const skillsData = await skillsResponse.json();
        setSkills(skillsData);

        // Derive categories directly from skills to ensure filters match available skills
        const derivedMap = new Map<string, SkillCategory>();
        for (const s of skillsData) {
          if (s.category && s.category.id && s.category.name) {
            const id = String(s.category.id).trim();
            const name = String(s.category.name).trim();
            if (name) {
              // prefer first occurrence
              if (!derivedMap.has(id)) {
                derivedMap.set(id, { id, name, icon: s.category.icon });
              }
            }
          }
        }

        const derivedCategories = Array.from(derivedMap.values());

        setCategories(derivedCategories);

        // Default to 'All Skills' (null) so users see everything initially
        setActiveCategory(null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter skills by active category
  const filteredSkills = activeCategory
    ? skills.filter(skill => skill.category && skill.category.id === activeCategory)
    : skills;
  
  // Proficiency removed per requirements
  
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
          <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            My Skills
          </h1>
          
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
            <>
              {/* Category Tabs */}
              <div className="flex flex-wrap justify-center mb-12 gap-2">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all 
                  ${!activeCategory 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  onClick={() => setActiveCategory(null)}
                >
                  All Skills
                </button>
                
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all 
                    ${activeCategory === category.id 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                  </button>
                ))}
              </div>
              
              {/* Skills Grid */}
              {filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSkills.map(skill => (
                    <div 
                      key={skill.id} 
                      className="rounded-xl border border-purple-500/30 bg-black/50 backdrop-blur-sm p-6 hover:border-purple-500 transition-all duration-300"
                    >
                      <div className="flex items-center mb-4">
                        {skill.icon && (
                          <span className="text-3xl mr-3">{skill.icon}</span>
                        )}
                        <h3 className="text-xl font-semibold text-white">{skill.name}</h3>
                      </div>
                      
                      {/* Proficiency bar removed */}
                      
                      {skill.category && (
                        <div className="text-sm text-gray-400">
                          Category: <span className="text-purple-400">{skill.category.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400">No skills found in this category.</p>
                </div>
              )}
            </>
          )}
          
          <div className="mt-16 rounded-xl border border-purple-500/30 bg-black/50 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white text-center">My Learning Journey</h2>
            <p className="text-gray-300 text-center mb-6">
              Technology is always evolving, and so are my skills. I&apos;m constantly learning and exploring new technologies to stay ahead of the curve.
            </p>
            <div className="flex justify-center">
              <a 
                href="/projects" 
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:-translate-y-1"
              >
                See My Projects
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
