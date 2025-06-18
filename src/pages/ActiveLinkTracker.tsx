import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Modified to make children optional
interface ActiveLinkTrackerProps {
  children?: React.ReactNode;
}

const ActiveLinkTracker: React.FC<ActiveLinkTrackerProps> = ({ children }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState<string>(location.pathname);
  const prevPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    // Update active link when location changes
    if (location.pathname !== prevPathRef.current) {
      // Add a small delay to allow for transition animation (if any)
      const timer = setTimeout(() => {
        setActiveLink(location.pathname);
        prevPathRef.current = location.pathname;
      }, 50); // Reduced delay for responsiveness

      return () => clearTimeout(timer);
    }

    // Return empty function for paths where no timer is set
    return () => {};
  }, [location.pathname]);

  // Function to highlight active link in sidebar and add ARIA attribute
  useEffect(() => {
    // Select links within the sidebar navigation
    const links = document.querySelectorAll(".sidebar-nav a");

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      // Normalize paths for comparison (handle potential trailing slashes, etc.)
      const linkPath =
        href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
      const currentPath =
        activeLink.endsWith("/") && activeLink.length > 1
          ? activeLink.slice(0, -1)
          : activeLink;

      // Determine if the link is active
      // Exact match or parent path match for nested routes
      const isActive =
        currentPath === linkPath ||
        (linkPath !== "/" && currentPath.startsWith(linkPath + "/"));

      if (isActive) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page"); // Add ARIA current attribute
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current"); // Remove ARIA current attribute
      }
    });
  }, [activeLink]); // Rerun when activeLink changes

  return <>{children}</>;
};

export default ActiveLinkTracker;
