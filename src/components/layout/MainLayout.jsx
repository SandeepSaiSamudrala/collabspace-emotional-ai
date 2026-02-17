
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open for desktop

  useEffect(() => {
    const handleResize = () => {
      // Set sidebar to open on large screens (>= 1024px), closed on small screens
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="h-screen flex">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className={`flex flex-col flex-1 ${isSidebarOpen ? 'lg:ml-60' : 'ml-0'}`}>
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

