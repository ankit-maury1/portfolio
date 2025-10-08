import type { Metadata } from "next";
import "./globals.css";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import { geistSans, geistMono, orbitron, exo } from "@/lib/fonts";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster as UIToaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Portfolio | Ankit Maury ",
  description: "Ankit's portfolio website showcasing skills, projects, and professional achievements.",
  keywords: ["portfolio", "developer", "web development", "projects", "skills", ""],
  authors: [{ name: "Ankit Maury" }],
  creator: "Ankit Maury",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable, 
          geistMono.variable, 
          orbitron.variable,
          exo.variable,
          "min-h-screen antialiased bg-background font-sans flex flex-col"
        )}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex flex-col min-h-screen">
              <SiteHeader />
              <main className="flex-1 pt-16">
                {children}
              </main>
              <SiteFooter />
            </div>
            <SonnerToaster />
            <UIToaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
