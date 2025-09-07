// components/site-header.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Github, Linkedin, Twitter, ExternalLink } from "lucide-react"

// Simple page view counter component built directly into the header
// to avoid importing server components in client components
function PageViewTrackerSimple() {
  const pathname = usePathname()
  const [viewCount, setViewCount] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  React.useEffect(() => {
    const fetchViewCount = async () => {
      setIsLoading(true)
      try {
        // Only fetch the current count for this page without incrementing
        try {
          const response = await fetch(`/api/page-views?path=${encodeURIComponent(pathname)}`)
          if (response.ok) {
            const data = await response.json()
            setViewCount(data.count || 0)
          }
        } catch (err) {
          console.error("Error fetching view count:", err)
        }
      } catch (error) {
        console.error("Error in view tracking:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Track the view only once when the component first mounts
    const trackPageView = async () => {
      try {
        await fetch('/api/page-views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname })
        })
      } catch (err) {
        console.error("Error posting page view:", err)
      }
    }
    
    // Track the view once on mount
    trackPageView()
    
    // Then fetch the current count
    fetchViewCount()
    
    // Setup an interval to refresh the view count every minute
    const intervalId = setInterval(fetchViewCount, 60000)
    
    return () => clearInterval(intervalId)
  }, [pathname])
  
  if (isLoading || viewCount === null) {
    return null
  }
  
  return (
    <div className="hidden md:block ml-2">
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center gap-1 bg-black/30 backdrop-blur-sm",
          viewCount > 100 ? "border-cyan-500/50" : 
          viewCount > 50 ? "border-blue-500/50" : "border-gray-500/50"
        )}
      >
        <Eye className="h-3 w-3 opacity-70" />
        <span className="text-xs">{viewCount.toLocaleString()}</span>
      </Badge>
    </div>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [profile, setProfile] = React.useState({
    name: '',
    logo: '',
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
  })
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Fetch profile data
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/site-settings')
        if (!response.ok) throw new Error('Failed to fetch site settings')
        
        const settings = await response.json()
        const profileData = {
          name: '',
          logo: '',
          github: '',
          linkedin: '',
          twitter: '',
          website: '',
        }
        
        settings.forEach((setting: any) => {
          if (setting.key === 'profile_name') profileData.name = setting.value
          if (setting.key === 'site_logo') profileData.logo = setting.value
          if (setting.key === 'profile_github') profileData.github = setting.value
          if (setting.key === 'profile_linkedin') profileData.linkedin = setting.value
          if (setting.key === 'profile_twitter') profileData.twitter = setting.value
          if (setting.key === 'profile_website') profileData.website = setting.value
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
  
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  const { data: session, status } = useSession()

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-sm",
      isScrolled ? "glass-dark py-2" : "bg-transparent py-4"
    )}>
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link 
            href="/"
            className={cn(
              "font-orbitron text-xl font-bold transition-all duration-300",
              isScrolled ? "text-primary neon-text" : "text-primary"
            )}
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
          <MainNav />
        </div>
        <div className="flex items-center gap-4">
          {/* Page view counter */}
          <div className="hidden md:flex items-center gap-3">
            <PageViewTrackerSimple />
          </div>
          
          <ThemeToggle />
          
          {/* Authentication controls */}
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hidden md:flex neon-border"
                >
                  {session.user.name || session.user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-900/95 backdrop-blur-sm border border-cyan-500/30">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-cyan-500/20" />
                {session.user.role === "ADMIN" && (
                  <DropdownMenuItem className="text-cyan-400 cursor-pointer">
                    <Link href="/admin" className="flex w-full">
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-red-400 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              asChild 
              size="sm"
              className="hidden md:flex bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          )}
          
          <MobileNav />
          {pathname !== "/contact" && (
            <Button 
              asChild 
              size="sm"
              className="hidden md:flex neon-border hover:animate-neon-pulse"
              variant="outline"
            >
              <Link href="/contact">Contact Me</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
