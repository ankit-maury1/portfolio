"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Rocket,
  Code,
  Briefcase,
  GraduationCap,
  Pen,
  Mail,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Set active tab based on pathname
  const getActiveTab = (path: string) => {
    if (path.includes("/blog")) return "blog";
    if (path.includes("/projects")) return "projects";
    if (path.includes("/skills")) return "skills";
    if (path.includes("/experience")) return "experience";
    if (path.includes("/education")) return "education";
    if (path.includes("/contact")) return "contact";
    if (path.includes("/profile")) return "profile";
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab(pathname || ""));

  // Update active tab when pathname changes
  useEffect(() => {
    setActiveTab(getActiveTab(pathname || ""));
  }, [pathname]);

  // Handle theme toggle after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle unauthorized access
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Protect route for admin only
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-card border border-destructive/20">
          <h1 className="text-2xl font-bold text-destructive mb-3">
            Access Denied
          </h1>
          <p className="text-card-foreground mb-4">
            You do not have permission to access this area.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-md"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Define navigation tabs
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/admin",
    },
    { id: "blog", label: "Blog", icon: <Pen size={18} />, path: "/admin/blog" },
    {
      id: "projects",
      label: "Projects",
      icon: <Rocket size={18} />,
      path: "/admin/projects",
    },
    {
      id: "skills",
      label: "Skills",
      icon: <Code size={18} />,
      path: "/admin/skills",
    },
    {
      id: "experience",
      label: "Experience",
      icon: <Briefcase size={18} />,
      path: "/admin/experience",
    },
    {
      id: "education",
      label: "Education",
      icon: <GraduationCap size={18} />,
      path: "/admin/education",
    },
    {
      id: "contact",
      label: "Contact Messages",
      icon: <Mail size={18} />,
      path: "/admin/contact",
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User size={18} />,
      path: "/admin/profile",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <motion.div
        className="w-64 bg-sidebar text-sidebar-foreground min-h-screen border-r border-sidebar-border flex flex-col"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo and Title */}
        <Link href="/admin" className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
            Admin Panel
          </h1>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.path}
                className={`flex items-center px-3 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-sidebar-primary/20 text-sidebar-primary"
                    : "hover:bg-sidebar-accent text-sidebar-foreground/80"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile & Theme Toggle */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {session?.user?.name?.[0] || "A"}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
            <button
              className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <div className="w-3.5 h-3.5 rounded-full bg-gray-500"></div>
              ) : theme === "dark" ? (
                <Sun size={14} />
              ) : (
                <Moon size={14} />
              )}
            </button>
          </div>
          <Button
            onClick={() => signOut()}
            variant="outline"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 flex items-center justify-center"
          >
            <LogOut size={14} className="mr-1" /> Sign Out
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 bg-background">
        {/* Main content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
