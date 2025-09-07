"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ErrorPage() {
  const [errorMessage, setErrorMessage] = useState<string>("An error occurred during authentication");
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const error = searchParams.get("error");
    
    if (error) {
      switch (error) {
        case "CredentialsSignin":
          setErrorMessage("Invalid email or password. Please try again.");
          break;
        case "AccessDenied":
          setErrorMessage("Access denied. You don't have permission to access this resource.");
          break;
        case "OAuthAccountNotLinked":
          setErrorMessage("This email is already associated with another account.");
          break;
        case "OAuthSignInError":
          setErrorMessage("Error signing in with social provider.");
          break;
        case "OAuthCallbackError":
          setErrorMessage("Error during social authentication callback.");
          break;
        case "EmailCreateAccount":
          setErrorMessage("Error creating your account.");
          break;
        case "EmailSignIn":
          setErrorMessage("Error signing in with email.");
          break;
        case "SessionRequired":
          setErrorMessage("You need to be signed in to access this page.");
          break;
        default:
          setErrorMessage(`An error occurred during authentication: ${error}`);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="w-full max-w-md space-y-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            Authentication Error
          </h2>
        </div>
        
        <div className="rounded-md bg-red-900/30 p-4 mb-4 border border-red-500/50">
          <div className="flex">
            <div className="text-sm font-medium text-red-400">
              {errorMessage}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <Link href="/auth/signin">
            <motion.button
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </Link>
          
          <Link href="/">
            <motion.button
              className="inline-flex justify-center py-2 px-4 border border-cyan-500/30 rounded-lg shadow-sm text-sm font-medium text-white bg-transparent hover:bg-cyan-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go Home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
