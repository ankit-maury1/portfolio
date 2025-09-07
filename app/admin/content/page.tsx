"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {  Pencil, Save, Settings, Type, Globe, Mail, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define TypeScript types
interface SiteSetting {
  _id?: string;
  key: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ContentSection {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'textarea' | 'email' | 'url';
  defaultValue?: string;
  category: 'hero' | 'about' | 'contact' | 'footer' | 'metadata';
}

export default function SiteContentManagement() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSetting, setCurrentSetting] = useState<Partial<SiteSetting>>({});
  const [newValue, setNewValue] = useState("");
  const [dbStatus, setDbStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Define content sections that can be edited
  const contentSections: ContentSection[] = [
    // Hero Section
    { key: 'hero_title', label: 'Hero Title', description: 'Main title on the homepage', type: 'text', category: 'hero' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', description: 'Subtitle text below the main title', type: 'text', category: 'hero' },
    { key: 'hero_description', label: 'Hero Description', description: 'Description text in the hero section', type: 'textarea', category: 'hero' },
    
    // About Section
    { key: 'about_title', label: 'About Title', description: 'Title for the about section', type: 'text', category: 'about' },
    { key: 'about_description', label: 'About Description', description: 'Main about text', type: 'textarea', category: 'about' },
    
    // Contact Information
    { key: 'contact_email', label: 'Contact Email', description: 'Your primary email address', type: 'email', category: 'contact' },
    { key: 'contact_location', label: 'Location', description: 'Your location/city', type: 'text', category: 'contact' },
    { key: 'contact_working_hours', label: 'Working Hours', description: 'Your working hours', type: 'text', category: 'contact' },
    
    // Social Links
    { key: 'social_github', label: 'GitHub URL', description: 'Link to your GitHub profile', type: 'url', category: 'contact' },
    { key: 'social_linkedin', label: 'LinkedIn URL', description: 'Link to your LinkedIn profile', type: 'url', category: 'contact' },
    { key: 'social_twitter', label: 'Twitter URL', description: 'Link to your Twitter profile', type: 'url', category: 'contact' },
    { key: 'social_instagram', label: 'Instagram URL', description: 'Link to your Instagram profile', type: 'url', category: 'contact' },
    
    // SEO/Metadata
    { key: 'site_title', label: 'Site Title', description: 'Title that appears in browser tab', type: 'text', category: 'metadata' },
    { key: 'site_description', label: 'Site Description', description: 'Meta description for SEO', type: 'textarea', category: 'metadata' },
    
    // Footer
    { key: 'footer_copyright', label: 'Footer Copyright', description: 'Copyright text in footer', type: 'text', category: 'footer' },
  ];

  // Initialize default settings for any missing values
  const initializeDefaultSettings = async () => {
    // Default values for settings that don't exist yet
    const defaultValues: Record<string, string> = {
      hero_title: 'Welcome to My Portfolio',
      hero_subtitle: 'Full Stack Developer',
      hero_description: 'I build modern web applications with Next.js, React, and MongoDB',
      about_title: 'About Me',
      about_description: 'I am a passionate developer with experience in building full-stack web applications.',
      contact_email: 'your.email@example.com',
      contact_location: 'New York, USA',
      contact_working_hours: 'Mon-Fri, 9AM-5PM',
      site_title: 'My Portfolio | Full Stack Developer',
      site_description: 'Portfolio website showcasing my projects, skills, and experience as a full stack developer',
      footer_copyright: `© ${new Date().getFullYear()} Portfolio. All rights reserved.`,
    };

    // For each default value, create it if it doesn't exist
    for (const [key, value] of Object.entries(defaultValues)) {
      if (!settings.some(s => s.key === key)) {
        try {
          await fetch('/api/site-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value })
          });
        } catch (error) {
          console.error(`Error initializing default setting ${key}:`, error);
        }
      }
    }
  };

  // Fetch all site settings
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/site-settings');
      if (!response.ok) {
        throw new Error('Failed to fetch site settings');
      }
      
      const data = await response.json();
      setSettings(data);
      
      // Initialize default settings after fetching current settings
      if (data.length === 0) {
        await initializeDefaultSettings();
        // Fetch again to get the initialized settings
        fetchSettings();
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch site settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check database connection status
  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/admin/database-status');
      if (!response.ok) {
        throw new Error('Failed to check database status');
      }
      
      const data = await response.json();
      setDbStatus({
        success: data.database.success,
        message: data.database.message
      });
      
      return data.database.success;
    } catch (error) {
      console.error('Error checking database status:', error);
      setDbStatus({
        success: false,
        message: 'Failed to connect to database. Check your MongoDB connection string.'
      });
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      // First check database connection
      const isDbConnected = await checkDatabaseStatus();
      
      // If database is connected, fetch settings
      if (isDbConnected) {
        fetchSettings();
      } else {
        setIsLoading(false);
        toast({
          title: "Database Connection Error",
          description: "Could not connect to MongoDB. Check your connection string in .env file.",
          variant: "destructive"
        });
      }
    };
    
    initialize();
  }, []);

  // Get setting value by key
  const getSettingValue = (key: string): string => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || '';
  };

  // Update a setting
  const updateSetting = async (key: string, value: string) => {
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, value })
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      const updatedSetting = await response.json();
      
      // Update local state
      setSettings(prev => {
        const existingIndex = prev.findIndex(s => s.key === key);
        if (existingIndex >= 0) {
          const newSettings = [...prev];
          newSettings[existingIndex] = updatedSetting;
          return newSettings;
        } else {
          return [...prev, updatedSetting];
        }
      });

      toast({
        title: "Success",
        description: "Setting updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      });
      return false;
    }
  };

  // Handle opening edit dialog
  const openEditDialog = (section: ContentSection) => {
    setCurrentSetting({ key: section.key });
    setNewValue(getSettingValue(section.key));
    setIsEditDialogOpen(true);
  };

  // Handle saving the current setting
  const handleSaveSetting = async () => {
    if (!currentSetting.key) return;
    
    const success = await updateSetting(currentSetting.key, newValue);
    if (success) {
      setIsEditDialogOpen(false);
      setCurrentSetting({});
      setNewValue("");
    }
  };

  // Group sections by category
  const groupedSections = contentSections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, ContentSection[]>);

  const categoryIcons = {
    hero: <Type className="h-5 w-5" />,
    about: <Globe className="h-5 w-5" />,
    contact: <Mail className="h-5 w-5" />,
    footer: <Settings className="h-5 w-5" />,
    metadata: <Settings className="h-5 w-5" />
  };

  const categoryColors = {
    hero: 'bg-cyan-800/30 text-cyan-400 border-cyan-500/30',
    about: 'bg-purple-800/30 text-purple-400 border-purple-500/30',
    contact: 'bg-green-800/30 text-green-400 border-green-500/30',
    footer: 'bg-orange-800/30 text-orange-400 border-orange-500/30',
    metadata: 'bg-blue-800/30 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="container mx-auto p-6">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
            Site Content Management
          </h1>
          {dbStatus && (
            <div className={`mt-2 px-3 py-1 rounded-md inline-flex items-center text-sm ${
              dbStatus.success ? 'bg-green-950/50 text-green-400' : 'bg-red-950/50 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${dbStatus.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>{dbStatus.success ? 'Database connected' : 'Database connection error'}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={checkDatabaseStatus}
            variant="outline"
            className="border-blue-500/30 hover:bg-blue-950/30"
          >
            Check DB
          </Button>
          <Button
            onClick={fetchSettings}
            variant="outline"
            className="border-cyan-500/30 hover:bg-cyan-950/30"
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-cyan-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-cyan-400">Loading site settings...</p>
        </div>
      ) : dbStatus && !dbStatus.success ? (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 my-8">
          <h2 className="text-xl text-red-400 font-bold mb-3">Database Connection Error</h2>
          <p className="mb-3 text-gray-300">{dbStatus.message}</p>
          <div className="bg-black/30 p-4 rounded-md mb-4">
            <h3 className="text-white font-medium mb-2">Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-2">
              <li>Verify your MongoDB connection string in the <code className="bg-gray-800 px-1 rounded">.env</code> file</li>
              <li>Make sure your MongoDB instance is running</li>
              <li>Check network connectivity to your MongoDB server</li>
              <li>Ensure your IP address is whitelisted in MongoDB Atlas (if using Atlas)</li>
            </ol>
          </div>
          <Button 
            onClick={checkDatabaseStatus}
            className="bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="metadata">SEO</TabsTrigger>
          </TabsList>

          {Object.entries(groupedSections).map(([category, sections]) => (
            <TabsContent key={category} value={category}>
              <motion.div
                className="grid gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {sections.map((section) => (
                  <div
                    key={section.key}
                    className={`rounded-xl border p-4 ${categoryColors[section.category as keyof typeof categoryColors]}`}
                  >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        {categoryIcons[section.category as keyof typeof categoryIcons]}
                        <h3 className="text-lg font-semibold ml-2">{section.label}</h3>
                      </div>
                      <p className="text-sm opacity-75 mb-2">{section.description}</p>
                      
                      <div className="bg-black/30 rounded p-3">
                        <p className="text-sm text-gray-300">Current value:</p>
                        <p className="text-white">
                          {getSettingValue(section.key) || <span className="italic text-gray-500">Not set</span>}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(section)}
                      className="hover:bg-black/30"
                    >
                      <Pencil size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </motion.div>
          </TabsContent>
        ))}
        </Tabs>
      )}

      {/* Edit Setting Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-gray-950 border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Content</DialogTitle>
            <DialogDescription>
              Update the content for {contentSections.find(s => s.key === currentSetting.key)?.label}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {currentSetting.key && (
              <>
                <div>
                  <Label className="text-sm text-gray-400">
                    {contentSections.find(s => s.key === currentSetting.key)?.description}
                  </Label>
                </div>
                
                <div>
                  <Label htmlFor="new-value">New Value</Label>
                  {contentSections.find(s => s.key === currentSetting.key)?.type === 'textarea' ? (
                    <Textarea
                      id="new-value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Enter new value..."
                      rows={4}
                    />
                  ) : (
                    <Input
                      id="new-value"
                      type={contentSections.find(s => s.key === currentSetting.key)?.type || 'text'}
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Enter new value..."
                    />
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSetting}>
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
