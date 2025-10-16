"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Save, User, Mail, Link2, MapPin, Calendar, Briefcase } from "lucide-react";
import { useProfileData, invalidateProfileCache, ProfileData as ProfileDataType } from "@/lib/client/profile-data";

interface ProfileData {
  name: string;
  bio: string;
  role: string;
  email: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  twitter: string;
  yearOfExperience: string;
  avatar: string;
  projectsCompleted: string;
  happyClients: string;
  technologies: string;
  taglines: string[];
}

export default function AdminProfile() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<ProfileData>({
  name: "",
  bio: "",
  role: "",
  email: "",
  location: "",
  website: "",
  github: "",
  linkedin: "",
  twitter: "",
  yearOfExperience: "",
  avatar: "",
  projectsCompleted: "",
  happyClients: "",
  technologies: "",
  taglines: []
  });

  // Use the profile data hook for fetching
  const { profile: fetchedProfile, isLoading: isLoadingProfileData } = useProfileData(true);

  useEffect(() => {
    if (!isLoadingProfileData) {
      // Use the fetched profile data
      setProfileData({
        name: fetchedProfile.name || session?.user?.name || "",
        bio: fetchedProfile.bio || "Full Stack Developer with expertise in React, Next.js, and Node.js",
        role: fetchedProfile.role || "Full Stack Developer",
        email: fetchedProfile.email || session?.user?.email || "",
        location: fetchedProfile.location || "New York, USA",
        website: fetchedProfile.website || "https://portfolio.dev",
        github: fetchedProfile.github || "https://github.com",
        linkedin: fetchedProfile.linkedin || "https://linkedin.com/in/developer",
        twitter: fetchedProfile.twitter || "https://twitter.com/developer",
        yearOfExperience: fetchedProfile.yearOfExperience || "5",
        avatar: fetchedProfile.avatar || session?.user?.image || "",
        projectsCompleted: fetchedProfile.projectsCompleted || "0",
        happyClients: fetchedProfile.happyClients || "0",
        technologies: fetchedProfile.technologies || "",
        taglines: fetchedProfile.taglines || ["Building the future of the web"]
      });
      setIsLoading(false);
    }
  }, [fetchedProfile, isLoadingProfileData, session]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle tagline changes
  const handleTaglineChange = (index: number, value: string) => {
    const newTaglines = [...profileData.taglines];
    newTaglines[index] = value;
    setProfileData(prev => ({ ...prev, taglines: newTaglines }));
  };

  // Add new tagline
  const addTagline = () => {
    setProfileData(prev => ({ 
      ...prev, 
      taglines: [...prev.taglines, ""] 
    }));
  };

  // Remove tagline
  const removeTagline = (index: number) => {
    const newTaglines = [...profileData.taglines];
    newTaglines.splice(index, 1);
    setProfileData(prev => ({ ...prev, taglines: newTaglines }));
  };

  // Save profile data
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map profile data to individual settings
      const settingsToUpdate = [
        { key: 'profile_name', value: profileData.name },
        { key: 'profile_bio', value: profileData.bio },
        { key: 'profile_role', value: profileData.role },
        { key: 'profile_email', value: profileData.email },
        { key: 'profile_location', value: profileData.location },
        { key: 'profile_website', value: profileData.website },
        { key: 'profile_github', value: profileData.github },
        { key: 'profile_linkedin', value: profileData.linkedin },
        { key: 'profile_twitter', value: profileData.twitter },
        { key: 'profile_years_experience', value: profileData.yearOfExperience },
        { key: 'profile_avatar', value: profileData.avatar },
        { key: 'profile_projects_completed', value: profileData.projectsCompleted },
        { key: 'profile_happy_clients', value: profileData.happyClients },
        { key: 'profile_technologies', value: profileData.technologies }
      ];
      
      // Add taglines
      // First, get existing taglines
      const existingTaglines = await fetch('/api/site-settings').then(res => res.json())
        .then(settings => settings.filter((s: { key: string }) => s.key.startsWith('profile_tagline_')));
      
      // For existing taglines, we'll overwrite them with empty values 
      // (which will not be included in the new settings)
      for (const tagline of existingTaglines) {
        await fetch('/api/site-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: tagline.key, value: "" })
        });
      }
      
      // Then add the new taglines
      for (let i = 0; i < profileData.taglines.length; i++) {
        const taglineValue = profileData.taglines[i]?.trim();
        if (taglineValue) {
          settingsToUpdate.push({
            key: `profile_tagline_${i+1}`,
            value: taglineValue
          });
        }
      }
      
      // Update each setting
      for (const setting of settingsToUpdate) {
        await fetch('/api/site-settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(setting)
        });
      }
      // Log activity to activities collection so Recent Activity shows live data
      try {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'profile',
            title: `Updated profile: ${profileData.name || 'Profile'}`,
            description: 'Admin updated profile settings',
            action: 'update',
            details: 'Updated multiple profile settings including name, bio, social links, and stats',
            path: '/admin/profile'
          })
        });
      } catch (err) {
        // don't block save UX if activity logging fails
        console.error('Failed to log activity:', err);
      }
      
      // Invalidate the profile cache to ensure fresh data across all pages
      invalidateProfileCache();

      toast({
        title: "Success",
        description: "Profile updated successfully. All pages will show the updated data.",
      });
    } catch (error) {
      console.error('Error saving profile data:', error);
      toast({
        title: "Error",
        description: "Failed to save profile data",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
            Admin Profile
          </h1>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || isSaving}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-t-cyan-500 border-r-cyan-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Personal Info */}
            <div className="md:col-span-1">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-cyan-900/50 border-2 border-cyan-500/30 overflow-hidden flex items-center justify-center mb-4">
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt={profileData.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={40} className="text-cyan-500/70" />
                    )}
                  </div>
                  
                  <div className="space-y-4 w-full">
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Avatar URL</Label>
                      <Input
                        id="avatar"
                        name="avatar"
                        value={profileData.avatar}
                        onChange={handleChange}
                        placeholder="https://example.com/avatar.jpg"
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User size={14} className="inline mr-1" /> Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail size={14} className="inline mr-1" /> Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      <MapPin size={14} className="inline mr-1" /> Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      placeholder="New York, USA"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearOfExperience">
                      <Calendar size={14} className="inline mr-1" /> Years of Experience
                    </Label>
                    <Input
                      id="yearOfExperience"
                      name="yearOfExperience"
                      type="number"
                      value={profileData.yearOfExperience}
                      onChange={handleChange}
                      placeholder="5"
                      className="bg-gray-900 border-gray-700"
                    />
                    <Label htmlFor="projectsCompleted" className="mt-4">
                      Projects Completed
                    </Label>
                    <Input
                      id="projectsCompleted"
                      name="projectsCompleted"
                      type="number"
                      value={profileData.projectsCompleted}
                      onChange={handleChange}
                      placeholder="50"
                      className="bg-gray-900 border-gray-700"
                    />
                    <Label htmlFor="happyClients" className="mt-4">
                      Happy Clients
                    </Label>
                    <Input
                      id="happyClients"
                      name="happyClients"
                      type="number"
                      value={profileData.happyClients}
                      onChange={handleChange}
                      placeholder="20"
                      className="bg-gray-900 border-gray-700"
                    />
                    <Label htmlFor="technologies" className="mt-4">
                      Technologies (comma separated)
                    </Label>
                    <Input
                      id="technologies"
                      name="technologies"
                      type="text"
                      value={profileData.technologies}
                      onChange={handleChange}
                      placeholder="React, Next.js, TypeScript, Node.js"
                      className="bg-gray-900 border-gray-700"
                    />
                    <p className="text-xs text-gray-400">
                      Enter a comma separated list of technologies. These will appear as colored badges on the About page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Middle/Right Column - Professional Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                  Professional Information
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">
                      <Briefcase size={14} className="inline mr-1" /> Professional Title
                    </Label>
                    <Input
                      id="role"
                      name="role"
                      value={profileData.role}
                      onChange={handleChange}
                      placeholder="Full Stack Developer"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      className="bg-gray-900 border-gray-700 min-h-[150px]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-cyan-400">
                    Hero Taglines
                  </h2>
                  <Button 
                    onClick={addTagline}
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    Add Tagline
                  </Button>
                </div>
                
                <p className="text-sm text-gray-400 mb-4">
                  These taglines will be displayed randomly in the hero section with a typing animation.
                  Add multiple taglines to create a dynamic hero section.
                </p>
                
                <div className="space-y-4">
                  {profileData.taglines.map((tagline, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={tagline}
                        onChange={(e) => handleTaglineChange(index, e.target.value)}
                        placeholder="Enter a catchy tagline"
                        className="bg-gray-900 border-gray-700 flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeTagline(index)}
                        disabled={profileData.taglines.length <= 1}
                        title="Remove Tagline"
                        className="flex-shrink-0"
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-purple-400 mb-4">
                  Social Links
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">
                      <Link2 size={14} className="inline mr-1" /> Personal Website
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      value={profileData.website}
                      onChange={handleChange}
                      placeholder="https://johndoe.dev"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      name="github"
                      value={profileData.github}
                      onChange={handleChange}
                      placeholder="https://github.com/johndoe"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={profileData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/johndoe"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={profileData.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/johndoe"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
