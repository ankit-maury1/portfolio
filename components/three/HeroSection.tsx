// components/three/HeroSection.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThreeDScene } from "./ThreeDScene";
import Link from "next/link";
import { useProfileData } from "@/lib/client/profile-data";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.5
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10
    }
  }
};

export function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  
  // Use the shared profile data hook that maintains consistency across the app
  const { profile, isLoading } = useProfileData();
  
  const defaultTagline = "Building the future of the web";
  const taglines = profile.taglines || [defaultTagline];
  const fullText = taglines[currentTaglineIndex] || defaultTagline;
  const typingSpeed = 100;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Enhanced typewriter effect with multiple taglines
  useEffect(() => {
    if (isMounted && !isLoading && taglines.length > 0) {
      let currentIndex = 0;
      let isTyping = true; // Flag to track whether we're typing or erasing
      let timer: NodeJS.Timeout | null = null;
      
      const runTypingEffect = () => {
        timer = setInterval(() => {
          if (isTyping) {
            // Typing forward
            if (currentIndex <= fullText.length) {
              setTypedText(fullText.slice(0, currentIndex));
              currentIndex++;
            } else {
              // Reached the end of text, pause before erasing
              clearInterval(timer!);
              timer = null;
              setTimeout(() => {
                isTyping = false;
                runTypingEffect();
              }, 2000);
            }
          } else {
            // Erasing
            if (currentIndex > 0) {
              currentIndex--;
              setTypedText(fullText.slice(0, currentIndex));
            } else {
              // Finished erasing, pause before moving to next tagline
              clearInterval(timer!);
              timer = null;
              setTimeout(() => {
                // Switch to next tagline
                setCurrentTaglineIndex(prevIndex => {
                  const nextIndex = (prevIndex + 1) % taglines.length;
                  return nextIndex;
                });
                isTyping = true;
                runTypingEffect();
              }, 1000);
            }
          }
        }, isTyping ? typingSpeed : typingSpeed / 2); // Erase faster than typing
      };
      
      // Start the typing effect
      runTypingEffect();
      
      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [isMounted, isLoading, fullText, typingSpeed, taglines.length]);

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <ThreeDScene />
      
      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 md:px-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
            variants={itemVariants}
          >
            {isLoading ? (
              <span className="inline-block">Loading...</span>
            ) : (
              <>
                Hi, I'm <span className="text-primary">{profile.name || "Ankit Maury"}</span>
                {profile.role && (
                  <div className="text-xl md:text-2xl font-light text-gray-300 mt-2">
                    {profile.role}
                  </div>
                )}
              </>
            )}
          </motion.h1>
          
          <motion.div 
            className="text-xl md:text-3xl lg:text-4xl font-light mb-8 h-16"
            variants={itemVariants}
          >
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              <>
                <span className="text-secondary">&lt;</span>
                <span className="text-white">{typedText}</span>
                <span className="text-secondary inline-block animate-pulse">_</span>
                <span className="text-secondary">/&gt;</span>
              </>
            )}
          </motion.div>
          
          <motion.div className="flex flex-col md:flex-row gap-4 justify-center" variants={itemVariants}>
            <Link href="/projects">
              <motion.button 
                className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-all hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View My Work
              </motion.button>
            </Link>
            
            <Link href="/contact">
              <motion.button 
                className="px-8 py-3 rounded-full bg-transparent border border-cyan-500 text-white font-medium hover:bg-cyan-900/20 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Me
              </motion.button>
            </Link>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce"
            variants={itemVariants}
          >
            <div className="w-8 h-12 rounded-full border-2 border-cyan-500 flex justify-center items-start p-1">
              <div className="w-1.5 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-cyan-500 mt-2">Scroll down</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
