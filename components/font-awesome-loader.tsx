"use client";

import { useEffect } from "react";

export function FontAwesomeLoader() {
  useEffect(() => {
    // Check if Font Awesome is already loaded
    if (document.querySelector('link[href*="font-awesome"]')) {
      return;
    }

    // Create and append the Font Awesome stylesheet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    link.integrity = "sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==";
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    
    document.head.appendChild(link);

    return () => {
      // Cleanup on unmount (optional)
      const existingLink = document.querySelector('link[href*="font-awesome"]');
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, []);

  return null;
}

