// components/site-footer.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { Github, Linkedin, Mail, Twitter, ExternalLink, MapPin, Phone } from "lucide-react"

export function SiteFooter() {
  const [profile, setProfile] = React.useState({
    name: '',
    bio: '',
    email: '',
    location: '',
    phone: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    logo: '',
    copyright: ''
  })
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Fetch profile data from site settings
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/site-settings')
        if (!response.ok) throw new Error('Failed to fetch site settings')
        
        const settings = await response.json()
        const profileData: any = {}
        
        settings.forEach((setting: any) => {
          if (setting.key === 'profile_name') profileData.name = setting.value
          if (setting.key === 'profile_bio') profileData.bio = setting.value
          if (setting.key === 'profile_email') profileData.email = setting.value
          if (setting.key === 'profile_location') profileData.location = setting.value
          if (setting.key === 'profile_phone') profileData.phone = setting.value
          if (setting.key === 'profile_website') profileData.website = setting.value
          if (setting.key === 'profile_github') profileData.github = setting.value
          if (setting.key === 'profile_linkedin') profileData.linkedin = setting.value
          if (setting.key === 'profile_twitter') profileData.twitter = setting.value
          if (setting.key === 'site_logo') profileData.logo = setting.value
          if (setting.key === 'site_copyright') profileData.copyright = setting.value
        })
        
        setProfile(profileData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching profile data:', error)
        setIsLoading(false)
      }
    }
    
    fetchProfile()
  }, [])
  return (
    <footer className="border-t py-12 mt-auto glass-dark">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Link 
            href="/"
            className="font-orbitron text-xl font-bold text-primary neon-text"
          >
            {profile.logo ? (
              <img 
                src={profile.logo} 
                alt="Logo" 
                className="h-8 w-auto" 
              />
            ) : (
              <span>{profile.name ? `<${profile.name} />` : "<Portfolio />"}</span>
            )}
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            {profile.bio || "A futuristic portfolio website showcasing skills, projects, and professional achievements."}
          </p>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium text-primary">Navigation</h3>
          <nav className="flex flex-col space-y-2">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link href="/skills" className="text-sm text-muted-foreground hover:text-primary transition-colors">Skills</Link>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">Projects</Link>
            <Link href="/experience" className="text-sm text-muted-foreground hover:text-primary transition-colors">Experience</Link>
            <Link href="/education" className="text-sm text-muted-foreground hover:text-primary transition-colors">Education</Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
          </nav>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium text-primary">Contact</h3>
          <nav className="flex flex-col space-y-2">
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Mail className="h-4 w-4" /> Contact Form
            </Link>
            {profile.email && (
              <Link 
                href={`mailto:${profile.email}`} 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Mail className="h-4 w-4" /> {profile.email}
              </Link>
            )}
            {profile.location && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {profile.location}
              </div>
            )}
            {profile.phone && (
              <Link 
                href={`tel:${profile.phone}`} 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Phone className="h-4 w-4" /> {profile.phone}
              </Link>
            )}
          </nav>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium text-primary">Social</h3>
          <div className="flex flex-wrap items-center gap-4">
            {profile.github && (
              <Link 
                href={profile.github} 
                target="_blank" 
                rel="noreferrer" 
                className="text-muted-foreground hover:text-primary hover:animate-glow flex items-center gap-2"
              >
                <Github className="h-5 w-5" />
                <span className="text-sm">GitHub</span>
              </Link>
            )}
            
            {profile.twitter && (
              <Link 
                href={profile.twitter} 
                target="_blank" 
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary hover:animate-glow flex items-center gap-2"
              >
                <Twitter className="h-5 w-5" />
                <span className="text-sm">Twitter</span>
              </Link>
            )}
            
            {profile.linkedin && (
              <Link 
                href={profile.linkedin} 
                target="_blank" 
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary hover:animate-glow flex items-center gap-2"
              >
                <Linkedin className="h-5 w-5" />
                <span className="text-sm">LinkedIn</span>
              </Link>
            )}
            
            {profile.website && (
              <Link 
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary hover:animate-glow flex items-center gap-2"
              >
                <ExternalLink className="h-5 w-5" />
                <span className="text-sm">Website</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mt-8 border-t border-gray-800 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {profile.copyright || `${profile.name || 'Portfolio'}. All rights reserved.`}
          </p>
          
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
