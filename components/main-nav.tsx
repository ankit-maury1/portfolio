// components/main-nav.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"

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
    label: "Education",
    href: "/education",
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

export function MainNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="flex gap-4">
        {routes.map((route) => (
          <NavigationMenuItem key={route.href}>
            <NavigationMenuLink asChild>
              <Link href={route.href}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "h-9 px-4 py-2 text-sm font-medium transition-all hover:text-primary hover:animate-neon-pulse",
                  pathname === route.href 
                    ? "text-primary neon-text" 
                    : "text-muted-foreground"
                )}
              >
                {route.label}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        
        {/* Admin link - only shown when user is authenticated and has admin role */}
        {session?.user?.role === "ADMIN" && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/admin"
                className={cn(
                  navigationMenuTriggerStyle(),
                  "h-9 px-4 py-2 text-sm font-bold transition-all bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent",
                  pathname.startsWith('/admin') && "animate-pulse"
                )}
              >
                Admin
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
