"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { SiteSetting } from '@/lib/site-settings';
import { HeroSection } from "@/components/three/HeroSection";

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

// Types for our data
interface Skill {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  proficiency: number;
  featured: boolean;
  category: {
    name: string;
  };
}

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
}

export default function Home() {

  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const aboutRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const aboutInView = useInView(aboutRef, { once: true, amount: 0.3 });
  const skillsInView = useInView(skillsRef, { once: true, amount: 0.3 });
  const projectsInView = useInView(projectsRef, { once: true, amount: 0.3 });
  const contactInView = useInView(contactRef, { once: true, amount: 0.3 });

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

  // Contact form state and handlers
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('submitting');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!response.ok) throw new Error('Failed to send message');
      setContactStatus('success');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setContactStatus('idle'), 4000);
    } catch {
      setContactStatus('error');
      setTimeout(() => setContactStatus('idle'), 4000);
    }
  };

  // Fetch profile, skills, and projects
  useEffect(() => {
    // Fetch profile data from site-settings
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await fetch('/api/site-settings');
        if (!response.ok) throw new Error('Failed to fetch profile data');
  const settings = await response.json() as SiteSetting[];
  // Map settings to profile data
  const profileData: Partial<Record<string, string>> = {};
  settings.forEach((setting: SiteSetting) => {
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
    // Fetch skills
    const fetchSkills = async () => {
      try {
        const response = await fetch('/api/skills');
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        const data = await response.json();
        setSkills(data);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setIsLoadingSkills(false);
      }
    };
    // Fetch projects
    const fetchProjects = async () => {
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
        setIsLoadingProjects(false);
      }
    };

    fetchProfile();
    fetchSkills();
    fetchProjects();
  }, []);

  // Function to get featured projects
  const getFeaturedProjects = () => {
    if (projects.length === 0) {
      return [];
    }
    // First get featured projects
    const featured = projects.filter(p => p.featured);
    // If we don't have enough featured projects, add more to make at least 3
    if (featured.length < 3) {
      const nonFeatured = projects.filter(p => !p.featured);
      return [...featured, ...nonFeatured].slice(0, 3);
    }
    return featured;
  };

  return (
    <main className="relative min-h-screen">
      {/* Hero Section with 3D Background */}
      <HeroSection />
      
      {/* About Section */}
      <motion.section
        ref={aboutRef}
        id="about"
        className="py-24 bg-gradient-to-b from-black to-gray-900"
        initial="hidden"
        animate={aboutInView ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
            About Me
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="rounded-xl overflow-hidden border border-cyan-500/30 bg-black/50 backdrop-blur-sm p-6">
              <h3 className="text-2xl font-semibold mb-4 text-white">{profile.name ? profile.name : "Who I Am"}</h3>
              <p className="text-gray-300 mb-4">
                {profile.bio
                  ? profile.bio
                  : "I'm a passionate developer with a love for creating beautiful, functional, and responsive web applications. With expertise in modern frontend and backend technologies, I build solutions that are not just visually appealing but also performant and scalable."}
              </p>
              <p className="text-gray-300">
                {profile.role
                  ? `Role: ${profile.role}`
                  : "When I'm not coding, you can find me exploring the latest tech trends, contributing to open source, or working on personal projects that push the boundaries of web development."}
              </p>
              {profile.location && (
                <p className="text-gray-400">Location: {profile.location}</p>
              )}
              {profile.email && (
                <p className="text-gray-400">Email: {profile.email}</p>
              )}
              {profile.website && (
                <p className="text-gray-400">Website: <a href={profile.website} target="_blank" rel="noopener noreferrer" className="underline">{profile.website}</a></p>
              )}
              {profile.github && (
                <p className="text-gray-400">GitHub: <a href={profile.github} target="_blank" rel="noopener noreferrer" className="underline">{profile.github}</a></p>
              )}
              {profile.linkedin && (
                <p className="text-gray-400">LinkedIn: <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="underline">{profile.linkedin}</a></p>
              )}
              {profile.twitter && (
                <p className="text-gray-400">Twitter: <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="underline">{profile.twitter}</a></p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-purple-500/30 bg-black/50 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
                <div className="text-5xl text-purple-500 mb-2">{profile.yearOfExperience ? profile.yearOfExperience + "+" : "5+"}</div>
                <div className="text-white text-center">Years Experience</div>
              </div>
              <div className="rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
                <div className="text-5xl text-cyan-500 mb-2">{profile.projectsCompleted ? profile.projectsCompleted + "+" : "50+"}</div>
                <div className="text-white text-center">Projects Completed</div>
              </div>
              <div className="rounded-xl border border-blue-500/30 bg-black/50 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
                <div className="text-5xl text-blue-500 mb-2">{profile.happyClients ? profile.happyClients + "+" : "20+"}</div>
                <div className="text-white text-center">Happy Clients</div>
              </div>
              <div className="rounded-xl border border-pink-500/30 bg-black/50 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
                <div className="text-5xl text-pink-500 mb-2">{profile.technologies ? profile.technologies + "+" : "10+"}</div>
                <div className="text-white text-center">Technologies</div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Skills Section */}
      <motion.section
        ref={skillsRef}
        id="skills"
        className="py-24 bg-gradient-to-b from-gray-900 to-black"
        initial="hidden"
        animate={skillsInView ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            My Skills
          </h2>
          {isLoadingSkills ? (
            <div className="flex justify-center items-center h-40">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {skills.length > 0 ? (
                skills
                  .filter(skill => skill.featured)
                  .map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur-sm p-6 hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="text-4xl mb-3">{skill.icon || '🔧'}</div>
                      <h3 className="text-xl font-semibold text-white">{skill.name}</h3>
                    </div>
                  ))
              ) : (
                // Fallback if no skills are found
                [
                  { name: "React", icon: "⚛️", color: "cyan" },
                  { name: "Next.js", icon: "▲", color: "white" },
                  { name: "TypeScript", icon: "TS", color: "blue" },
                  { name: "Node.js", icon: "🟢", color: "green" },
                  { name: "TailwindCSS", icon: "🌊", color: "cyan" },
                  { name: "Three.js", icon: "3D", color: "purple" },
                  { name: "Framer Motion", icon: "🔄", color: "purple" },
                  { name: "Prisma", icon: "□", color: "cyan" }
                ].map((skill, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur-sm p-6 hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="text-4xl mb-3">{skill.icon}</div>
                    <h3 className="text-xl font-semibold text-white">{skill.name}</h3>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.section>
      
      {/* Projects Section */}
      <motion.section
        ref={projectsRef}
        id="projects"
        className="py-24 bg-gradient-to-b from-black to-gray-900"
        initial="hidden"
        animate={projectsInView ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
            Featured Projects
          </h2>
          {isLoadingProjects ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-pulse flex space-x-4">
                <div className="h-20 w-20 bg-gray-700 rounded-lg"></div>
                <div className="space-y-4 flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getFeaturedProjects().length > 0 ? (
                getFeaturedProjects().map((project) => (
                  <div 
                    key={project.id}
                    className="rounded-xl overflow-hidden border border-cyan-500/30 bg-black/50 backdrop-blur-sm group hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1"
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
                            View Project
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
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-white">{project.title}</h3>
                      <p className="text-gray-400 mb-4">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
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
                    </div>
                  </div>
                ))
              ) : (
                // Fallback if no projects are found
                [1, 2, 3].map((project) => (
                  <div 
                    key={project}
                    className="rounded-xl overflow-hidden border border-cyan-500/30 bg-black/50 backdrop-blur-sm group hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-900 to-purple-900 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-50 text-xl">
                        Project Image
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button className="px-4 py-2 bg-cyan-500 rounded-full text-sm font-medium">
                          View Project
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-white">Project {project}</h3>
                      <p className="text-gray-400 mb-4">
                        A brief description of this awesome project and the technologies used to build it.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full">React</span>
                        <span className="text-xs px-3 py-1 bg-cyan-900/50 text-cyan-400 rounded-full">TypeScript</span>
                        <span className="text-xs px-3 py-1 bg-purple-900/50 text-purple-400 rounded-full">TailwindCSS</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.section>
      
      {/* Contact Section */}
      <motion.section
        ref={contactRef}
        id="contact"
        className="py-24 bg-gradient-to-b from-gray-900 to-black"
        initial="hidden"
        animate={contactInView ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            Get In Touch
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="rounded-xl overflow-hidden border border-purple-500/30 bg-black/50 backdrop-blur-sm p-6">
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Subject"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Your message"
                    required
                  ></textarea>
                </div>
                <div>
                  <button 
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg text-white font-medium"
                    disabled={contactStatus === 'submitting'}
                  >
                    {contactStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                  {contactStatus === 'success' && (
                    <div className="mt-2 text-green-400 text-sm">Message sent successfully!</div>
                  )}
                  {contactStatus === 'error' && (
                    <div className="mt-2 text-red-400 text-sm">Failed to send message. Please try again.</div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
