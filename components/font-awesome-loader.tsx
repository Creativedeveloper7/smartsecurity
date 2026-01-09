"use client";

import { useEffect } from "react";

export function FontAwesomeLoader() {
  useEffect(() => {
    // Check if Font Awesome is already loaded
    const existingLink = document.querySelector('link[href*="font-awesome"]') as HTMLLinkElement;
    if (existingLink && existingLink.sheet) {
      return;
    }

    // Create and append the Font Awesome stylesheet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    link.integrity = "sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==";
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    
    // Add error handling
    link.onerror = () => {
      console.error("Failed to load Font Awesome stylesheet");
    };
    
    link.onload = () => {
      console.log("Font Awesome stylesheet loaded successfully");
    };
    
    document.head.appendChild(link);

    return () => {
      // Cleanup on unmount (optional)
      const linkToRemove = document.querySelector('link[href*="font-awesome"]');
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, []);

  return null;
}

