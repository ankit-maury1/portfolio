"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import type { SiteSetting } from '@/lib/site-settings';

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

// Form input types
interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Initial form state
const initialFormValues: ContactFormValues = {
  name: "",
  email: "",
  subject: "",
  message: ""
};

export default function ContactPage() {
  const [formValues, setFormValues] = useState<ContactFormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<Partial<ContactFormValues>>({});
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, amount: 0.1 });
  
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
    
    fetchProfile();
  }, []);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof ContactFormValues]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors: Partial<ContactFormValues> = {};
    
    if (!formValues.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formValues.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formValues.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!formValues.subject.trim()) {
      errors.subject = "Subject is required";
    }
    
    if (!formValues.message.trim()) {
      errors.message = "Message is required";
    } else if (formValues.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    }
    
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Submit form
    setFormStatus('submitting');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      setFormStatus('success');
      setFormValues(initialFormValues);
      
      // Reset form status after 5 seconds
      setTimeout(() => {
        setFormStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setFormStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setFormStatus('idle');
      }, 5000);
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            Contact Me
          </h1>
          <p className="text-gray-300 text-center mb-16 max-w-2xl mx-auto">
            Feel free to reach out with any questions, project inquiries, or just to say hello. 
            I'm always open to discussing new opportunities and ideas.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <motion.div
              className="rounded-xl border border-indigo-500/30 bg-black/50 backdrop-blur-sm p-6 md:p-8"
              initial={{ opacity: 0, x: -20 }}
              animate={sectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold mb-6 text-white">Send a Message</h2>
              
              {formStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 rounded-lg text-green-400">
                  <p>Thank you for your message! I'll get back to you as soon as possible.</p>
                </div>
              )}
              
              {formStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-400">
                  <p>Something went wrong. Please try again later.</p>
                </div>
              )}
              
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formValues.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-gray-900 border ${
                        formErrors.name ? 'border-red-500' : 'border-gray-700'
                      } text-white focus:outline-none focus:border-indigo-500`}
                      placeholder="Your name"
                      disabled={formStatus === 'submitting'}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-gray-900 border ${
                        formErrors.email ? 'border-red-500' : 'border-gray-700'
                      } text-white focus:outline-none focus:border-indigo-500`}
                      placeholder="your.email@example.com"
                      disabled={formStatus === 'submitting'}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formValues.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-gray-900 border ${
                        formErrors.subject ? 'border-red-500' : 'border-gray-700'
                      } text-white focus:outline-none focus:border-indigo-500`}
                      placeholder="What is this about?"
                      disabled={formStatus === 'submitting'}
                    />
                    {formErrors.subject && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.subject}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formValues.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-gray-900 border ${
                        formErrors.message ? 'border-red-500' : 'border-gray-700'
                      } text-white focus:outline-none focus:border-indigo-500`}
                      placeholder="Your message..."
                      disabled={formStatus === 'submitting'}
                    />
                    {formErrors.message && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.message}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                      formStatus === 'submitting'
                        ? 'bg-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                    }`}
                  >
                    {formStatus === 'submitting' ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
            
            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={sectionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.4 }}
            >
              <div className="rounded-xl border border-indigo-500/30 bg-black/50 backdrop-blur-sm p-6 md:p-8">
                <h2 className="text-2xl font-semibold mb-6 text-white">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-200">Email</h3>
                      <p className="text-indigo-400 mt-1">{isLoadingProfile ? 'Loading...' : profile.email || 'ankit.maury@hotmail.com'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-200">Location</h3>
                      <p className="text-gray-400 mt-1">{isLoadingProfile ? 'Loading...' : profile.location || 'San Francisco, CA'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-200">Working Hours</h3>
                      <p className="text-gray-400 mt-1">Monday - Friday: 9AM - 5PM</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border border-indigo-500/30 bg-black/50 backdrop-blur-sm p-6 md:p-8">
                <h2 className="text-2xl font-semibold mb-6 text-white">Connect with me</h2>
                
                <div className="flex space-x-4">
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                  
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                    </svg>
                  </a>
                  
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Google Map or Location */}
          {/* <motion.div 
            className="mt-16 rounded-xl overflow-hidden h-80 bg-gray-800"
            initial={{ opacity: 0, y: 30 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-full h-full bg-indigo-900/30 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 mb-2">Map Placeholder</p>
                <p className="text-gray-200 font-medium">San Francisco, CA</p>
              </div>
            </div>
          </motion.div> */}
        </div>
      </motion.section>
    </main>
  );
}
