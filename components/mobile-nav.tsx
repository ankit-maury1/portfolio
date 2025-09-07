// components/mobile-nav.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Menu, Github, Linkedin, Twitter, ExternalLink } from "lucide-react"

const routes = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Skills",
    href: "/skills",
  },
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "Experience",
    href: "/experience",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Contact",
    href: "/contact",
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [profile, setProfile] = React.useState({
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
  })
  
  // Fetch profile data
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/site-settings')
        if (!response.ok) throw new Error('Failed to fetch site settings')
        
        const settings = await response.json()
        const profileData = {
          github: '',
          linkedin: '',
          twitter: '',
          website: '',
        }
        
        settings.forEach((setting: any) => {
          if (setting.key === 'profile_github') profileData.github = setting.value
          if (setting.key === 'profile_linkedin') profileData.linkedin = setting.value
          if (setting.key === 'profile_twitter') profileData.twitter = setting.value
          if (setting.key === 'profile_website') profileData.website = setting.value
        })
        
        setProfile(profileData)
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }
    
    fetchProfile()
  }, [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="glass-dark">
        <SheetHeader>
          <SheetTitle className="text-left text-primary">Navigation</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-4 py-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary px-2 py-2",
                pathname === route.href
                  ? "text-primary neon-text bg-cyan-950/30 rounded-md"
                  : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>
        
        <SheetFooter className="mt-auto border-t border-gray-800 pt-4">
          <div className="flex justify-center gap-6">
            {profile.github && (
              <Link 
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            )}
            
            {profile.linkedin && (
              <Link 
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            )}
            
            {profile.twitter && (
              <Link 
                href={profile.twitter}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            )}
            
            {profile.website && (
              <Link 
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
                <span className="sr-only">Website</span>
              </Link>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
