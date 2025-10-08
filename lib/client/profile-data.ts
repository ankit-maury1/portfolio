'use client';

import { useState, useEffect } from 'react';
import type { SiteSetting } from '@/lib/site-settings';

// Interface for profile data
export interface ProfileData {
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
  taglines?: string[];
}

// Default values for profile data
const defaultProfile: ProfileData = {
  name: '',
  bio: '',
  role: 'Full Stack Developer',
  email: '',
  location: '',
  website: '',
  github: '',
  linkedin: '',
  twitter: '',
  yearOfExperience: '0',
  avatar: '',
  projectsCompleted: '0',
  happyClients: '0',
  technologies: '',
  taglines: ['Building the future of the web']
};

// Cache timestamp to track freshness
let lastFetchTime = 0;
let cachedProfile: ProfileData | null = null;
const CACHE_TTL = 60000; // 1 minute in milliseconds

/**
 * Hook to get profile data with caching and auto-refresh
 * @param forceRefresh Force a refresh from server even if cache exists
 * @returns Profile data and loading state
 */
export function useProfileData(forceRefresh = false) {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const now = Date.now();
        const shouldRefresh = forceRefresh || !cachedProfile || (now - lastFetchTime > CACHE_TTL);
        
        if (shouldRefresh) {
          // Add cache busting parameter to avoid browser caching
          const response = await fetch(`/api/site-settings?_t=${now}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch profile data');
          }
          
          const settings = await response.json() as SiteSetting[];

          // Map settings to profile data
          const profileData: Partial<ProfileData> = { ...defaultProfile };
          const taglines: string[] = [];

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
            if (setting.key.startsWith('profile_tagline_')) {
              taglines.push(setting.value);
            }
          });
          
          // Use default tagline if none found
          if (taglines.length === 0) {
            taglines.push("Building the future of the web");
          }
          
          profileData.taglines = taglines;
          
          // Update cache
          cachedProfile = profileData as ProfileData;
          lastFetchTime = now;
          
          setProfile(profileData as ProfileData);
        } else {
          // Use cached data
          setProfile(cachedProfile as ProfileData);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
        
        // If we have cached data, use it despite the error
        if (cachedProfile) {
          setProfile(cachedProfile);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [forceRefresh]);
  
  return { profile, isLoading, error };
}

/**
 * Manually invalidate the profile data cache
 * Call this function after updating profile settings
 */
export function invalidateProfileCache() {
  lastFetchTime = 0;
  cachedProfile = null;
}
