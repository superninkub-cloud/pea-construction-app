"use client";

import { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";

function AppContent({ children }: { children: ReactNode }) {
  const { isSidebarOpen, closeSidebar } = useSidebar();

  return (
    <div className="app-layout">
      {/* Overlay for mobile sidebar */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`} 
        onClick={closeSidebar}
      ></div>
      
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppContent>
        {children}
      </AppContent>
    </SidebarProvider>
  );
}
